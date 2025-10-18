# Arquitectura de Base de Datos (Parte 1) - Schema y Estructura

**Fecha:** 24-Sep-2025  
**Versión DB:** 3 (Actualizado: Seguridad personasConocidas)  
**Parte:** 1/2 - Schema y Estructura de Stores  
**Compliance:** Ley N° 18.331 Protección de Datos Personales (Uruguay)

> 📘 **Parte 2:** Ver [`06-database-part2-operations.md`](./06-database-part2-operations.md)

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

---

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

---

### 2.3 Store de Configuración: `configuracion`

**Propósito:** Settings del sistema y parámetros de configuración

**Configuración:**
```typescript
database.createObjectStore('configuracion', { keyPath: 'key' })
```

---

### 2.4 Store de Backups: `backups`

**Propósito:** Respaldos automáticos y manuales del sistema

**Configuración:**
```typescript
const backupsStore = database.createObjectStore('backups', { keyPath: 'id' })
backupsStore.createIndex('timestamp', 'timestamp', { unique: false })
```

---

### 2.5 Store de Auditoría: `audit_logs`

**Propósito:** Registro inmutable de eventos de seguridad para cumplimiento AGESIC SO.7

**Configuración:**
```typescript
const auditStore = database.createObjectStore('audit_logs', { keyPath: 'id' })
auditStore.createIndex('userId', 'userId', { unique: false })
auditStore.createIndex('eventType', 'eventType', { unique: false })
auditStore.createIndex('timestamp', 'timestamp', { unique: false })
auditStore.createIndex('action', 'action', { unique: false })
```

**Estructura:**
```typescript
interface AuditEvent {
  id: string                    // UUID único del evento
  userId: string                // ID del usuario que realizó la acción
  username: string              // Username del usuario (para consultas)
  eventType: 'auth' | 'user_management' | 'data_operation' | 'backup' | 'system_error'
  action: string                // Acción específica (ej: 'login.success', 'registro.created')
  details: Record<string, unknown>  // Detalles adicionales del evento
  timestamp: string             // ISO 8601 timestamp
  sessionId: string             // ID de sesión para trazabilidad
  ipAddress?: string            // IP del cliente (opcional)
  userAgent?: string            // User agent del navegador (opcional)
}
```

**Índices Implementados:**
```typescript
// Índice por userId - Para rastrear actividad de usuario específico
auditStore.createIndex('userId', 'userId', { unique: false })

// Índice por eventType - Para filtrar por tipo de evento
auditStore.createIndex('eventType', 'eventType', { unique: false })

// Índice por timestamp - Para consultas temporales
auditStore.createIndex('timestamp', 'timestamp', { unique: false })

// Índice por action - Para buscar acciones específicas
auditStore.createIndex('action', 'action', { unique: false })
```

**Eventos Registrados:**
- **auth:** login.success, login.failed, logout, session.timeout
- **user_management:** user.created, user.updated, password.changed
- **data_operation:** registro.created, registro.modified, data.export
- **backup:** backup.created, backup.restored
- **system_error:** encryption.failed, database.error

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

## 4. Patrones de Consulta Básicos

### 4.1 Consultas por Índice

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

---

**Documento dividido para cumplir límite de 300 líneas:**
- Parte 1 (Schema): Este documento (~250 líneas)
- Parte 2 (Operations): `06-database-part2-operations.md` (~210 líneas)

**Última actualización:** 17-Oct-2025
