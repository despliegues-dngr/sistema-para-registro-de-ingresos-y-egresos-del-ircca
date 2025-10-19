# 🔒 Índice Maestro de Seguridad - Sistema IRCCA

**⚠️ LECTURA OBLIGATORIA antes de cualquier modificación crítica del sistema**

---

## 📋 Propósito de Este Documento

Este índice centraliza **TODA** la documentación de seguridad del proyecto en un solo lugar, facilitando:
- ✅ Onboarding de nuevos desarrolladores en aspectos de seguridad
- ✅ Auditorías AGESIC y cumplimiento normativo
- ✅ Code reviews con foco en seguridad
- ✅ Respuesta rápida a incidentes

---

## 🎯 Estado de Seguridad del Proyecto

| Categoría | Estado | Evidencia |
|-----------|--------|-----------|
| **AGESIC Compliance** | ✅ 90.9% (10/11) | `03-agesic-compliance.md` |
| **OWASP Top 10:2021** | ✅ 90% (9/10) | `01-security-architecture.md` |
| **PWA Security** | ✅ 100/100 | `06-pwa-compliance-report.md` |
| **Tests de Seguridad** | ✅ 194 tests PASS | `02-security-implementation.md` |
| **Vulnerabilidades** | ✅ 0 críticas | `npm audit` |

**Última auditoría:** 18-Oct-2025  
**Reporte auditoría código:** `07-security-audit-report.md` - ✅ 100% cumplimiento

---

## 📚 Documentos de Seguridad (Orden de Lectura)

### **1. Fundamentos - Leer Primero** 🔴

#### [`01-security-architecture.md`](./01-security-architecture.md)
**Propósito:** Entender el modelo de seguridad del sistema

**Contenido:**
- ✅ Modelo de 4 Capas (Física → Aplicación → Datos → Almacenamiento)
- ✅ Sistema de Cifrado AES-256-GCM
- ✅ Autenticación y RBAC (Admin/Supervisor/Operador)
- ✅ Sistema de Auditoría Inmutable
- ✅ Estrategia de Backups 3-2-1
- ✅ Cumplimiento Ley 18.331 + AGESIC

**Cuándo leer:**
- 📌 Onboarding de nuevos desarrolladores
- 📌 Antes de diseñar nuevas features con datos sensibles
- 📌 Antes de modificar autenticación/autorización

**Líneas clave:** 54-96 (Sistema de cifrado + RBAC)

---

#### [`02-security-implementation.md`](./02-security-implementation.md)
**Propósito:** Implementar seguridad en el día a día

**Contenido:**
- ✅ Proceso de Code Review (4 niveles)
- ✅ Plan de Testing de Seguridad (194 tests)
- ✅ Gestión de Vulnerabilidades (npm audit)
- ✅ Logging y Monitoreo (`audit_logs` store)
- ✅ Separación de Entornos (Dev vs Prod)

**Cuándo leer:**
- 📌 Antes de cada Pull Request
- 📌 Al escribir tests de seguridad
- 📌 Configurar nuevos entornos
- 📌 Implementar logging de eventos

**Checklist crítico:** Líneas 50-61 (Pre-commit checklist)

---

### **2. Cumplimiento Normativo** 🟡

#### [`03-agesic-compliance.md`](./03-agesic-compliance.md)
**Propósito:** Verificar cumplimiento con Marco de Ciberseguridad AGESIC

**Contenido:**
- ✅ Checklist oficial AGESIC (10/11 requisitos cumplidos)
- ✅ Evidencias por cada requisito
- ✅ Estado de cumplimiento por sección:
  - **AD.1** Desarrollo Seguro: 3/3 ✅
  - **SO** Operaciones: 3/3 ✅
  - **GI** Gestión Incidentes: 1/2 ⚠️
  - **PD** Protección Datos: 3/4 ⚠️
  - **PWA** Progressive Web App: 4/4 ✅

**Cuándo consultar:**
- 📌 Preparación de auditoría AGESIC
- 📌 Reportes de cumplimiento a stakeholders
- 📌 Validación antes de deploy a producción

**Pendientes opcionales:** Líneas 95-100

---

#### [`04-authority-notification.md`](./04-authority-notification.md)
**Propósito:** Procedimiento de notificación a autoridades en caso de incidente

