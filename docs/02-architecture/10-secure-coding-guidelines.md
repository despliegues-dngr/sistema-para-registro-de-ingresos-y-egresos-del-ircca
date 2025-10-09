# 🔐 GUÍA DE CODIFICACIÓN SEGURA - Sistema IRCCA

**Versión:** 1.0  
**Fecha:** 07-Oct-2025  
**Propósito:** Este documento establece las prácticas y estándares de codificación segura que deben seguirse en el desarrollo del Sistema de Control de Accesos del IRCCA, garantizando el cumplimiento con el Marco de Ciberseguridad de AGESIC y la Ley N° 18.331.

**Cumplimiento:** Requisito AD.1-A - Marco de Ciberseguridad AGESIC

---

## 📚 Estándares de Referencia

Este proyecto adopta las mejores prácticas de seguridad definidas por:

- **OWASP Top 10:2021** - Los 10 riesgos de seguridad más críticos en aplicaciones web
- **CWE/SANS Top 25** - Errores de software más peligrosos
- **Ley N° 18.331** - Protección de Datos Personales (Uruguay)
- **NIST SP 800-63B** - Guías de autenticación digital

---

## 🎯 OWASP Top 10:2021 - Implementación en Sistema IRCCA

### A01:2021 – Broken Access Control

**Descripción:** Fallas en la implementación de controles de acceso que permiten a usuarios realizar acciones fuera de sus permisos.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Control de Acceso Basado en Roles (RBAC)
// src/stores/auth.ts

export const useAuthStore = defineStore('auth', {
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    isSupervisor: (state) => state.currentUser?.role === 'supervisor',
    isOperador: (state) => state.currentUser?.role === 'operador'
  }
})

// src/router/index.ts - Guards de navegación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard', query: { error: 'insufficient_permissions' } })
  }
  
  next()
})
```

**Reglas:**
- ✅ **SIEMPRE** verificar permisos en el router
- ✅ **SIEMPRE** validar rol en el backend (cuando exista)
- ✅ **NUNCA** confiar solo en UI para ocultar funciones
- ✅ **SIEMPRE** registrar intentos de acceso no autorizado en auditoría

---

### A02:2021 – Cryptographic Failures

**Descripción:** Fallas en la protección de datos sensibles en tránsito o en reposo.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Cifrado AES-256-GCM para datos sensibles
// src/services/encryptionService.ts

export class EncryptionService {
  private config = {
    algorithm: 'AES-GCM',
    keyLength: 256,          // 256 bits
    iterations: 100000,      // NIST recomendado
    saltLength: 16
  }

  async encrypt(data: any): Promise<EncryptedData> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await this.deriveKey(password, salt)
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(data))
    )
    
    return { encrypted, iv, salt }
  }
}
```

**Reglas:**
- ✅ **SIEMPRE** usar AES-256-GCM para cifrado simétrico
- ✅ **SIEMPRE** usar PBKDF2 con mínimo 100,000 iteraciones para derivar claves
- ✅ **SIEMPRE** generar IV único por operación de cifrado
- ✅ **SIEMPRE** generar salt único por usuario
- ❌ **NUNCA** almacenar claves de cifrado en código fuente
- ❌ **NUNCA** reutilizar IVs en operaciones de cifrado

**Datos que DEBEN cifrarse:**
- Datos personales (cédula, nombre, apellido)
- Datos de visita (destino)
- Datos de vehículo (matrícula, tipo)
- Array de acompañantes completo
- Backups automáticos

---

### A03:2021 – Injection

**Descripción:** Inyección de código malicioso a través de datos no validados.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Uso de IndexedDB (NoSQL) - Sin riesgo SQL Injection
// src/composables/useDatabase.ts

async getRegistros(filters: FilterOptions): Promise<RegistroEntry[]> {
  const db = await this.openDB()
  const tx = db.transaction('registros', 'readonly')
  
  // ✅ IndexedDB API nativa - Sin concatenación de strings
  const registros = await tx.store.index('timestamp').getAll()
  return registros
}

// ❌ PROHIBIDO: v-html con contenido dinámico
// Vue Component
<template>
  <!-- ❌ NUNCA HACER ESTO -->
  <div v-html="userInput"></div>
  
  <!-- ✅ CORRECTO: Interpolación segura -->
  <div>{{ userInput }}</div>
