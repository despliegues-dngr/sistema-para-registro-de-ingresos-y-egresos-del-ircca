# 🧪 PLAN DE PRUEBAS DE SEGURIDAD - Sistema IRCCA

**Versión:** 1.0  
**Fecha:** 08-Oct-2025  
**Propósito:** Plan formal de pruebas de seguridad que documenta los casos de prueba, metodología y criterios de aceptación para garantizar la seguridad del sistema.

**Cumplimiento:** Requisito AD.1-C - Marco de Ciberseguridad AGESIC

---

## 📋 Resumen Ejecutivo

### 🎯 Objetivo

Documentar y ejecutar pruebas de seguridad que validen:
- Autenticación y autorización robustas
- Protección de datos mediante cifrado
- Validación de inputs y prevención de inyecciones
- Control de acceso basado en roles (RBAC)
- Manejo seguro de sesiones

### 📊 Cobertura Actual

| Categoría | Tests | Estado |
|-----------|-------|--------|
| **Autenticación** | 26 tests | ✅ 100% |
| **Cifrado de Datos** | 22 tests | ✅ 100% |
| **Control de Acceso (RBAC)** | 15 tests | ✅ 100% |
| **Validación de Inputs** | 37 tests | ✅ 100% |
| **Auditoría** | 29 tests | ✅ 100% |
| **Tests E2E Críticos** | 5 flujos | ✅ 100% |
| **TOTAL** | **218 tests unitarios** | ✅ |

---

## 1️⃣ PRUEBAS DE AUTENTICACIÓN

### Archivo: `src/stores/__tests__/auth.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **AUTH-001** | Login exitoso con credenciales válidas | `isAuthenticated = true` |
| **AUTH-002** | Login fallido con credenciales inválidas | Excepción, `isAuthenticated = false` |
| **AUTH-003** | Bloqueo después de 3 intentos fallidos | `canAttemptLogin = false` |
| **AUTH-004** | Reset de intentos después de login exitoso | `loginAttempts = 0` |
| **AUTH-005** | Logout limpia sesión | `user = null`, `isAuthenticated = false` |
| **AUTH-006** | Registro de usuario nuevo | Usuario creado con password hasheado |
| **AUTH-007** | Prevención de cédulas duplicadas | Excepción: "Ya existe un usuario" |
| **AUTH-008** | Validación de términos y condiciones | Excepción si no acepta términos |

### Hashing de Contraseñas: `src/services/__tests__/encryptionService.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **HASH-001** | Generación de hash PBKDF2 | Hash y salt únicos generados |
| **HASH-002** | Hashes únicos para misma contraseña | `hash1 ≠ hash2` (diferentes salt) |
| **HASH-003** | Verificación de contraseña correcta | `verifyPassword = true` |
| **HASH-004** | Rechazo de contraseña incorrecta | `verifyPassword = false` |
| **HASH-005** | Validación de hash y salt | Datos inválidos fallan verificación |

### Criterios de Aceptación

- ✅ Passwords NUNCA en texto plano
- ✅ PBKDF2 con 100,000 iteraciones (OWASP)
- ✅ Salt único por usuario
- ✅ Bloqueo después de 3 intentos
- ✅ Auditoría de intentos de login

---

## 2️⃣ PRUEBAS DE CIFRADO DE DATOS

### Archivo: `src/services/__tests__/encryptionService.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **ENC-001** | Cifrado y descifrado AES-256-GCM | `decrypted = originalData` |
| **ENC-002** | IV único por operación | `iv1 ≠ iv2` para mismos datos |
| **ENC-003** | Salt único por operación | `salt1 ≠ salt2` para mismos datos |
| **ENC-004** | Outputs diferentes por operación | `encrypted1 ≠ encrypted2` |
| **ENC-005** | Fallo con contraseña incorrecta | Excepción lanzada |
| **ENC-006** | Fallo con salt incorrecto | Excepción lanzada |
| **ENC-007** | Fallo con IV incorrecto | Excepción lanzada |
| **ENC-008** | Manejo de datos corruptos | Excepción capturada sin crash |

### Configuración de Cifrado

```typescript
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,          // 256 bits
  ivLength: 12,            // 12 bytes
  saltLength: 16,          // 16 bytes
  iterations: 100000,      // PBKDF2 (NIST)
  hash: 'SHA-256'
}
```

### Datos que DEBEN Cifrarse

- ✅ Datos personales (nombre, apellido, cédula)
- ✅ Datos de vehículo (matrícula)
- ✅ Datos de visita (destino)
- ✅ Array de acompañantes
- ✅ Backups automáticos

---

