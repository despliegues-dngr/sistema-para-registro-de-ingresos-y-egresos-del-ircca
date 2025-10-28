# 📦 Sistema de Backup y Restauración

## 🎯 Objetivo

Proporcionar un sistema robusto de backup/restore que permita:
- ✅ Protección contra pérdida de datos
- ✅ Migración entre dispositivos
- ✅ Recuperación ante desastres
- ✅ Cumplimiento normativo (AGESIC)

---

## 📊 Arquitectura del Sistema

### **Componentes Principales**

```
┌─────────────────────────────────────────────────────────┐
│                    SISTEMA DE BACKUP                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. BackupService (backupService.ts)                    │
│     └─ Crear backup cifrado completo                    │
│     └─ Listar backups                                   │
│     └─ Limpiar backups antiguos                         │
│                                                          │
│  2. useBackupExport (useBackupExport.ts)                │
│     └─ Exportar backup a archivo .ircca                 │
│     └─ Descargar en dispositivo                         │
│                                                          │
│  3. useBackupImport (useBackupImport.ts)                │
│     └─ Importar desde archivo .ircca                    │
│     └─ Validar integridad                               │
│     └─ Restaurar en IndexedDB                           │
│                                                          │
│  4. useAutoBackup (useAutoBackup.ts)                    │
│     └─ Backup automático cada 2 horas                   │
│     └─ Mantener últimos 5 backups                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Contenido del Backup

### **Stores Incluidos (6 total)**

| Store | Descripción | Crítico | Incluido |
|-------|-------------|---------|----------|
| `registros` | Ingresos/salidas | ✅ Sí | ✅ Sí |
| `usuarios` | Cuentas de operadores | ✅ Sí | ✅ Sí |
| `configuracion` | Ajustes del sistema | ✅ Sí | ✅ Sí |
| `personasConocidas` | Personas recurrentes | ✅ Sí | ✅ Sí |
| `audit_logs` | Logs de auditoría | ✅ Sí | ✅ Sí |
| `feedback_usuarios` | Encuestas | ⚠️ Importante | ✅ Sí |
| `backups` | Backups internos | ❌ No | ❌ No |

**Total:** 6 de 7 stores (excluye `backups` para evitar recursión)

---

## 🔐 Seguridad

### **Cifrado**

- **Algoritmo:** AES-256-GCM con PBKDF2 (encryptionService)
- **Clave:** Master key universal (VITE_BACKUP_MASTER_KEY)
- **Derivación:** PBKDF2 con 100,000 iteraciones
- **Formato:** Objeto con `{encrypted, salt, iv}` en base64

### **Validación**

```typescript
interface BackupContent {
  registros: unknown[]
  usuarios: unknown[]
  config: unknown[]
  personasConocidas: unknown[]
  auditLogs: unknown[]
  feedbackUsuarios: unknown[]
  timestamp: Date
  version: string      // "3.0"
  dbVersion: number    // 5
}
```

### **Integridad**

- ✅ Validación de estructura antes de importar
- ✅ Verificación de versión de BD
- ✅ Validación de cifrado correcto
- ✅ Detección de archivos corruptos

---

## 📝 Formato de Archivo

### **Extensión:** `.ircca`

### **Estructura:**

```json
{
  "id": "uuid-v4",
  "timestamp": "2025-10-27T19:30:00.000Z",
  "data": {
    "encrypted": "base64_encrypted_data...",
    "salt": "base64_salt...",
    "iv": "base64_iv..."
  },
  "encrypted": true,
  "size": 1234567,
  "exportedAt": "2025-10-27T19:35:00.000Z",
  "appVersion": "1.0.0",
  "format": "ircca-backup-v3.0"
}
```

### **Nombre de Archivo:**

```
ircca-backup-YYYYMMDD-HHMM.ircca

Ejemplo: ircca-backup-20251027-1930.ircca
```

---

## 🔄 Flujos de Trabajo

### **1. Backup Automático (Actual)**

```
Usuario trabaja normalmente
         ↓
Cada 2 horas → Sistema verifica
         ↓
¿Debe hacer backup? → Sí
         ↓
Crear backup cifrado
         ↓
Guardar en IndexedDB (store: backups)
         ↓
Limpiar backups antiguos (mantener 5)
         ↓
Notificar usuario
```

**Limitación:** Solo en IndexedDB, no exportable

---

### **2. Exportar Backup (NUEVO)**

```
Usuario → Configuración → Backups
         ↓
Click "Exportar último backup"
         ↓
Sistema obtiene backup de IndexedDB
         ↓
Crea archivo .ircca con metadata
         ↓
Descarga en dispositivo
         ↓
Usuario guarda en:
  - Pendrive USB
  - Google Drive
  - OneDrive
  - Disco externo
```

**Beneficio:** Backup externo seguro

---

### **3. Importar Backup (NUEVO)**

```
Tablet nueva o reseteada
         ↓
Usuario instala PWA
         ↓
Pantalla de Login → "Restaurar desde backup"
         ↓
Selecciona archivo .ircca
         ↓