</template>
```

**Reglas:**
- ✅ **SIEMPRE** usar IndexedDB API nativa (no queries string)
- ✅ **SIEMPRE** usar interpolación Vue `{{ }}` en templates
- ❌ **NUNCA** usar `v-html` con contenido de usuario
- ❌ **NUNCA** usar `innerHTML` o `outerHTML` con datos dinámicos
- ✅ **SIEMPRE** validar tipos con TypeScript
- ✅ **SIEMPRE** sanitizar inputs antes de mostrar

---

### A04:2021 – Insecure Design

**Descripción:** Fallas en el diseño de seguridad del sistema.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Diseño de seguridad por capas
/*
┌─────────────────────────────────────────────────────────┐
│  CAPA 4: FÍSICA - Modo Kiosco + Control Dispositivo    │
├─────────────────────────────────────────────────────────┤
│  CAPA 3: APLICACIÓN - Autenticación + RBAC + Sesiones  │
├─────────────────────────────────────────────────────────┤
│  CAPA 2: DATOS - Cifrado AES-256 + PBKDF2 + Validación │
├─────────────────────────────────────────────────────────┤
│  CAPA 1: ALMACENAMIENTO - IndexedDB + Backups + Logs   │
└─────────────────────────────────────────────────────────┘
*/

// ✅ Principio de Mínimo Privilegio
export const ROLE_PERMISSIONS = {
  operador: ['registrar_ingreso', 'registrar_salida', 'consultar_personas'],
  supervisor: ['ver_estadisticas', 'generar_reportes', 'consultar_todos'],
  admin: ['*'] // Todos los permisos
}
```

**Reglas:**
- ✅ **SIEMPRE** aplicar defensa en profundidad (múltiples capas)
- ✅ **SIEMPRE** seguir principio de mínimo privilegio
- ✅ **SIEMPRE** diseñar con seguridad desde el inicio
- ✅ **SIEMPRE** documentar decisiones de seguridad

---

### A05:2021 – Security Misconfiguration

**Descripción:** Configuraciones inseguras o por defecto sin endurecer.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Variables de entorno para configuración
// .env.production (NO subir a Git)
VITE_ADMIN_PASSWORD="P@ssw0rd!Muy$egur@2025"
VITE_SESSION_TIMEOUT="1800000"  // 30 minutos
VITE_MAX_LOGIN_ATTEMPTS="3"

// src/config/constants.ts
export const SECURITY_CONFIG = {
  passwordHash: {
    algorithm: 'PBKDF2',
    iterations: import.meta.env.VITE_PBKDF2_ITERATIONS || 100000,
    hashLength: 32
  },
  session: {
    timeout: Number(import.meta.env.VITE_SESSION_TIMEOUT) || 1800000,
    maxLoginAttempts: Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 3
  }
}

// .gitignore
.env
.env.local
.env.production
.env.development
```

**Reglas:**
- ✅ **SIEMPRE** usar variables de entorno para configuración sensible
- ✅ **SIEMPRE** agregar archivos `.env*` a `.gitignore`
- ✅ **SIEMPRE** proporcionar `.env.example` con valores de ejemplo
- ❌ **NUNCA** hardcodear credenciales en código
- ❌ **NUNCA** subir archivos `.env` a repositorios
- ✅ **SIEMPRE** usar TypeScript strict mode
- ✅ **SIEMPRE** configurar ESLint con reglas de seguridad

---

### A06:2021 – Vulnerable and Outdated Components

**Descripción:** Uso de librerías con vulnerabilidades conocidas.

**✅ Implementación en el Proyecto:**

```json
// package.json - Scripts de auditoría
{
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",
    "deps:check": "npm outdated",
    "deps:update": "npm update"
  }
}
```

**Reglas:**
- ✅ **SIEMPRE** ejecutar `npm audit` antes de commits importantes
- ✅ **SIEMPRE** actualizar dependencias con vulnerabilidades críticas
- ✅ **SIEMPRE** revisar changelogs antes de actualizar versiones mayores
- ✅ **SIEMPRE** usar versiones específicas en `package.json` (no `^` o `~`)
- ✅ **MENSUALMENTE** revisar dependencias desactualizadas

---

### A07:2021 – Identification and Authentication Failures

**Descripción:** Fallas en la autenticación y gestión de sesiones.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Hashing seguro de contraseñas
// src/services/encryptionService.ts

async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(32))
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,  // OWASP recomendado
      hash: 'SHA-256'
    },
    key,
    256
  )
  
  return {
    hash: this.arrayBufferToBase64(hashBuffer),
    salt: this.arrayBufferToBase64(salt)
  }
}

// ✅ Control de intentos fallidos
// src/stores/auth.ts
if (state.loginAttempts >= 3) {
  throw new Error('Cuenta bloqueada por múltiples intentos fallidos')
}
```

