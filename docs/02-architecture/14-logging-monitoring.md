# 📊 SISTEMA DE REGISTRO Y MONITOREO - Sistema IRCCA

**Versión:** 1.0  
**Fecha:** 08-Oct-2025  
**Propósito:** Documentar el sistema de logging y auditoría que registra eventos de seguridad críticos para investigación de incidentes y cumplimiento normativo.

**Cumplimiento:** Requisito SO.7 - Marco de Ciberseguridad AGESIC

---

## 📋 Resumen Ejecutivo

### 🎯 Objetivo

El sistema implementa un **registro de auditoría inmutable y cifrado** que:
- ✅ Registra eventos de seguridad críticos
- ✅ Permite investigación de incidentes
- ✅ Cumple con requisitos de AGESIC y URCDP
- ✅ Protege la integridad de los logs
- ✅ Facilita auditorías posteriores

---

## 🔍 Arquitectura del Sistema de Auditoría

### **Componentes:**

```
┌──────────────────────────────────────────────────────────┐
│                    APLICACIÓN                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Auth     │  │  Users     │  │  Backup    │        │
│  │  Module    │  │  Module    │  │  Module    │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │               │               │                 │
│        └───────────────┼───────────────┘                 │
│                        │                                  │
│                   ┌────▼────┐                            │
│                   │  Audit  │                            │
│                   │  Store  │                            │
│                   └────┬────┘                            │
│                        │                                  │
│  ┌─────────────────────▼─────────────────────┐          │
│  │        useDatabase Composable              │          │
│  │  - Cifrado AES-256                         │          │
│  │  - Almacenamiento en IndexedDB             │          │
│  └─────────────────────┬─────────────────────┘          │
│                        │                                  │
│  ┌─────────────────────▼─────────────────────┐          │
│  │           IndexedDB Browser                │          │
│  │  - Store: 'auditLogs'                      │          │
│  │  - Cifrado: AES-256-GCM                    │          │
│  │  - Retención: Permanente                   │          │
│  └────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 Eventos Registrados

### **Categorías de Eventos:**

| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| **auth** | Autenticación y sesiones | Login, logout, intentos fallidos |
| **user_management** | Gestión de usuarios | Crear, modificar, eliminar usuarios |
| **data_operation** | Operaciones con datos | Registros, búsquedas, exportaciones |
| **backup** | Respaldos y restauración | Backup creado, restaurado |
| **system_error** | Errores críticos | Fallos de cifrado, DB corrupta |

---

### **1. Eventos de Autenticación (auth)**

**¿Qué se registra?**

| Acción | Cuándo | Datos Incluidos |
|--------|--------|-----------------|
| `login.success` | Login exitoso | userId, username, role, sessionId |
| `login.failed` | Credenciales incorrectas | username, reason ('invalid_password') |
| `login.locked` | Usuario bloqueado | userId, reason ('max_attempts') |
| `logout` | Cierre de sesión | userId, sessionType ('manual'\|'timeout') |
| `session.timeout` | Sesión expirada | userId, duration |

**Ejemplo de evento:**

```typescript
{
  id: '8f7d6c5b-...',
  userId: 'user-123',
  username: 'mario.berni',
  eventType: 'auth',
  action: 'login.success',
  details: {
    role: 'admin',
    loginMethod: 'password',
    deviceInfo: 'Windows 11, Chrome 120'
  },
  timestamp: '2025-10-08T12:34:56.789Z',
  sessionId: 'session-abc-...',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
}
```

**Implementación:**

```typescript
// src/stores/auth.ts
import { useAuditStore } from './audit'

const audit = useAuditStore()

// Login exitoso
await audit.logEvent({
  userId: user.id,
  username: user.username,
  eventType: 'auth',
  action: 'login.success',
  details: { role: user.role }
})