**Contenido:**
- ✅ Contactos CERTuy, URCDP, Unidad Cibercrimen
- ✅ Matriz de decisión por tipo de incidente
- ✅ Templates de notificación
- ✅ Plazos legales:
  - CERTuy: < 24 horas
  - URCDP: < 72 horas (brecha datos personales)
  - Cibercrimen: Inmediato (delitos)

**Cuándo consultar:**
- 🚨 Detección de brecha de seguridad
- 🚨 Acceso no autorizado a datos personales
- 🚨 Ataque de ransomware/malware
- 🚨 Pérdida de dispositivo con datos

**Contactos de emergencia:** Primeras líneas del documento

---

#### [`05-arco-rights-procedure.md`](./05-arco-rights-procedure.md)
**Propósito:** Procedimiento para solicitudes de derechos ARCO (Ley 18.331)

**Contenido:**
- ✅ Formulario de solicitud ARCO
- ✅ 3 vías de solicitud (presencial, email, postal)
- ✅ Responsables y plazos (10 días hábiles)
- ✅ Templates de respuesta para cada derecho:
  - **A**cceso - Consultar datos personales
  - **R**ectificación - Corregir datos incorrectos
  - **C**ancelación - Eliminar datos (con limitaciones)
  - **O**posición - Oponerse al tratamiento

**Cuándo consultar:**
- 📌 Recibir solicitud de un ciudadano sobre sus datos
- 📌 Implementar funcionalidad de exportación de datos
- 📌 Implementar funcionalidad de eliminación de cuenta

**Contacto responsable:** datospersonales@ircca.gub.uy

---

#### [`06-pwa-compliance-report.md`](./06-pwa-compliance-report.md)
**Propósito:** Evidencia de cumplimiento PWA y auditoría Lighthouse

**Contenido:**
- ✅ Scores Lighthouse v9:
  - Installable: PASS
  - PWA Optimized: 7/7 (100%)
  - Best Practices: 100/100
  - Accessibility: 96/100
  - SEO: 100/100
- ✅ Verificaciones manuales (cross-browser, offline, URLs)
- ✅ Métricas Core Web Vitals
- ✅ Funcionalidad offline con Service Worker

**Cuándo consultar:**
- 📌 Auditoría AGESIC PWA.1-4
- 📌 Validación de performance
- 📌 Verificación de instalabilidad
- 📌 Optimización de carga

**Reportes HTML:** `docs/reports/lighthouse-*.html`

---

#### [`07-security-audit-report.md`](./07-security-audit-report.md)
**Propósito:** Reporte de auditoría del código fuente vs requisitos NIST CSF

**Contenido:**
- ✅ Auditoría de implementación vs documentación
- ✅ Cumplimiento: 100% (24/24 controles)
- ✅ OBS-001 Resuelta: Timeout sesión unificado a 3 horas
- ✅ Matriz detallada de cumplimiento por requisito
- 💡 Recomendaciones de mejora (opcionales)

**Cuándo consultar:**
- 📌 Validación post-implementación
- 📌 Preparación auditoría externa
- 📌 Verificación de conformidad código-docs
- 📌 Baseline para futuras auditorías

**Hallazgos clave:** Sección 5 (Observaciones y Recomendaciones)

---

## 🎯 Flujos de Lectura por Situación

### **🆕 Nuevo Desarrollador - Onboarding de Seguridad**

**Lectura obligatoria (orden):**
1. Este índice (`00-SECURITY-INDEX.md`) - 10 min
2. `01-security-architecture.md` - 30 min
   - Enfocarse en: Modelo 4 capas, cifrado, RBAC
3. `02-security-implementation.md` - 20 min
   - Enfocarse en: Checklist pre-commit, testing

**Lectura opcional:**
4. `03-agesic-compliance.md` - Revisar checklist
5. `06-pwa-compliance-report.md` - Si trabaja en PWA

**Total:** ~1 hora para estar operativo

---

### **🔐 Code Review con Foco en Seguridad**

**Checklist de revisión:**