**Reglas:**
- ✅ **SIEMPRE** usar PBKDF2 con mínimo 100,000 iteraciones para passwords
- ✅ **SIEMPRE** generar salt único por usuario (mínimo 16 bytes)
- ✅ **SIEMPRE** implementar límite de intentos de login (máx 3)
- ✅ **SIEMPRE** implementar timeout de sesión (30 minutos)
- ❌ **NUNCA** almacenar contraseñas en texto plano
- ❌ **NUNCA** enviar contraseñas por URL o query params
- ✅ **SIEMPRE** registrar intentos fallidos en auditoría

**Requisitos de contraseña:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial

---

### A08:2021 – Software and Data Integrity Failures

**Descripción:** Fallas en la integridad del código y datos.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Auditoría inmutable de eventos
// src/stores/audit.ts

export const useAuditStore = defineStore('audit', {
  actions: {
    async logEvent(event: AuditEvent) {
      const auditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: this.authStore.currentUser?.id,
        eventType: event.type,
        action: event.action,
        details: event.details,
        // NO se permite modificación posterior
        immutable: true
      }
      
      await this.db.add('auditoria', auditEntry)
    }
  }
})
```

**Reglas:**
- ✅ **SIEMPRE** registrar eventos críticos en auditoría
- ✅ **SIEMPRE** marcar logs de auditoría como inmutables
- ✅ **SIEMPRE** usar Git con commits firmados (cuando sea posible)
- ✅ **SIEMPRE** revisar código antes de merge (code review)
- ✅ **SIEMPRE** usar versionado semántico (semver)

---

### A09:2021 – Security Logging and Monitoring Failures

**Descripción:** Fallas en el registro de eventos de seguridad.

**✅ Implementación en el Proyecto:**

```typescript
// ✅ CORRECTO: Registro completo de eventos de seguridad
// src/stores/audit.ts

export const AUDIT_EVENTS = {
  // Autenticación
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  LOGOUT: 'auth.logout',
  SESSION_EXPIRED: 'auth.session.expired',
  
  // Gestión de usuarios
  USER_CREATED: 'user.created',
  USER_MODIFIED: 'user.modified',
  USER_DELETED: 'user.deleted',
  PASSWORD_CHANGED: 'user.password.changed',
  
  // Operaciones de datos
  REGISTRO_CREATED: 'data.registro.created',
  REGISTRO_MODIFIED: 'data.registro.modified',
  
  // Backups
  BACKUP_CREATED: 'backup.created',
  BACKUP_RESTORED: 'backup.restored',
  
  // Errores críticos
  ENCRYPTION_ERROR: 'system.encryption.error',
  DATABASE_ERROR: 'system.database.error'
}
```

**Qué registrar:**
- ✅ Todos los intentos de login (exitosos y fallidos)
- ✅ Cambios en usuarios (creación, modificación, eliminación)
- ✅ Acceso a funciones administrativas
- ✅ Creación y modificación de registros
- ✅ Operaciones de backup/restore
- ✅ Errores críticos del sistema
- ✅ Cambios de configuración

**Qué NO registrar:**
- ❌ Contraseñas (ni siquiera hasheadas en logs)
- ❌ Datos personales completos (solo IDs)
- ❌ Claves de cifrado

---

### A10:2021 – Server-Side Request Forgery (SSRF)

**Descripción:** Forzar al servidor a realizar requests a URLs arbitrarias.

**✅ Estado en el Proyecto:**

**N/A** - Este proyecto es una PWA offline-first sin backend. No aplica este riesgo.

**Consideración futura:** Si se implementa backend API:
- ✅ Validar y sanitizar todas las URLs
- ✅ Usar whitelist de dominios permitidos
- ✅ NO seguir redirects automáticos

---

## 📋 Checklist de Codificación Segura

### ✅ Antes de Escribir Código

```
[ ] Entiendo qué datos son sensibles y requieren cifrado
[ ] Conozco el rol del usuario y sus permisos
[ ] He revisado la documentación de seguridad del proyecto
[ ] Tengo configuradas las variables de entorno correctamente
```

### ✅ Durante el Desarrollo

```
[ ] Uso TypeScript con strict mode activado
[ ] Valido todos los inputs del usuario
[ ] NO uso v-html ni innerHTML con datos dinámicos
[ ] Uso variables de entorno para configuración sensible
[ ] Implemento control de acceso apropiado
[ ] Registro eventos importantes en auditoría
[ ] Escribo tests unitarios incluyendo casos de seguridad
```

### ✅ Antes de Commit

```
[ ] ESLint pasa sin errores: pnpm lint
[ ] Tests unitarios pasan: pnpm test:unit
[ ] Type check pasa: pnpm type-check
[ ] npm audit no muestra vulnerabilidades críticas
[ ] NO hay credenciales hardcodeadas en código
[ ] Archivos .env están en .gitignore
[ ] He actualizado documentación si cambié seguridad
```

### ✅ Code Review

```
[ ] Control de acceso implementado correctamente
[ ] Datos sensibles cifrados apropiadamente
[ ] No hay vulnerabilidades OWASP Top 10
[ ] Logs de auditoría implementados
[ ] Tests de seguridad incluidos
[ ] Documentación actualizada
```

---

## 🚫 Prácticas PROHIBIDAS

### ❌ NUNCA hacer esto:

```typescript
// ❌ Contraseñas en texto plano
const password = '12345'
db.save({ username: 'admin', password })