// Login fallido
await audit.logEvent({
  userId: 'unknown',
  username: credentials.username,
  eventType: 'auth',
  action: 'login.failed',
  details: { reason: 'invalid_password' }
})
```

---

### **2. Eventos de Gestión de Usuarios (user_management)**

**¿Qué se registra?**

| Acción | Cuándo | Datos Incluidos |
|--------|--------|-----------------|
| `user.created` | Nuevo usuario | targetUserId, username, role |
| `user.updated` | Usuario modificado | targetUserId, changedFields, oldValues |
| `user.deleted` | Usuario eliminado | targetUserId, username, reason |
| `user.role_changed` | Cambio de rol | targetUserId, oldRole, newRole |
| `password.changed` | Contraseña cambiada | targetUserId, changedBy |

**Ejemplo:**

```typescript
{
  id: '1a2b3c4d-...',
  userId: 'admin-001',           // Quien realiza la acción
  username: 'mario.berni',
  eventType: 'user_management',
  action: 'user.created',
  details: {
    targetUserId: 'user-456',     // Usuario afectado
    targetUsername: 'juan.perez',
    role: 'operador',
    createdBy: 'admin-001'
  },
  timestamp: '2025-10-08T14:20:00.000Z',
  sessionId: 'session-xyz-...'
}
```

---

### **3. Eventos de Operaciones con Datos (data_operation)**

**¿Qué se registra?**

| Acción | Cuándo | Datos Incluidos |
|--------|--------|-----------------|
| `registro.created` | Nuevo registro de ingreso/salida | registroId, type, cedula (hash) |
| `registro.updated` | Modificación de registro | registroId, changedFields |
| `registro.deleted` | Eliminación de registro | registroId, reason |
| `data.export` | Exportación de datos | format (PDF/Excel), recordCount |
| `data.search` | Búsqueda de datos | query, resultCount |

**Ejemplo:**

```typescript
{
  id: 'abc123...',
  userId: 'user-789',
  username: 'operador.guardia',
  eventType: 'data_operation',
  action: 'registro.created',
  details: {
    registroId: 'reg-2025-001',
    type: 'ingreso',
    cedulaHash: 'sha256:abc...',  // Hash, no cédula real
    vehiculo: true,
    acompanantes: 2
  },
  timestamp: '2025-10-08T08:15:30.000Z',
  sessionId: 'session-...'
}
```

**⚠️ IMPORTANTE:** Nunca registrar datos personales en logs (cédulas, nombres completos). Usar hashes o IDs.

---

### **4. Eventos de Backup (backup)**

**¿Qué se registra?**

| Acción | Cuándo | Datos Incluidos |
|--------|--------|-----------------|
| `backup.created` | Backup generado | filename, size, recordCount |
| `backup.restored` | Backup restaurado | filename, recordsRestored |
| `backup.failed` | Error en backup | error, step |
| `backup.exported` | Backup exportado | format, destination |

**Ejemplo:**

```typescript
{
  id: 'backup-log-...',
  userId: 'admin-001',
  username: 'mario.berni',
  eventType: 'backup',
  action: 'backup.created',
  details: {
    filename: 'backup_IRCCA_2025-10-08_143000.json',
    size: 2048576,  // bytes
    recordCount: 1250,
    duration: 3500,  // ms
    compressed: true
  },
  timestamp: '2025-10-08T14:30:00.000Z',
  sessionId: 'session-...'
}
```

---

### **5. Eventos de Errores del Sistema (system_error)**

**¿Qué se registra?**

| Acción | Cuándo | Datos Incluidos |
|--------|--------|-----------------|
| `encryption.failed` | Error de cifrado | error, operation |
| `database.corrupted` | DB corrupta detectada | store, error |
| `storage.full` | Almacenamiento lleno | usage, quota |
| `critical.exception` | Excepción no manejada | error, stack, component |

**Ejemplo:**

```typescript
{
  id: 'error-...',
  userId: 'system',
  username: 'system',
  eventType: 'system_error',
  action: 'encryption.failed',
  details: {
    operation: 'encrypt',
    error: 'DOMException: Algorithm not supported',
    data_type: 'registro',
    timestamp_error: '2025-10-08T16:45:12.345Z'
  },
  timestamp: '2025-10-08T16:45:12.500Z',
  sessionId: 'n/a'
}
```

---

## 🔐 Seguridad de los Logs

### **Características de Seguridad:**

#### **1. Inmutabilidad**

```typescript
// src/stores/audit.ts
// Los logs NO se pueden modificar ni eliminar

/**
 * Agrega evento de auditoría.
 * NO existe función de edición o eliminación.
 */
async function logEvent(event: AuditEvent): Promise<void> {
  // Solo INSERT, nunca UPDATE ni DELETE
  await addRecord('auditLogs', event)
}
```

#### **2. Cifrado**

```typescript
// Todos los logs se cifran con AES-256-GCM antes de almacenarse
// - Key derivada con PBKDF2
// - 100,000 iteraciones
// - Salt único por registro
```

#### **3. Metadata Completa**

Cada evento incluye:
- ✅ Timestamp preciso (ISO 8601)
- ✅ Usuario que realizó la acción
- ✅ ID de sesión para trazabilidad
- ✅ IP Address (si disponible)
- ✅ User Agent para identificar dispositivo

#### **4. Protección contra Falsificación**

```typescript
// El ID del evento se genera con crypto.randomUUID()
// No secuencial = no predecible
id: crypto.randomUUID() // '8f7d6c5b-4e3f-...'
```

---

## 🔍 Consulta y Análisis de Logs

### **Interfaz de Consulta:**

```typescript
// src/stores/audit.ts