```bash
# 1. Verificar checklist pre-commit
[ ] Sin credenciales hardcodeadas
[ ] Datos sensibles cifrados
[ ] Validación de entrada implementada
[ ] RBAC verificado en rutas/componentes
[ ] Tests de seguridad incluidos
[ ] npm audit sin vulnerabilidades críticas

# 2. Verificar implementación según docs
[ ] Cifrado: Usar EncryptionService (AES-256-GCM)
[ ] Passwords: Usar EncryptionService.hashPassword (PBKDF2)
[ ] Validación: Según patrones en 01-security-architecture.md
[ ] Auditoría: Registrar eventos críticos en audit_logs

# 3. Ejecutar tests
pnpm test:unit    # 194 tests deben pasar
npm audit         # 0 vulnerabilidades críticas
```

**Referencias:**
- Checklist completo: `02-security-implementation.md` líneas 50-61
- Patrones de código seguro: `01-security-architecture.md` líneas 174-202

---

### **🚨 Respuesta a Incidente de Seguridad**

**Protocolo rápido:**

1. **Contener** (inmediato)
   - Aislar sistema afectado
   - Bloquear accesos no autorizados
   - Preservar evidencias

2. **Evaluar** (< 1 hora)
   - Tipo de incidente (ver `04-authority-notification.md`)
   - Datos afectados (personales vs operacionales)
   - Alcance del daño

3. **Notificar** (según plazos legales)
   - **< 24h:** CERTuy si es incidente de ciberseguridad
   - **< 72h:** URCDP si hay brecha de datos personales
   - **Inmediato:** Cibercrimen si es delito

4. **Remediar** (según criticidad)
   - Aplicar parches de seguridad
   - Cambiar credenciales comprometidas
   - Actualizar documentación

5. **Documentar** (post-incidente)
   - Actualizar `03-agesic-compliance.md` si aplica
   - Crear post-mortem en `docs/reports/`
   - Actualizar procedimientos si es necesario

**Contactos de emergencia:** Ver `04-authority-notification.md`

---

### **📊 Preparación de Auditoría AGESIC**

**Documentos a preparar:**

1. **Checklist oficial:** `03-agesic-compliance.md`
   - Imprimir sección "Resumen de Cumplimiento"
   - Preparar evidencias por cada requisito

2. **Evidencias técnicas:**
   - Reportes Lighthouse: `docs/reports/lighthouse-*.html`
   - Última ejecución de tests: Ejecutar `pnpm test:unit`
   - Último npm audit: Ejecutar `npm audit`

3. **Documentación de seguridad:**
   - `01-security-architecture.md` - Modelo de seguridad
   - `02-security-implementation.md` - Implementación y testing
   - `06-pwa-compliance-report.md` - Cumplimiento PWA

4. **Evidencias de procesos:**
   - Historial de commits (code review)
   - PRs con checklist de seguridad
   - Logs de auditoría (`audit_logs` store)

**Tiempo estimado de preparación:** 2-3 horas

---

## 🔑 Conceptos Clave de Seguridad

### **Sistema de Cifrado**

```typescript
// ✅ CORRECTO: Cifrar datos sensibles
import { EncryptionService } from '@/services/encryptionService'

const encrypted = await EncryptionService.encrypt(dataSensible)
// Resultado: { encryptedData, iv, salt }

// ✅ CORRECTO: Hash de contraseñas
const { hash, salt } = await EncryptionService.hashPassword(password)
// PBKDF2-SHA256, 100,000 iteraciones
```

**Datos que DEBEN cifrarse:**
- ✅ Cédulas de identidad
- ✅ Nombres y apellidos completos
- ✅ Destinos de visita
- ✅ Matrículas de vehículos
- ✅ Datos en `personasConocidas`

**Referencia:** `01-security-architecture.md` líneas 54-70

---

### **Control de Acceso (RBAC)**

```typescript
// ✅ CORRECTO: Guard de ruta
if (!authStore.isAdmin) {
  return { name: 'Unauthorized' }
}

// ✅ CORRECTO: En componente
<v-btn v-if="authStore.isAdmin || authStore.isSupervisor">
  Gestionar Usuarios
</v-btn>
```

**Roles y permisos:**
- **Admin:** Acceso total (gestión usuarios, config, backups)
- **Supervisor:** Supervisión (reportes, consultas, logs)
- **Operador:** Operaciones diarias (registro ingreso/salida)

**Referencia:** `01-security-architecture.md` líneas 72-82

---

### **Sistema de Auditoría**

