# Arquitectura de Base de Datos (IndexedDB)

**Fecha:** 24-Sep-2025  
**Versión DB:** 3 (Actualizado: Seguridad personasConocidas)  
**Compliance:** Ley N° 18.331 Protección de Datos Personales (Uruguay)

Este documento describe la arquitectura completa de almacenamiento local del Sistema IRCCA, implementada con IndexedDB y cifrado AES-256-GCM.

---

## 1. Resumen Ejecutivo

### 🔐 Seguridad Implementada
- **Cifrado:** AES-256-GCM para todos los datos sensibles
- **Derivación de claves:** PBKDF2 con credenciales de usuario (100,000 iteraciones)
- **Compliance:** Cumple Ley N° 18.331 Uruguay
- **Audit trail:** Registros inmutables de auditoría

### 🏗️ Arquitectura
- **Base de datos:** `IRCCA_Sistema_DB` (IndexedDB)
- **Librería:** `idb` (Jake Archibald) - Wrapper moderno de IndexedDB
- **Servicios:** Capa de cifrado transparente sobre IndexedDB nativo

---

## 2. Estructura de Stores

### 2.1 Store Principal: `registros`

**Propósito:** Almacenar registros de ingreso/salida cifrados

**Configuración:**
```typescript
const registrosStore = database.createObjectStore('registros', { keyPath: 'id' })
```

**Estructura de Datos:**
```typescript
interface RegistroCifrado {
  id: string                    // UUID único del registro
  tipo: 'ingreso' | 'salida'   // Tipo de registro
  timestamp: Date               // Fecha/hora del registro
  operadorId: string            // ID del operador que realizó el registro
  observaciones?: string        // Observaciones opcionales (sin cifrar)
  persona: EncryptedData        // Datos personales CIFRADOS
  vehiculo?: EncryptedData      // Datos de vehículo CIFRADOS (opcional)
  encrypted: true               // Flag que indica datos cifrados
}

interface EncryptedData {
  encrypted: string             // Datos cifrados en Base64
  iv: string                   // Vector de inicialización Base64
  salt: string                 // Salt para derivación de clave Base64
}
```

**Índices Implementados:**
```typescript
// Índice por timestamp - Para consultas temporales
registrosStore.createIndex('timestamp', 'timestamp', { unique: false })

// Índice por tipo - Para filtrar ingresos/salidas
registrosStore.createIndex('tipo', 'tipo', { unique: false })

// Índice por operador - Para auditoría y reportes
registrosStore.createIndex('operador', 'operadorId', { unique: false })
```

### 2.2 Store de Usuarios: `usuarios`

**Propósito:** Gestión de credenciales de operadores

**Configuración:**
```typescript
const usuariosStore = database.createObjectStore('usuarios', { keyPath: 'id' })
usuariosStore.createIndex('username', 'username', { unique: true })
```

**Estructura:**
```typescript
interface Usuario {
  id: string
  username: string              // Cédula del operador (único)
  passwordHash: string          // Hash PBKDF2 de la contraseña
  salt: string                  // Salt único por usuario
  nombre: string
  apellido: string
  role: 'admin' | 'operador'
  grado: string                 // Grado militar/policial
  created: Date
  lastLogin?: Date
}
```

### 2.3 Store de Configuración: `configuracion`

**Propósito:** Settings del sistema y parámetros de configuración

**Configuración:**
```typescript
database.createObjectStore('configuracion', { keyPath: 'key' })
```

### 2.4 Store de Backups: `backups`

**Propósito:** Respaldos automáticos y manuales del sistema

**Configuración:**
```typescript
const backupsStore = database.createObjectStore('backups', { keyPath: 'id' })
backupsStore.createIndex('timestamp', 'timestamp', { unique: false })
```

---

## 3. Cifrado y Seguridad

### 3.1 Algoritmos Implementados

**Cifrado Simétrico:**
- **Algoritmo:** AES-256-GCM
- **Modo:** Galois/Counter Mode (autenticado)
- **Longitud de clave:** 256 bits
- **Vector IV:** 96 bits aleatorio por operación

**Derivación de Claves:**
- **Algoritmo:** PBKDF2
- **Hash:** SHA-256
- **Iteraciones:** 100,000 (NIST recomendado)
- **Salt:** 16 bytes aleatorio por sesión

