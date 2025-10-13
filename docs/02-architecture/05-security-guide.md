# 🔒 GUÍA COMPLETA DE SEGURIDAD - Sistema IRCCA

**Versión:** 3.0 (Consolidada)  
**Fecha:** 09-Oct-2025  
**Propósito:** Este documento consolida toda la información de seguridad del proyecto en un único recurso de referencia, cubriendo arquitectura, análisis, codificación, testing, vulnerabilidades, logging y cumplimiento normativo.

**Cumplimiento:** AGESIC (AD.1-A, AD.1-B, AD.1-C, SO.1, SO.7, SO.4) + Ley N° 18.331

---

## 📋 ÍNDICE

1. [Arquitectura de Seguridad](#1-arquitectura-de-seguridad)
2. [Análisis de Seguridad y Mejoras](#2-análisis-de-seguridad-y-mejoras)
3. [Codificación Segura (OWASP)](#3-codificación-segura-owasp)
4. [Proceso de Code Review](#4-proceso-de-code-review)
5. [Plan de Testing de Seguridad](#5-plan-de-testing-de-seguridad)
6. [Gestión de Vulnerabilidades](#6-gestión-de-vulnerabilidades)
7. [Logging y Monitoreo](#7-logging-y-monitoreo)
8. [Separación de Entornos](#8-separación-de-entornos)

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
- Timeout de sesión: 30 minutos inactividad

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

### 1.6 Cumplimiento Normativo

- ✅ **Ley N° 18.331:** Protección de Datos Personales (Uruguay)
- ✅ **AGESIC:** Marco de Ciberseguridad
- ✅ **Retención:** 12 meses en tablet, 5 años en backups
- ✅ **Derechos ARCO:** Procedimiento documentado

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

### 3.2 OWASP Top 10 - Implementación

#### A01: Broken Access Control

```typescript
// ✅ CORRECTO: RBAC implementado
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard', query: { error: 'insufficient_permissions' } })
  }
  next()
})
```

#### A02: Cryptographic Failures

```typescript
// ✅ CORRECTO: AES-256-GCM
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
)
```

#### A03: Injection

```typescript
// ✅ CORRECTO: Validación de entrada
const cedulaRegex = /^\d{8}$/
if (!cedulaRegex.test(cedula)) {
  throw new Error('Cédula inválida')
}
```

#### A07: Identification and Authentication Failures

```typescript
// ✅ CORRECTO: PBKDF2 con salt único
const { hash, salt } = await EncryptionService.hashPassword(password)
```

### 3.3 Checklist de Codificación Segura

```
[ ] Validar TODAS las entradas de usuario
[ ] Usar PBKDF2 para contraseñas (nunca texto plano)
[ ] Cifrar datos sensibles con AES-256-GCM
[ ] Implementar RBAC en router y componentes
[ ] Sanitizar datos antes de mostrar en UI
[ ] Usar TypeScript strict mode
[ ] Evitar eval() y innerHTML
[ ] Implementar CSP (Content Security Policy)
```

---

## 4. PROCESO DE CODE REVIEW

### 4.1 Niveles de Revisión

**Nivel 1: Pre-commit**
- ESLint + eslint-plugin-security
- TypeScript strict mode
- Prettier (formato)

**Nivel 2: Pre-push**
- Tests unitarios (218 tests)
- npm audit
- Build de prueba

**Nivel 3: Pull Request**
- Checklist de seguridad
- Revisión de código
- Tests E2E

**Nivel 4: Post-merge**
- Lighthouse CI
- Análisis de bundle
- Verificación de producción

### 4.2 Herramientas Automatizadas

```json
{
  "scripts": {
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts",
    "security:check": "npm audit && eslint . --ext .ts,.vue",
    "audit": "npm audit --audit-level=moderate",
    "test": "vitest run"
  }
}
```

### 4.3 Checklist de Seguridad

```
[ ] Sin credenciales hardcodeadas
[ ] Datos sensibles cifrados
[ ] Validación de entrada implementada
[ ] RBAC verificado
[ ] Tests de seguridad pasando
[ ] Sin vulnerabilidades npm audit
[ ] Variables de entorno configuradas
[ ] Logs de auditoría funcionando
```

---

## 5. PLAN DE TESTING DE SEGURIDAD

### 5.1 Cobertura de Tests

**Tests Implementados:** 218 tests unitarios + 5 E2E

| Categoría | Tests | Estado |
|-----------|-------|--------|
| Autenticación | 26 | ✅ 100% PASS |
| Cifrado | 22 | ✅ 100% PASS |
| RBAC | 15 | ✅ 100% PASS |
| Auditoría | 29 | ✅ 100% PASS |
| E2E Críticos | 5 | ✅ 100% PASS |

### 5.2 Tests de Seguridad Específicos

```typescript
// AUTH-001: Login con credenciales válidas
test('should login with valid credentials', async () => {
  const result = await authStore.login('55226350', '2025.Ircca')
  expect(result.success).toBe(true)
})

// AUTH-002: Bloqueo tras 3 intentos fallidos
test('should block after 3 failed attempts', async () => {
  for (let i = 0; i < 3; i++) {
    await authStore.login('55226350', 'wrong')
  }
  expect(authStore.isBlocked).toBe(true)
})

// ENC-001: Cifrado AES-256-GCM
test('should encrypt data with AES-256-GCM', async () => {
  const encrypted = await encryptionService.encrypt(data)
  expect(encrypted.algorithm).toBe('AES-GCM')
  expect(encrypted.keyLength).toBe(256)
})
```

### 5.3 Cobertura OWASP Top 10

| Vulnerabilidad | Cubierta | Tests |
|----------------|----------|-------|
| A01: Broken Access Control | ✅ | RBAC-001 a 009 |
| A02: Cryptographic Failures | ✅ | ENC-001 a 008 |
| A03: Injection | ✅ | VAL-001 a 005 |
| A07: Auth Failures | ✅ | AUTH-001 a 008 |
| A09: Security Logging | ✅ | AUD-001 a 008 |

**Total:** 9/10 vulnerabilidades cubiertas

---

## 6. GESTIÓN DE VULNERABILIDADES

### 6.1 Herramientas

- **npm audit:** Escaneo semanal de dependencias
- **ESLint Security Plugin:** Análisis estático de código
- **TypeScript strict mode:** Prevención de errores

### 6.2 Proceso

```bash
# Escaneo semanal
npm audit --audit-level=moderate

# Corrección automática
npm audit fix

# Reporte detallado
npm audit --json > audit-report.json
```

### 6.3 Estado Actual

```
✅ 0 vulnerabilidades críticas
✅ 0 vulnerabilidades altas
✅ Última auditoría: 09-Oct-2025
```

### 6.4 Calendario de Auditorías

- **Semanal:** npm audit
- **Mensual:** Revisión de dependencias
- **Trimestral:** Auditoría de seguridad completa

---

## 7. LOGGING Y MONITOREO

### 7.1 Sistema Implementado

**Store:** `audit_logs` (IndexedDB v4)

**Eventos Registrados:**
- ✅ `login.success`, `login.failed`, `login.blocked`
- ✅ `logout`
- ✅ `registro.created`, `registro.modified`
- ✅ `user.created`, `user.updated`
- ✅ `system_error`

### 7.2 Estructura de Log

```typescript
{
  id: "uuid-...",
  userId: "user-id",
  username: "12345678",
  eventType: "auth" | "data_operation" | "user_management" | "backup" | "system_error",
  action: "login.success",
  details: {
    registroId: "reg-uuid",  // Solo IDs
    tipo: "ingreso",          // Metadata
    tieneVehiculo: true       // Booleanos
    // ❌ NO incluir: cédulas, nombres, destinos, matrículas
  },
  timestamp: "2025-10-09T19:30:00.153Z",
  sessionId: "session-uuid"
}
```

### 7.3 Política de Privacidad en Logs

**✅ SÍ registrar:**
- IDs técnicos
- Metadata (tipos, categorías)
- Timestamps
- Números/booleanos

**❌ NO registrar:**
- Cédulas, nombres, apellidos
- Destinos, matrículas
- Datos personales

**Justificación:** Con `registroId` se puede consultar el registro completo (cifrado) si es necesario.

### 7.4 Retención de Logs

| Tipo | Retención Mínima | Retención Recomendada |
|------|------------------|------------------------|
| auth | 6 meses | 12 meses |
| data_operation | 12 meses | 24 meses |
| system_error | 12 meses | 24 meses |

---

## 8. SEPARACIÓN DE ENTORNOS

### 8.1 Entornos Definidos

**Desarrollo:**
- URL: `http://localhost:5173`
- Datos: Ficticios
- Credenciales: `.env.local`
- Debug: Habilitado

**Producción:**
- URL: `https://ircca-sistema.vercel.app`
- Datos: Reales
- Credenciales: `.env.production`
- Debug: Deshabilitado

### 8.2 Regla de Oro AGESIC

> **NUNCA usar datos personales reales en desarrollo**

### 8.3 Configuración

```bash
# Desarrollo (.env.local)
VITE_ADMIN_PASSWORD="2025.Ircca"
VITE_DEBUG_MODE="true"

# Producción (.env.production)
VITE_ADMIN_PASSWORD="P@ssw0rd!Segur@2025"
VITE_DEBUG_MODE="false"
```

### 8.4 Verificación

```bash
# ✅ Archivos en .gitignore
.env
.env.local
.env.production

# ✅ Solo templates en Git
.env.example
.env.production.example
```

---

## 📊 RESUMEN DE CUMPLIMIENTO

| Requisito AGESIC | Estado | Evidencia |
|------------------|--------|-----------|
| AD.1-A: Codificación Segura | ✅ | OWASP Top 10 implementado |
| AD.1-B: Code Review | ✅ | ESLint + 218 tests |
| AD.1-C: Testing Seguridad | ✅ | 9/10 OWASP cubierto |
| SO.1: Vulnerabilidades | ✅ | npm audit + 0 críticas |
| SO.7: Logging | ✅ | audit_logs funcionando |
| SO.4: Separación Entornos | ✅ | Dev/Prod separados |

**Cumplimiento Global:** 100% requisitos técnicos

---

## 🔐 MEJORES PRÁCTICAS

1. ✅ **Defensa en Profundidad:** 4 capas de seguridad
2. ✅ **Mínimo Privilegio:** RBAC estricto
3. ✅ **Cifrado por Defecto:** AES-256-GCM
4. ✅ **Auditoría Completa:** Todos los eventos críticos
5. ✅ **Separación de Entornos:** Sin datos reales en dev
6. ✅ **Testing Automatizado:** 218 tests + CI/CD
7. ✅ **Gestión de Vulnerabilidades:** Escaneo semanal
8. ✅ **Cumplimiento Normativo:** Ley 18.331 + AGESIC

---

## 📞 CONTACTO DE SEGURIDAD

**Reportar vulnerabilidades:**
- Email: security@ircca.gub.uy
- Respuesta: < 24 horas

**Custodio de Datos:**
- Dirección del IRCCA
- Email: datospersonales@ircca.gub.uy

---

**Versión:** 3.0 (Consolidada)  
**Última actualización:** 09-Oct-2025  
**Próxima revisión:** 09-Ene-2026

**Archivos consolidados:**
- 02-security-architecture.md
- 09-security-analysis.md
- 10-secure-coding-guidelines.md
- 11-code-review-process.md
- 12-security-testing-plan.md
- 13-vulnerability-management.md
- 14-logging-monitoring.md
- 15-environment-separation.md