## 3️⃣ PRUEBAS DE CONTROL DE ACCESO (RBAC)

### Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **Operador** | Registrar ingresos/salidas, consultar personas |
| **Supervisor** | Todo de Operador + estadísticas, reportes |
| **Administrador** | Acceso total + gestión usuarios + configuración |

### Archivo: `src/router/__tests__/router.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **RBAC-001** | Usuario no autenticado bloqueado | Redirección a `/login` |
| **RBAC-002** | Usuario autenticado accede a dashboard | Acceso permitido |
| **RBAC-003** | Usuario autenticado no ve login | Redirección a `/dashboard` |
| **RBAC-004** | Operador bloqueado de rutas admin | Redirección a `/dashboard` |
| **RBAC-005** | Admin accede a rutas admin | Acceso permitido |
| **RBAC-006** | Cambios dinámicos de rol | Permisos actualizados |

### Archivo: `src/stores/__tests__/auth.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **RBAC-007** | Identificación correcta de admin | `isAdmin = true` |
| **RBAC-008** | Identificación correcta de operador | `isOperador = true` |
| **RBAC-009** | Reactividad de getters | Roles actualizados dinámicamente |

---

## 4️⃣ PRUEBAS DE VALIDACIÓN DE INPUTS

### Archivos: `src/components/forms/__tests__/*.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **VAL-001** | Validación de username requerido | Error de validación |
| **VAL-002** | Validación de password requerido | Error de validación |
| **VAL-003** | Sanitización automática | Sin tags HTML |
| **VAL-004** | Validación de cédula (formato) | Error si no numérica |
| **VAL-005** | Campos requeridos completos | Error si falta alguno |
| **VAL-006** | Longitud de cédula | Error si 7-8 dígitos |

### Prevención de Vulnerabilidades

| Vulnerabilidad | Mitigación |
|----------------|-----------|
| **XSS** | Vue interpolation `{{ }}` (auto-escape) |
| **SQL Injection** | IndexedDB API nativa (sin query strings) |
| **Command Injection** | N/A (frontend sin shell) |
| **Path Traversal** | N/A (sin filesystem) |

---

## 5️⃣ PRUEBAS DE AUDITORÍA

### Archivo: `src/stores/__tests__/audit.spec.ts`

| ID | Caso de Prueba | Resultado Esperado |
|----|----------------|-------------------|
| **AUD-001** | Registro de login exitoso | Evento guardado con metadata |
| **AUD-002** | Registro de login fallido | Evento guardado |
| **AUD-003** | Registro de logout | Evento guardado |
| **AUD-004** | Registro de creación de usuario | Evento guardado |
| **AUD-005** | Registro de operaciones con datos | Evento guardado |
| **AUD-006** | Inmutabilidad de logs | `immutable: true` |
| **AUD-007** | Cifrado de logs | Datos cifrados AES-256 |
| **AUD-008** | Metadata completa | userId, timestamp incluidos |

### Eventos Registrados

```typescript
✅ Autenticación: login, logout, session_expired
✅ Gestión usuarios: created, modified, deleted
✅ Operaciones datos: registro_created, modified
✅ Backups: backup_created, restored
✅ Errores: encryption_error, database_error
```

---

## 6️⃣ PRUEBAS END-TO-END

### Archivo: `e2e/vue.spec.ts` (Playwright)

| ID | Flujo | Validación de Seguridad |
|----|-------|------------------------|
| **E2E-001** | Login completo | Validación credenciales, sesión |
| **E2E-002** | Registro de ingreso | RBAC, cifrado, auditoría |
| **E2E-003** | Registro de salida | Validación, actualización, auditoría |
| **E2E-004** | Logout | Sesión invalidada, datos limpiados |
| **E2E-005** | Acceso sin auth | Redirección automática |

---

## 7️⃣ HERRAMIENTAS AUTOMATIZADAS

### Análisis Estático

```bash
pnpm run lint               # ESLint + Security Plugin
pnpm run type-check         # TypeScript strict

Reglas de seguridad:
✅ detect-object-injection
✅ detect-unsafe-regex
✅ detect-eval-with-expression
✅ detect-possible-timing-attacks
```

### Auditoría de Dependencias

```bash
pnpm run audit              # npm audit
pnpm run audit:fix          # Corrección automática

Estado actual:
✅ 0 vulnerabilidades críticas
✅ 0 vulnerabilidades altas
```

### Cobertura de Tests

```bash
pnpm run test:unit --coverage

Métricas:
✅ 218 tests unitarios
✅ >70% cobertura lógica crítica
✅ 100% funciones de seguridad
```

---

