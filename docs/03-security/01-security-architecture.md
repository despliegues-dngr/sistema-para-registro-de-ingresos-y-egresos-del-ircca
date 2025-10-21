# 🔒 GUÍA COMPLETA DE SEGURIDAD - Sistema IRCCA (Parte 1)

**Versión:** 3.0 (Consolidada)  
**Fecha:** 09-Oct-2025  
**Parte:** 1/2 - Arquitectura y Codificación Segura

> 📘 **Parte 2 (Implementación):** Ver [`05-security-part2-implementation.md`](./05-security-part2-implementation.md)

**Cumplimiento:** AGESIC (AD.1-A, AD.1-B, AD.1-C, SO.1, SO.7, SO.4) + Ley N° 18.331

---

## 📋 ÍNDICE GENERAL

**Parte 1 (Este documento):**
1. Arquitectura de Seguridad
2. Análisis de Seguridad y Mejoras
3. Codificación Segura (OWASP)

**Parte 2:**
4. Proceso de Code Review
5. Plan de Testing de Seguridad
6. Gestión de Vulnerabilidades
7. Logging y Monitoreo
8. Separación de Entornos

---

## 1. ARQUITECTURA DE SEGURIDAD

### 1.1 Modelo de 4 Capas

La seguridad del sistema se estructura en un modelo de **4 capas de protección**:

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 4: FÍSICA - Modo Kiosco + Control de Dispositivo     │
├─────────────────────────────────────────────────────────────┤
│  CAPA 3: APLICACIÓN - Autenticación + Roles + Sesiones     │
├─────────────────────────────────────────────────────────────┤  
│  CAPA 2: DATOS - Cifrado AES-256 + PBKDF2 + Validación     │
├─────────────────────────────────────────────────────────────┤
│  CAPA 1: ALMACENAMIENTO - IndexedDB + Respaldos + Logs     │
└─────────────────────────────────────────────────────────────┘
```

**Amenazas Mitigadas:**
- ✅ Acceso físico no autorizado → Modo Kiosco
- ✅ Extracción de datos locales → Cifrado AES-256-GCM
- ✅ Uso indebido del sistema → RBAC
- ✅ Pérdida de datos → Estrategia 3-2-1 de backups
- ✅ Actividad maliciosa → Auditoría inmutable

### 1.2 Sistema de Cifrado

**Algoritmo:** AES-256-GCM (Galois/Counter Mode)

**Gestión de Claves:**
- Clave de sesión derivada con PBKDF2 (100,000 iteraciones)
- Salt único por usuario (32 bytes)
- IV único por operación de cifrado (12 bytes)
- Sin claves maestras hardcodeadas

**Datos Cifrados:**
- ✅ Información personal (cédulas, nombres, apellidos)
- ✅ Destinos de visita
- ✅ Matrículas de vehículos
- ✅ Backups automáticos
- ✅ Datos en `personasConocidas`

### 1.3 Autenticación y RBAC

**Roles Implementados:**
- **Administrador:** Acceso total (gestión usuarios, configuración, backups)
- **Supervisor:** Supervisión (reportes, estadísticas, consulta logs)
- **Operador:** Operaciones diarias (registro ingreso/salida)

**Protección:**
- Contraseñas hasheadas con PBKDF2-SHA256
- Bloqueo automático tras 3 intentos fallidos
- **Sesiones:**
- Timeout de sesión: 3 horas inactividad
- Advertencia: 5 minutos antes de expirar
- Re-autenticación requerida tras expiración

### 1.4 Sistema de Auditoría

**Eventos Registrados:**
- Login/logout (exitosos y fallidos)
- Creación/modificación de registros
- Gestión de usuarios
- Backups y restauraciones
- Errores críticos

**Características:**
- Logs cifrados con AES-256-GCM
- Inmutables (no editables/eliminables)
- Metadata completa: userId, timestamp, sessionId, action

### 1.5 Estrategia de Backups (3-2-1)

- **Nivel 1:** Automático diario (últimos 7 días)
- **Nivel 2:** Automático semanal (últimas 4 semanas)
- **Nivel 3:** Manual mensual (exportación cifrada)

### 1.6 Cumplimiento Normativo (CN.1)

- ✅ **Ley N° 18.331:** Protección de Datos Personales (Uruguay)
- ✅ **Ley N° 20.327:** Ciberdelitos (Uruguay)
- ✅ **AGESIC:** Marco de Ciberseguridad (NIST CSF adaptado)
- ✅ **Retención:** 12 meses en tablet, 5 años en backups
- ✅ **Derechos ARCO:** Procedimiento documentado (`05-arco-rights-procedure.md`)

**Evidencia:** Este documento + `03-agesic-compliance.md` + `04-authority-notification.md`

### 1.7 Gobernanza de Seguridad (AGESIC GV)

#### GV-1: Responsable de Seguridad de la Información (OR.1)

**Rol designado:** Desarrollador Líder / Arquitecto de Sistema

**Responsabilidades:**
- Supervisar implementación de controles de seguridad
- Revisar incidentes y vulnerabilidades reportadas
- Aprobar cambios críticos de seguridad (autenticación, cifrado, RBAC)
- Coordinación con CERTuy/URCDP en caso de incidentes
- Validar cumplimiento de checklist pre-commit
- Ejecutar auditorías de seguridad trimestrales

**Contacto:** security@ircca.gub.uy

**Evidencia:** Este documento (designación formal) + `00-SECURITY-INDEX.md`

#### GV-2: Política de Seguridad del Sistema (PS.1)

**Objetivos de Seguridad:**

1. **Proteger Datos Personales** según Ley 18.331
   - Cifrado AES-256-GCM para datos sensibles
   - Almacenamiento seguro en IndexedDB
   - Procedimiento ARCO implementado

2. **Garantizar Disponibilidad** del sistema
   - Disponibilidad objetivo: 99% (operación offline-first)
   - Backups automáticos diarios (estrategia 3-2-1)
   - Recuperación < 2 horas en caso de fallo

3. **Prevenir Accesos No Autorizados**
   - RBAC con 3 roles (Admin/Supervisor/Operador)
   - Autenticación obligatoria con contraseñas hasheadas (PBKDF2)
   - Bloqueo tras 3 intentos fallidos + timeout 15 min (desbloqueo automático)

4. **Asegurar Integridad de Datos**
   - Auditoría inmutable de eventos críticos
   - Validación de entrada en todos los formularios
   - Logs cifrados sin exposición de datos personales

5. **Cumplir con Marco AGESIC**
   - Cumplimiento actual: 90.9% (10/11 requisitos)
   - Objetivo: 100% antes de Ene-2026
   - Auditoría externa trimestral

**Evidencia:** Este documento + `00-SECURITY-INDEX.md` (flujos de trabajo)

### 1.8 Seguridad Física del Dispositivo (PR-4 / SF.1, SF.4)

**Requisitos Obligatorios de la Tablet:**

1. ✅ **Bloqueo de pantalla** (PIN mínimo 6 dígitos o biometría)
   - Auto-lock tras 5 minutos de inactividad
   - Reintentos limitados (10 máximo antes de bloqueo total)

2. ✅ **Cifrado de disco completo** habilitado
   - Android: Configuración → Seguridad → Cifrar dispositivo
   - iOS: Habilitado por defecto con PIN

3. ✅ **Modo Kiosco** configurado
   - Previene acceso a otras apps
   - Solo PWA IRCCA accesible
   - Configurado mediante MDM (Mobile Device Management)

4. ✅ **Políticas de red**
   - No conectar a WiFi públicas sin VPN
   - Bluetooth deshabilitado cuando no se usa
   - NFC solo para funciones autorizadas

**Políticas Operativas:**

- 📍 **Ubicación:** Tablet permanece en área controlada (puesto de control)
- 🔒 **Custodia:** Responsable designado por turno
- 🚨 **Pérdida/Robo:** Notificar inmediatamente a security@ircca.gub.uy
  - Plazo: < 1 hora desde detección
  - Acción: Borrado remoto vía MDM (si disponible)
- 🔄 **Actualizaciones:** Parches de seguridad mensuales del SO

**Evidencia:** Checklist de configuración inicial + política de uso de dispositivos móviles

---

## 2. ANÁLISIS DE SEGURIDAD Y MEJORAS

### 2.1 Mejoras Implementadas (v2.0)

**Antes:**
- ❌ Credenciales hardcodeadas en código
- ❌ Visibles en bundle de producción

**Ahora:**
- ✅ Credenciales desde variables de entorno
- ✅ No expuestas en bundle
- ✅ Fácil rotación de contraseñas

### 2.2 Vectores de Ataque Mitigados

| Ataque | Mitigación | Estado |
|--------|------------|--------|
| Acceso al código fuente | Variables de entorno | ✅ |
| Acceso a IndexedDB | Cifrado AES-256-GCM | ✅ |
| Fuerza bruta | PBKDF2 100K iteraciones | ✅ |
| Exposición en Git | `.gitignore` configurado | ✅ |

### 2.3 Configuración Segura

```bash
# .env.production
VITE_ADMIN_CEDULA="55226350"
VITE_ADMIN_PASSWORD="P@ssw0rd!Muy$egur@2025"
```

**Requisitos de contraseña:**
- Mínimo 12 caracteres
- Mayúsculas, minúsculas, números, símbolos
- No palabras del diccionario

---

## 3. CODIFICACIÓN SEGURA (OWASP)

### 3.1 Estándares de Referencia

- **OWASP Top 10:2021**
- **CWE/SANS Top 25**
- **NIST SP 800-63B**

### 3.2 Vulnerabilidades Cubiertas

| ID | Vulnerabilidad | Mitigación | Estado |
|----|----------------|------------|--------|
| A01 | Broken Access Control | RBAC + Guards | ✅ |
| A02 | Cryptographic Failures | AES-256-GCM | ✅ |
| A03 | Injection | Validación + TypeScript | ✅ |
| A04 | Insecure Design | Security by Design | ✅ |
| A05 | Security Misconfiguration | Variables de entorno | ✅ |
| A07 | Identification/Auth Failures | PBKDF2 + Bloqueo | ✅ |
| A08 | Software/Data Integrity | Hashes + Auditoría | ✅ |
| A09 | Security Logging Failures | audit_logs Store | ✅ |
| A10 | Server-Side Request Forgery | N/A (PWA offline) | ⚪ |

**Cobertura:** 9/10 vulnerabilidades (90%)

### 3.3 Prácticas Implementadas

```typescript
// ✅ Validación de entrada
function validarCedula(cedula: string): boolean {
  return /^\d{8}$/.test(cedula)
}

// ✅ Sanitización
function sanitizarNombre(nombre: string): string {
  return nombre.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
}

// ✅ RBAC en guards
if (!authStore.isAdmin) {
  return { name: 'Unauthorized' }
}
```

### 3.4 Checklist de Desarrollo

```
[ ] Usar PBKDF2 para contraseñas (nunca texto plano)
[ ] Cifrar datos sensibles con AES-256-GCM
[ ] Implementar RBAC en router y componentes
[ ] Sanitizar datos antes de mostrar en UI
[ ] Usar TypeScript strict mode
[ ] Evitar eval() y innerHTML
[ ] Implementar CSP (Content Security Policy)
```

---

**Documento dividido para cumplir límite de 300 líneas:**
- Parte 1 (Arquitectura): Este documento (~210 líneas)
- Parte 2 (Implementación): `05-security-part2-implementation.md` (~250 líneas)

**Archivos consolidados originalmente:**
- 02-security-architecture.md
- 09-security-analysis.md
- 10-secure-coding-guidelines.md
- 11-code-review-process.md
- 12-security-testing-plan.md
- 13-vulnerability-management.md
- 14-logging-monitoring.md
- 15-environment-separation.md