// Filtrar por tipo de evento
const authLogs = await loadLogs({ eventType: 'auth' })

// Filtrar por usuario
const userLogs = await loadLogs({ userId: 'user-123' })

// Filtrar por rango de fechas
const todayLogs = await loadLogs({
  startDate: new Date('2025-10-08T00:00:00'),
  endDate: new Date('2025-10-08T23:59:59')
})

// Filtrar por acción específica
const loginAttempts = await loadLogs({
  eventType: 'auth',
  action: 'login.failed'
})
```

### **Casos de Uso Típicos:**

#### **1. Investigar Intentos de Login Fallidos**

```typescript
const failedLogins = await audit.loadLogs({
  eventType: 'auth',
  action: 'login.failed',
  startDate: lastWeek,
  endDate: now
})

// Analizar patrones sospechosos
const suspiciousUsers = failedLogins
  .reduce((acc, log) => {
    acc[log.username] = (acc[log.username] || 0) + 1
    return acc
  }, {})
```

#### **2. Auditar Cambios en Usuarios**

```typescript
const userChanges = await audit.loadLogs({
  eventType: 'user_management',
  startDate: lastMonth,
  endDate: now
})

// Generar reporte
const report = userChanges.map(log => ({
  fecha: log.timestamp,
  admin: log.username,
  accion: log.action,
  usuario_afectado: log.details.targetUsername
}))
```

#### **3. Rastrear Actividad de Usuario Específico**

```typescript
const userActivity = await audit.loadLogs({
  userId: 'user-456',
  startDate: lastMonth
})

// Timeline completo del usuario
const timeline = userActivity.sort((a, b) => 
  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
)
```

---

## 📊 Panel de Auditoría (UI)

### **Vista de Administrador:**

**Ubicación:** `/admin/logs` (Solo rol admin)

**Características:**

```
┌────────────────────────────────────────────────────┐
│  📊 REGISTRO DE AUDITORÍA                          │
├────────────────────────────────────────────────────┤
│                                                     │
│  Filtros: [Tipo▼] [Usuario▼] [Fecha] [Acción]    │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ Timestamp       │ Usuario │ Evento │ Acción  │ │
│  ├─────────────────┼─────────┼────────┼─────────┤ │
│  │ 08/10 14:30:05 │ m.berni │ auth   │ login   │ │
│  │ 08/10 14:28:12 │ j.perez │ data   │ export  │ │
│  │ 08/10 14:20:00 │ m.berni │ user   │ created │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  [Exportar PDF] [Exportar Excel] [Limpiar Filtros]│
└────────────────────────────────────────────────────┘
```

### **Exportación de Logs:**

```typescript
// Generar reporte PDF de auditoría
const report = await audit.generateReport({
  format: 'pdf',
  startDate: lastMonth,
  endDate: now,
  eventTypes: ['auth', 'user_management']
})

// Guardar como evidencia para AGESIC
saveAs(report, `auditoria_IRCCA_${date}.pdf`)
```

---

## 🚫 Qué NO Se Registra

**Por privacidad y eficiencia:**

❌ **NO se registra:**
- Contenido completo de registros (solo IDs y cambios)
- Datos personales directos (cédulas, direcciones)
- Contraseñas (ni hasheadas)
- Contenido de búsquedas (solo el hecho de que se buscó)
- Navegación normal del usuario

✅ **SÍ se registra:**
- Acciones con impacto en seguridad
- Eventos críticos del sistema
- Modificaciones de datos
- Cambios administrativos
- Intentos fallidos de autenticación

---

## 📅 Retención y Purga de Logs

### **Política de Retención:**

| Tipo de Log | Retención Mínima | Retención Recomendada |
|-------------|------------------|------------------------|
| **auth** (login exitosos) | 6 meses | 12 meses |
| **auth** (login fallidos) | 12 meses | 24 meses |
| **user_management** | 24 meses | Permanente |
| **data_operation** | 12 meses | 24 meses |
| **backup** | 12 meses | 24 meses |
| **system_error** | 12 meses | Permanente |

**Cumplimiento URCDP:** Mínimo 12 meses para investigación de incidentes.

### **Proceso de Purga (Futuro):**

```typescript
// src/composables/useLogRetention.ts (a implementar)