## 8️⃣ MATRIZ OWASP TOP 10:2021

| Vulnerabilidad | Tests | Estado |
|----------------|-------|--------|
| **A01: Broken Access Control** | RBAC-001 a 009 | ✅ Cubierto |
| **A02: Cryptographic Failures** | ENC/HASH (13 tests) | ✅ Cubierto |
| **A03: Injection** | VAL-001 a 006 | ✅ Cubierto |
| **A04: Insecure Design** | Arquitectura documentada | ✅ Cubierto |
| **A05: Security Misconfiguration** | ENV tests + audit | ✅ Cubierto |
| **A06: Vulnerable Components** | npm audit | ✅ Cubierto |
| **A07: Auth Failures** | AUTH-001 a 008 | ✅ Cubierto |
| **A08: Integrity Failures** | AUD-001 a 008 | ✅ Cubierto |
| **A09: Logging Failures** | AUD-001 a 008 | ✅ Cubierto |
| **A10: SSRF** | N/A (frontend) | ➖ No aplica |

---

## 9️⃣ PROCESO DE EJECUCIÓN

### Antes de Commit

```bash
pnpm run pre-build          # ESLint + TypeScript
```

### Antes de Push

```bash
pnpm run test:all           # Suite completa
# Incluye: lint, format, test:unit, test:e2e
```

### Antes de Release

```bash
pnpm run build              # Build producción
pnpm run preview            # Preview
pnpm run audit              # Auditoría vulnerabilidades
pnpm run test:e2e           # E2E completos

Checklist:
✅ Todos los tests pasan
✅ 0 vulnerabilidades críticas/altas
✅ Build exitoso
✅ PWA funciona offline
```

### Frecuencia de Auditorías

| Tipo | Frecuencia | Responsable |
|------|------------|-------------|
| Tests unitarios | Cada commit | Desarrollador |
| Tests E2E | Cada push | Desarrollador |
| npm audit | Semanal | Desarrollador |
| Code review | Cada PR | Custodio Técnico |
| Penetration testing | Release | Custodio + Externo |

---

## 🔟 CRITERIOS DE ACEPTACIÓN

### Para Aprobar Release

#### Tests Automatizados
- ✅ 100% tests unitarios (218/218)
- ✅ 100% tests E2E críticos (5/5)
- ✅ 0 errores ESLint Security
- ✅ 0 errores TypeScript críticos

#### Auditoría
- ✅ 0 vulnerabilidades críticas
- ✅ 0 vulnerabilidades altas
- ✅ Code review aprobado
- ✅ Checklist seguridad completado

#### Documentación
- ✅ Documentación técnica actualizada
- ✅ Changelog actualizado
- ✅ Procedimientos respuesta incidentes

### Umbrales de Calidad

| Métrica | Mínimo | Actual |
|---------|--------|--------|
| Cobertura código | >70% | ✅ 75% |
| Tests unitarios | >200 | ✅ 218 |
| Tests seguridad | >50 | ✅ 89 |
| Vuln. críticas | 0 | ✅ 0 |
| Vuln. altas | 0 | ✅ 0 |

---

## 1️⃣1️⃣ REGISTRO DE EJECUCIÓN

### Última Ejecución: 08-Oct-2025

**Responsable:** Mario BERNI (Custodio Técnico)

```bash
✅ Tests Unitarios: 218/218 PASS (100%)
✅ Tests E2E: 5/5 PASS (100%)
✅ ESLint: 0 errores, 0 warnings
✅ TypeScript: 0 errores críticos
✅ npm audit: 0 críticas/altas
✅ Build: SUCCESS

Tiempo: ~3.5 minutos total
```

---

## 📚 Referencias

### Documentación del Proyecto
- `02-architecture/10-secure-coding-guidelines.md`
- `02-architecture/11-code-review-process.md`
- `02-architecture/05-testing-guidelines.md`

### Estándares Externos
- **OWASP Top 10:2021:** https://owasp.org/www-project-top-ten/
- **OWASP Testing Guide:** https://owasp.org/www-project-web-security-testing-guide/
- **AGESIC:** https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/

---

## 📝 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 08-Oct-2025 | Mario BERNI | Versión inicial - Cumplimiento AD.1-C |

---

## ✅ Aprobación

**Custodio Técnico:** Mario BERNI  
**Fecha:** 08-Oct-2025  
**Próxima revisión:** 08-Ene-2026

---

**NOTA:** Este plan documenta las pruebas de seguridad implementadas y ejecutadas antes de cada release. La ejecución continua de estos tests es obligatoria para mantener el cumplimiento con AGESIC.
