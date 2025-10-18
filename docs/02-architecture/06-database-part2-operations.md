# Arquitectura de Base de Datos (Parte 2) - Operaciones y Mantenimiento

**Fecha:** 24-Sep-2025  
**Versión DB:** 3 (Actualizado: Seguridad personasConocidas)  
**Parte:** 2/2 - Operaciones y Mantenimiento  
**Compliance:** Ley N° 18.331 Protección de Datos Personales (Uruguay)

> 📘 **Parte 1:** Ver [`06-database-part1-schema.md`](./06-database-part1-schema.md)

---

## 4. Patrones de Consulta Avanzados

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

## 📚 Referencias

**Documentación técnica:**
- [`05-security-part1-architecture.md`](./05-security-part1-architecture.md) - Arquitectura de seguridad completa
- [`05-security-part2-implementation.md`](./05-security-part2-implementation.md) - Implementación de seguridad

**Código fuente:**
- `src/services/databaseService.ts` - Servicio principal de base de datos
- `src/services/encryptionService.ts` - Servicio de cifrado
- `src/composables/useDatabase.ts` - Composable de acceso a IndexedDB

---

**Documento preparado por:** Equipo de Desarrollo IRCCA  
**Revisado por:** Mario BERNI (Custodio Técnico)  
**Aprobado por:** Tte. Rodrigo LOPEZ (Custodio Operativo)

**Documento dividido para cumplir límite de 300 líneas:**
- Parte 1 (Schema): `06-database-part1-schema.md` (~250 líneas)
- Parte 2 (Operations): Este documento (~210 líneas)

**Última actualización:** 17-Oct-2025