async function purgeOldLogs(retentionDays: number): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
  
  // SOLO eliminar logs más antiguos que retención
  // NUNCA eliminar logs de system_error o user_management
  const deletedCount = await deleteOldAuditLogs(cutoffDate, {
    excludeTypes: ['system_error', 'user_management']
  })
  
  // Registrar la purga
  await audit.logEvent({
    eventType: 'system',
    action: 'logs.purged',
    details: { deletedCount, cutoffDate, retentionDays }
  })
}
```

---

## 📈 Métricas y Monitoreo

### **Indicadores Clave:**

```typescript
// Dashboard de métricas
const metrics = {
  // Eventos por tipo (últimas 24h)
  authEvents: 145,
  userManagementEvents: 3,
  dataOperations: 1250,
  backupEvents: 1,
  systemErrors: 0,  // ⚠️ Debe ser 0 en condiciones normales
  
  // Sesiones activas
  activeSessions: 5,
  
  // Alertas
  failedLogins: 2,      // ✅ Normal si < 5
  suspiciousActivity: 0  // ⚠️ Debe ser 0
}
```

### **Alertas Automáticas:**

```typescript
// Configurar umbrales de alerta
const ALERT_THRESHOLDS = {
  failedLoginsPerUser: 3,    // Bloquear usuario
  failedLoginsPerHour: 10,   // Posible ataque
  systemErrorsPerHour: 3,    // Problema crítico
  backupFailures: 1          // Revisar inmediatamente
}

// Monitoreo en tiempo real
watch(() => audit.recentLogs, (logs) => {
  const recentFailures = logs.filter(l => 
    l.action === 'login.failed' && 
    isWithinLastHour(l.timestamp)
  )
  
  if (recentFailures.length >= ALERT_THRESHOLDS.failedLoginsPerHour) {
    notifyAdmin('Posible ataque de fuerza bruta detectado')
  }
})
```

---

## ✅ Checklist de Cumplimiento

**Para auditoría AGESIC (SO.7):**

```markdown
[ ] ✅ Sistema de logging implementado
[ ] ✅ Eventos de seguridad registrados:
    [ ] ✅ Logins exitosos y fallidos
    [ ] ✅ Acciones de administradores
    [ ] ✅ Modificaciones de usuarios
    [ ] ✅ Errores críticos
    [ ] ✅ Operaciones con backups
[ ] ✅ Logs cifrados (AES-256-GCM)
[ ] ✅ Logs inmutables (no editables ni eliminables)
[ ] ✅ Metadata completa (timestamp, userId, sessionId)
[ ] ✅ Interface de consulta para admins
[ ] ✅ Capacidad de exportar reportes
[ ] ✅ Política de retención documentada (12+ meses)
[ ] ✅ Protección de privacidad (sin datos personales)
[ ] ✅ Tests unitarios del sistema de auditoría
```

---

## 📚 Ejemplos de Consultas para Auditoría

### **Reporte mensual para AGESIC:**

```typescript
async function generarReporteMensual(mes: number, año: number) {
  const startDate = new Date(año, mes - 1, 1)
  const endDate = new Date(año, mes, 0, 23, 59, 59)
  
  const logs = await audit.loadLogs({ startDate, endDate })
  
  const reporte = {
    periodo: `${mes}/${año}`,
    total_eventos: logs.length,
    logins_exitosos: logs.filter(l => l.action === 'login.success').length,
    logins_fallidos: logs.filter(l => l.action === 'login.failed').length,
    usuarios_creados: logs.filter(l => l.action === 'user.created').length,
    usuarios_modificados: logs.filter(l => l.action === 'user.updated').length,
    backups_realizados: logs.filter(l => l.action === 'backup.created').length,
    errores_criticos: logs.filter(l => l.eventType === 'system_error').length,
    registros_creados: logs.filter(l => l.action === 'registro.created').length,
    exportaciones: logs.filter(l => l.action === 'data.export').length
  }
  
  return reporte
}
```

### **Investigar incidente específico:**

```typescript
async function investigarIncidente(sessionId: string) {
  const logs = await audit.loadLogs({ 
    // Filtrar por sesión específica
    limit: 1000 
  })
  
  const sessionLogs = logs.filter(l => l.sessionId === sessionId)
  
  return {
    usuario: sessionLogs[0]?.username,
    inicio_sesion: sessionLogs[0]?.timestamp,
    acciones: sessionLogs.length,
    timeline: sessionLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }
}
```

---

## 📝 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 08-Oct-2025 | Mario BERNI | Versión inicial - Cumplimiento SO.7 |

---

**Custodio Técnico:** Mario BERNI  
**Próxima revisión:** 08-Ene-2026