### 3.2 Flujo de Cifrado

```typescript
// 1. Derivación de clave de sesión
sessionKey = PBKDF2(userCredentials, sessionSalt, 100000, SHA-256)

// 2. Cifrado de datos sensibles
const encryptedData = {
  encrypted: AES-GCM-256.encrypt(JSON.stringify(data), sessionKey, iv),
  iv: base64(iv),
  salt: base64(sessionSalt)
}

// 3. Almacenamiento seguro
await indexedDB.put('registros', {
  id: uuid(),
  persona: encryptedData,
  vehiculo: encryptedData,
  // ... otros campos no sensibles
})
```

### 3.3 Datos Cifrados vs No Cifrados

**✅ Cifrados (Campos sensibles):**
- `persona.datosPersonales` (cédula, nombre, apellido)
- `persona.datosVisita` (destino)
- `vehiculo.datos` (tipo, matrícula)
- `acompanantes[]` (array completo)

**❌ NO Cifrados (Metadatos operacionales):**
- `id` (UUID)
- `tipo` ('ingreso'|'salida')
- `timestamp` (Date)
- `operadorId` (UUID)
- `observaciones` (opcional)
- `encrypted` (flag booleano)

---

## 4. Patrones de Consulta

### 4.1 Consultas Básicas

**Por ID (clave primaria):**
```typescript
const registro = await db.get('registros', registroId)
```

**Por timestamp (rango de fechas):**
```typescript
const tx = db.transaction('registros', 'readonly')
const index = tx.store.index('timestamp')
const registros = await index.getAll(IDBKeyRange.bound(fechaInicio, fechaFin))
```

**Por tipo (ingreso/salida):**
```typescript
const ingresos = await db.getAllFromIndex('registros', 'tipo', 'ingreso')
```

**Por operador (auditoría):**
```typescript
const registrosOperador = await db.getAllFromIndex('registros', 'operador', operadorId)
```

### 4.2 Consultas Complejas

**Registros de hoy:**
```typescript
const hoy = new Date()
const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
const finHoy = new Date(inicioHoy.getTime() + 24*60*60*1000 - 1)

const registrosHoy = await db.getAllFromIndex('registros', 'timestamp', 
  IDBKeyRange.bound(inicioHoy, finHoy))
```

**Búsqueda con descifrado (después de obtener registros):**
```typescript
// 1. Obtener registros cifrados
const registros = await db.getAll('registros')

// 2. Descifrar y filtrar
const registrosFiltrados = []
for (const registro of registros) {
  const personaDescifrada = await decryptionService.decrypt(
    registro.persona, sessionKey
  )
  
  if (personaDescifrada.cedula.includes(terminoBusqueda)) {
    registrosFiltrados.push({
      ...registro,
      datosPersonales: personaDescifrada
    })
  }
}
```

---

## 5. Servicios de Acceso

### 5.1 DatabaseService

**Ubicación:** `src/services/databaseService.ts`

**Responsabilidades:**
- Inicialización con clave de sesión de usuario
- Cifrado/descifrado automático de datos sensibles
- Interfaz de alto nivel para operaciones CRUD

**Métodos principales:**
```typescript
class DatabaseService {
  async initializeWithSessionKey(userCredentials: string): Promise<void>
  async saveRegistro(registro: RegistroEntry): Promise<Result>
  async getRegistros(filters?: FilterOptions): Promise<RegistroEntry[]>
  clearSession(): void
}
```

### 5.2 RegistroService  

**Ubicación:** `src/services/registroService.ts`

**Responsabilidades:**
- Lógica de negocio para registros de ingreso/salida
- Coordinación entre UI y DatabaseService
- Validaciones y transformaciones de datos

### 5.3 useDatabase Composable

**Ubicación:** `src/composables/useDatabase.ts`

**Responsabilidades:**
- Abstracción de IndexedDB nativo
- Inicialización y configuración de stores
- Operaciones básicas de base de datos

---

## 6. Política de Retención

### 6.1 Datos Activos
- **Duración:** 12 meses en tablet
- **Ubicación:** IndexedDB local
- **Acceso:** Inmediato para operadores