Sistema usa clave maestra automáticamente
         ↓
Valida archivo y estructura
         ↓
¿Válido? → Sí
         ↓
Descifra con salt e iv incluidos
         ↓
Valida contenido y versión BD
         ↓
Restaura datos con UPSERT:
  - Usuarios existentes: actualiza
  - Usuarios nuevos: inserta
  - Otros datos: inserta
         ↓
Recarga aplicación
         ↓
Usuario puede trabajar normalmente
```

**Beneficio:** Recuperación total de datos

---

## 🚀 Uso de los Composables

### **Exportar Backup**

```typescript
import { useBackupExport } from '@/composables/useBackupExport'

const { 
  isExporting, 
  exportLatestBackup,
  createAndExportBackup 
} = useBackupExport()

// Exportar último backup
await exportLatestBackup()

// Crear nuevo backup y exportar
await createAndExportBackup()
```

### **Importar Backup**

```typescript
import { useBackupImport } from '@/composables/useBackupImport'

const { 
  isImporting, 
  importProgress,
  importBackup,
  validateBackupFileOnly 
} = useBackupImport()

// Validar archivo (preview)
const validation = await validateBackupFileOnly(file, sessionKey)
if (validation.valid) {
  console.log('Backup válido:', validation.info)
}

// Importar y restaurar
await importBackup(file, sessionKey, { clearExisting: true })
```

---

## ⚙️ Configuración

### **Variables de Entorno**

```env
# Intervalo de backup automático (ms)
VITE_BACKUP_INTERVAL=1800000  # 30 minutos

# Cantidad de backups a mantener
VITE_MAX_BACKUPS=10

# 🔐 Clave maestra para cifrado universal
# ⚠️ CRÍTICO: Misma clave en todos los dispositivos
VITE_BACKUP_MASTER_KEY=2025.Supervisor
```

### **App Store Config**

```typescript
config: {
  autoBackup: true,
  backupInterval: 120, // minutos
}
```

---

## 🧪 Testing

### **Casos de Prueba**

1. ✅ **Backup completo:** Verificar que incluya todos los stores
2. ✅ **Exportación:** Descargar archivo .ircca correctamente
3. ✅ **Importación válida:** Restaurar desde archivo válido
4. ✅ **Importación inválida:** Rechazar archivos corruptos
5. ✅ **Clave incorrecta:** Error al descifrar con clave errónea
6. ✅ **Versión incompatible:** Rechazar backups de versiones futuras
7. ✅ **Limpieza:** Mantener solo últimos 5 backups

---

## 📋 Checklist de Implementación

### **Backend (Completado)**

- [x] Actualizar `backupService.ts` para incluir todos los stores
- [x] Crear `useBackupExport.ts` para exportación
- [x] Crear `useBackupImport.ts` para importación
- [x] Implementar clave maestra universal
- [x] Formato mejorado con salt e iv separados
- [x] UPSERT para evitar duplicados de usuarios
- [x] Type guards para validación de tipos
- [x] Validación de integridad y versión
- [x] Manejo de errores robusto
- [x] Código limpio sin console.log

### **Frontend (Pendiente)**

- [ ] Agregar botón "Exportar Backup" en Configuración
- [ ] Agregar botón "Importar Backup" en Login
- [ ] Modal de confirmación antes de restaurar
- [ ] Barra de progreso durante importación
- [ ] Lista de backups disponibles con info

### **Documentación (Completado)**

- [x] Documentación técnica del sistema
- [x] Guía de uso para desarrolladores
- [ ] Manual de usuario para operadores

---

## 🎯 Próximos Pasos

1. **Implementar UI:**
   - Pantalla de gestión de backups en Configuración
   - Opción de restaurar en pantalla de Login

2. **Testing:**
   - Pruebas unitarias de composables
   - Pruebas E2E de flujo completo

3. **Mejoras futuras:**
   - Backup incremental (solo cambios)
   - Compresión de archivos
   - Backup en la nube (opcional)
   - Programación de backups

---

## 📚 Referencias

- `src/services/database/backupService.ts` - Servicio principal
- `src/composables/useBackupExport.ts` - Exportación
- `src/composables/useBackupImport.ts` - Importación
- `src/composables/useAutoBackup.ts` - Backup automático
- `src/services/encryptionService.ts` - Cifrado

---

## ⚠️ Advertencias

1. **Clave maestra:** Todos los dispositivos deben usar la MISMA clave maestra
2. **Seguridad:** La clave maestra debe configurarse en variables de entorno
3. **Compatibilidad:** Backups solo compatibles con misma versión o anterior
4. **Tamaño:** Archivos .ircca pueden ser grandes (varios MB)
5. **Usuarios duplicados:** Sistema usa UPSERT (actualiza existentes, inserta nuevos)
6. **Privacidad:** Nunca compartir archivos .ircca públicamente

---

**Última actualización:** 27 de octubre de 2025  
**Versión del sistema:** 3.0  
**Versión de BD:** 5  
**Estado:** ✅ Implementado y funcional