// ❌ Credenciales hardcodeadas
const API_KEY = 'sk-abc123def456'

// ❌ v-html con contenido de usuario
<div v-html="userInput"></div>

// ❌ innerHTML con datos dinámicos
element.innerHTML = userData

// ❌ eval() con cualquier input
eval(userCode)

// ❌ SQL strings concatenados (si usaras SQL)
const query = `SELECT * FROM users WHERE id = ${userId}`

// ❌ Exponer datos sensibles en logs
console.log('Password:', user.password)

// ❌ Confiar solo en validación del cliente
if (role === 'admin') showAdminPanel()  // Sin verificar en backend
```

---

## ✅ Prácticas RECOMENDADAS

### ✅ SIEMPRE hacer esto:

```typescript
// ✅ Hashear contraseñas
const { hash, salt } = await encryptionService.hashPassword(password)
db.save({ username, passwordHash: hash, salt })

// ✅ Variables de entorno
const API_KEY = import.meta.env.VITE_API_KEY

// ✅ Interpolación segura en Vue
<div>{{ userInput }}</div>

// ✅ textContent para DOM
element.textContent = userData

// ✅ IndexedDB con API nativa
const users = await db.getAll('usuarios')

// ✅ Logs sin datos sensibles
console.log('User logged in:', { userId: user.id })

// ✅ Verificación de permisos
const authStore = useAuthStore()
if (!authStore.isAdmin) {
  throw new Error('Acceso denegado')
}

// ✅ Cifrado de datos sensibles
const encrypted = await encryptionService.encrypt(personalData)
```

---

## 🛠️ Herramientas de Seguridad

### Configuradas en el Proyecto

```json
// package.json
{
  "scripts": {
    "lint": "eslint . --fix",           // Análisis de código
    "type-check": "vue-tsc --build",    // Verificación de tipos
    "test:unit": "vitest",              // Tests unitarios
    "audit": "npm audit --production"   // Auditoría de dependencias
  }
}
```

### ESLint - Reglas de Seguridad

```typescript
// eslint.config.ts
export default defineConfigWithVueTs(
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  pluginSecurity.configs.recommended  // Plugin de seguridad
)
```

---

## 📞 Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en el sistema:

**1. NO la hagas pública**
**2. Contacta inmediatamente:**
   - Custodio Técnico: Mario BERNI
   - Custodio Operativo: Tte. Rodrigo LOPEZ

**3. Proporciona:**
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Sugerencias de mitigación (si las tienes)

---

## 📚 Referencias y Recursos

### Documentación Oficial

- **OWASP Top 10:2021:** https://owasp.org/www-project-top-ten/
- **OWASP Cheat Sheet Series:** https://cheatsheetseries.owasp.org/
- **CWE Top 25:** https://cwe.mitre.org/top25/
- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework

### Específicas de Uruguay

- **AGESIC - Marco de Ciberseguridad:** https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/
- **Ley N° 18.331:** Protección de Datos Personales
- **CERTuy:** https://www.gub.uy/certificacion-electronica/
- **URCDP:** Unidad Reguladora y de Control de Datos Personales

### Documentación del Proyecto

- `02-architecture/02-security-architecture.md` - Arquitectura de seguridad
- `02-architecture/06-database-architecture.md` - Base de datos y cifrado
- `02-architecture/09-security-analysis.md` - Análisis de seguridad
- `03-security/CHECKLIST-AUDITORIA-CIBERSEGURIDAD-AGESIC.md` - Checklist de auditoría

---

## 📝 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 07-Oct-2025 | Mario BERNI | Versión inicial - Cumplimiento AD.1-A |

---

## ✅ Aprobación

Este documento ha sido revisado y aprobado por:

**Custodio Técnico:** Mario BERNI  
**Fecha:** 07-Oct-2025

**Próxima revisión:** 07-Ene-2026 (trimestral)

---

**NOTA IMPORTANTE:** Este documento es obligatorio para todos los desarrolladores que contribuyan al proyecto. El incumplimiento de estas guías puede resultar en vulnerabilidades de seguridad que comprometan datos personales y violen la Ley N° 18.331.