### 6.2 Respaldos Automáticos

**Sistema Automático Implementado:**
- **Intervalo:** Cada 2 horas (configurable en `appStore.config.backupInterval`)
- **Verificación:** Cada 30 minutos para evaluar si debe ejecutar backup
- **Retención:** Últimos 5 backups automáticamente guardados
- **Almacenamiento:** IndexedDB local con cifrado AES-256-GCM
- **Limpieza automática:** Elimina backups antiguos al crear uno nuevo
- **Cobertura temporal:** Aproximadamente 10 horas de historial (cubre turno completo)

**Contenido de Cada Backup:**
- Todos los registros de ingresos/egresos (cifrados)
- Usuarios del sistema
- Configuración de la aplicación
- Personas conocidas (cache de autocompletado cifrado)
- Metadata: timestamp, versión, tamaño

**Política de Retención:**
- **Nivel 1:** Backup automático cada 2 horas (local)
- **Nivel 2:** Backup manual bajo demanda (local)
- **Nivel 3:** Exportación manual para archivo externo (planificado)

### 6.3 Archivado
- **Duración:** 5 años en backups externos
- **Formato:** Archivos JSON cifrados
- **Acceso:** Solo para auditorías autorizadas

---

## 7. Consideraciones de Performance

### 7.1 Optimizaciones Implementadas
- **Índices selectivos:** Solo en campos consultados frecuentemente
- **Transacciones eficientes:** Uso de `tx.done` para commits explícitos
- **Lazy loading:** Descifrado solo cuando se necesita visualizar
- **Batch operations:** Múltiples registros en una transacción

### 7.2 Limitaciones de Navegador
- **Cuota de almacenamiento:** ~1GB typical (verificar con `navigator.storage.estimate()`)
- **Persistencia:** Solicitar persistent storage para evitar eviction
- **Concurrencia:** IndexedDB handle transacciones automáticamente

---

## 8. Migración y Versionado

### 8.1 Esquema de Versiones
```typescript
const db = await openDB('IRCCA_Sistema_DB', 1, {
  upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion < 1) {
      // Crear stores iniciales
      createStores(db)
    }
    // Futuras migraciones aquí
  }
})
```

### 8.2 Estrategia de Migración
- **Backward compatibility:** Mantener compatibilidad con versiones anteriores
- **Data migration:** Scripts automáticos para actualizar estructura
- **Rollback plan:** Backups automáticos antes de migraciones

---

## 9. Troubleshooting

### 9.1 Errores Comunes

**"Base de datos no inicializada"**
- Verificar que `useDatabase().initDatabase()` se ejecutó
- Confirmar que IndexedDB está disponible en el navegador

**"DatabaseService debe ser inicializado"**  
- Llamar `databaseService.initializeWithSessionKey(credentials)` primero
- Verificar que el usuario está autenticado

**Datos no descifrados**
- Confirmar que la sessionKey es la misma usada para cifrar
- Verificar que el usuario tiene los permisos correctos

### 9.2 Debugging
```typescript
// Habilitar logs detallados
localStorage.setItem('DEBUG_DB', 'true')

// Inspeccionar IndexedDB
// Chrome DevTools > Application > IndexedDB > IRCCA_Sistema_DB
```

---

## 10. Compliance y Auditoría

### 10.1 Ley N° 18.331 (Uruguay)
- ✅ **Cifrado de datos personales:** Implementado con AES-256-GCM
- ✅ **Consentimiento informado:** Registrado en formularios
- ✅ **Derecho de acceso:** Funcionalidad de consulta implementada
- ✅ **Derecho de rectificación:** Edición de registros (futuro)
- ✅ **Minimización de datos:** Solo campos necesarios
- ✅ **Audit trail:** Logs inmutables de todas las operaciones

### 10.2 Registros de Auditoría
Todos los eventos se registran automáticamente:
- Login/logout de usuarios
- Creación/modificación/eliminación de registros
- Acceso a datos sensibles
- Operaciones de backup/restore
- Errores de sistema

---

**Documento preparado por:** Equipo de Desarrollo IRCCA  
**Revisado por:** Mario BERNI (Custodio Técnico)  
**Aprobado por:** Tte. Rodrigo LOPEZ (Custodio Operativo)