```typescript
// ✅ CORRECTO: Registrar evento crítico
await auditStore.logAuthEvent(
  userId,
  username,
  'login.success',
  sessionId,
  { role: 'admin' }  // Metadata, NO datos personales
)

// ❌ INCORRECTO: No incluir datos personales en logs
await auditStore.logEvent({
  cedula: '12345678',  // ❌ NO
  nombre: 'Juan Pérez' // ❌ NO
})
```

**Eventos que DEBEN registrarse:**
- ✅ login.success / login.failed / login.blocked
- ✅ logout
- ✅ registro.created / registro.modified
- ✅ user.created / user.updated
- ✅ backup.created / backup.restored
- ✅ system_error

**Política de privacidad en logs:**
- ✅ SÍ: IDs técnicos, metadata, timestamps
- ❌ NO: Cédulas, nombres, destinos, matrículas

**Referencia:** `02-security-implementation.md` líneas 156-202

---

## ⚠️ Anti-Patrones y Errores Comunes

### **❌ NUNCA hacer esto:**

```typescript
// ❌ Hardcodear credenciales
const admin = { username: 'admin', password: '12345' }

// ❌ Usar contraseñas en texto plano
user.password = 'miContraseña123'

// ❌ Saltear validación de entrada
const cedula = req.body.cedula // Sin validar

// ❌ Incluir datos personales en logs
console.log('Login de', usuario.nombre, usuario.cedula)

// ❌ Usar datos reales en desarrollo
const testData = { cedula: '12345678', nombre: 'Juan Real' }
```

### **✅ SIEMPRE hacer esto:**

```typescript
// ✅ Variables de entorno
const admin = import.meta.env.VITE_ADMIN_CEDULA

// ✅ Hash de contraseñas
const { hash, salt } = await EncryptionService.hashPassword(password)

// ✅ Validar entrada
if (!/^\d{8}$/.test(cedula)) throw new Error('Cédula inválida')

// ✅ Logs sin datos personales
console.log('Login exitoso', { userId, role })

// ✅ Datos ficticios en desarrollo
const testData = { cedula: '11111111', nombre: 'Test Usuario' }
```

---

## 📞 Contactos de Seguridad

### **Reportar Vulnerabilidades**
- **Email:** security@ircca.gub.uy
- **Respuesta:** < 24 horas
- **Confidencialidad:** Garantizada hasta fix

### **Consultas sobre Datos Personales**
- **Email:** datospersonales@ircca.gub.uy
- **Responsable:** Custodio de Datos del IRCCA
- **Según:** Ley 18.331

### **Incidentes de Ciberseguridad**
- **CERTuy:** incidentes@cert.uy / +598 2901 2929
- **URCDP:** datospersonales@agesic.gub.uy
- **Cibercrimen:** 0800 8888

---

## 📊 Estado de Cumplimiento (Resumen)

| Requisito | Estado | Próxima Revisión |
|-----------|--------|------------------|
| AGESIC AD.1-A | ✅ 100% | Ene-2026 |
| AGESIC AD.1-B | ✅ 100% | Ene-2026 |
| AGESIC AD.1-C | ✅ 100% | Ene-2026 |
| AGESIC SO.1 | ✅ 100% | Nov-2025 |
| AGESIC SO.7 | ✅ 100% | Nov-2025 |
| AGESIC SO.4 | ✅ 100% | Nov-2025 |
| OWASP Top 10 | ✅ 90% | Nov-2025 |
| PWA Security | ✅ 100% | Dic-2025 |

**Última auditoría completa:** 09-Oct-2025  
**Próxima auditoría programada:** Ene-2026

---

## 🔄 Mantenimiento de Este Índice

**Actualizar cuando:**
- ✅ Se agregue nuevo documento de seguridad
- ✅ Cambien requisitos AGESIC
- ✅ Actualización de OWASP Top 10
- ✅ Incidente de seguridad significativo
- ✅ Auditoría externa

**Responsable:** Líder Técnico del Proyecto

---

**Versión:** 1.0  
**Fecha creación:** 18-Oct-2025  
**Última actualización:** 18-Oct-2025  
**Próxima revisión:** Ene-2026

---

**📌 Recuerda:** La seguridad es responsabilidad de TODO el equipo. Ante duda, consulta estos documentos o escala al responsable de seguridad.
