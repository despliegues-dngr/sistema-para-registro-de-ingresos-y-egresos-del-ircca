# 🔀 SEPARACIÓN DE ENTORNOS - Sistema IRCCA

**Versión:** 1.0  
**Fecha:** 08-Oct-2025  
**Propósito:** Documentar la separación estricta entre entornos de Desarrollo, Pruebas y Producción para garantizar la seguridad de datos personales y el cumplimiento normativo.

**Cumplimiento:** Requisito SO.4 - Marco de Ciberseguridad AGESIC

---

## 📋 Resumen Ejecutivo

### 🎯 Objetivo

**Regla de Oro AGESIC:**
> "Nunca usar datos personales reales en los entornos de desarrollo o pruebas"

Este documento define:
- ✅ Separación clara entre entornos
- ✅ Protección de datos personales
- ✅ Configuraciones específicas por entorno
- ✅ Controles de seguridad diferenciados

---

## 🏗️ Arquitectura de Entornos

### **Entornos Definidos:**

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  DESARROLLO (DEV)          PRODUCCIÓN (PROD)             │
│  ┌─────────────────┐      ┌─────────────────┐           │
│  │ localhost:5173  │      │ Vercel Deploy   │           │
│  │                 │      │                 │           │
│  │ • Datos ficticios│     │ • Datos reales │           │
│  │ • Debug ON      │      │ • Debug OFF    │           │
│  │ • Mock auth     │      │ • Auth real    │           │
│  │ • No cifrado*   │      │ • Cifrado full │           │
│  └─────────────────┘      └─────────────────┘           │
│                                                           │
│  * Opcional para desarrollo rápido                       │
└──────────────────────────────────────────────────────────┘
```

**Nota:** No hay entorno de "pruebas" separado por ser proyecto de un solo desarrollador. Los tests se ejecutan localmente con datos mock.

---

## 📁 Archivos de Configuración

### **Estructura de Variables de Entorno:**

```
proyecto/
├── .env.example              # ✅ Template para desarrollo (en Git)
├── .env.production.example   # ✅ Template para producción (en Git)
├── .env.local               # ❌ Desarrollo real (NO en Git)
├── .env.production          # ❌ Producción real (NO en Git)
└── .gitignore               # ✅ Excluye .env.local y .env.production
```

---

### **1. Entorno de DESARROLLO (.env.local)**

**Propósito:** Desarrollo local en máquina del programador

**Características:**

```bash
# DESARROLLO - localhost
VITE_DEV_MODE=true
VITE_DEBUG_LOGS=true
VITE_MOCK_AUTH=true

# Usuarios de prueba con datos FICTICIOS
VITE_ADMIN_CEDULA=55226350
VITE_ADMIN_NOMBRE=Mario
VITE_ADMIN_APELLIDO=Berni
VITE_ADMIN_PASSWORD=2025.Ircca

VITE_SUPERVISOR_CEDULA=12345678
VITE_SUPERVISOR_NOMBRE=Carlos
VITE_SUPERVISOR_APELLIDO=Torres
VITE_SUPERVISOR_PASSWORD=2025.Supervisor
```

**⚠️ IMPORTANTE:**
- Cédulas ficticias (o del propio desarrollador)
- Contraseñas simples para desarrollo
- Logs activados para debugging
- NO se sube este archivo a Git

---

### **2. Entorno de PRODUCCIÓN (.env.production)**

**Propósito:** Aplicación desplegada en Vercel para uso real del IRCCA

**Características:**

```bash
# PRODUCCIÓN - Vercel
VITE_VERCEL_ENV=production
VITE_APP_BASE_URL=https://sistema-ircca.vercel.app

# Seguridad activada
VITE_DEV_MODE=false
VITE_DEBUG_LOGS=false
VITE_MOCK_AUTH=false
VITE_SECURE_MODE=true
VITE_ENABLE_DEVTOOLS=false

# Usuarios reales con credenciales SEGURAS
VITE_ADMIN_CEDULA=[CÉDULA_REAL_ADMIN]
VITE_ADMIN_PASSWORD=Temporal2025!MustChange  # ⚠️ Cambiar después de 1er login

# Base de datos producción
VITE_DB_NAME=ircca_system_db
```

**⚠️ CRÍTICO:**
- Contraseñas fuertes (12+ caracteres, mayúsculas, números, símbolos)
- Sin logs de debugging
- DevTools deshabilitados
- NO se sube este archivo a Git
- Se configura directamente en Vercel Dashboard

---

## 🔒 Protección de Datos Personales

### **Reglas Estrictas:**

#### **❌ PROHIBIDO en Desarrollo:**

```typescript
// ❌ NO HACER NUNCA:

// 1. Copiar backup de producción a desarrollo
const backupProd = await fetch('backup_produccion.json') // ❌ PROHIBIDO

// 2. Usar cédulas reales de personas
const cedulaReal = '11223344' // ❌ Si no eres tú, NO

// 3. Probar con datos de empleados reales
const empleado = {
  cedula: '99887766',  // ❌ Datos reales
  nombre: 'Juan Perez' // ❌ Persona real
}

// 4. Hardcodear datos de prueba con info real
const DATOS_PRUEBA = [
  { cedula: '55443322', nombre: 'María González' } // ❌ Persona real
]
```

#### **✅ PERMITIDO en Desarrollo:**

```typescript
// ✅ HACER:

// 1. Usar tu propia cédula
const miCedula = '55226350' // ✅ Del propio desarrollador

// 2. Generar datos ficticios con formato válido
const cedulaFicticia = '12345678' // ✅ Obviamente falsa
const nombreFicticio = 'Test Usuario' // ✅ Claramente de prueba

// 3. Usar generadores de datos fake
import { faker } from '@faker-js/faker'
const persona = {
  cedula: faker.string.numeric(8),
  nombre: faker.person.firstName(),
  apellido: faker.person.lastName()
}

// 4. Usar constantes de prueba obvias
const TEST_USER = {
  cedula: '00000001',
  nombre: 'TEST',
  apellido: 'USUARIO'
}
```

---

### **Datos de Prueba para Tests:**

```typescript
// src/__tests__/fixtures/testData.ts

/**
 * ⚠️ IMPORTANTE: Estos datos son FICTICIOS
 * NO corresponden a personas reales
 */

export const TEST_USERS = {
  admin: {
    cedula: '55226350',  // Desarrollador
    nombre: 'Admin',
    apellido: 'Test',
    password: 'TestPass123!'
  },
  operador: {
    cedula: '11111111',  // Ficticio
    nombre: 'Operador',
    apellido: 'Prueba',
    password: 'TestPass123!'
  }
}

export const TEST_VISITORS = [
  {
    cedula: '12345678',  // Ficticio obvio
    nombre: 'Juan',
    apellido: 'Pérez',
    destino: 'Oficina Test'
  },
  {
    cedula: '87654321',  // Ficticio obvio
    nombre: 'María',
    apellido: 'González',
    destino: 'Sala Pruebas'
  }
]
```

---

## 🔐 Controles de Seguridad por Entorno

### **Matriz de Seguridad:**

| Característica | Desarrollo | Producción |
|----------------|------------|------------|
| **Cifrado de datos** | Opcional | ✅ Obligatorio (AES-256) |
| **HTTPS** | No requerido | ✅ Obligatorio |
| **Debug logs** | ✅ Activado | ❌ Desactivado |
| **DevTools** | ✅ Disponible | ❌ Bloqueado |
| **Datos personales** | ❌ Prohibidos | ✅ Permitidos |
| **Contraseñas** | Simples OK | ✅ Seguras obligatorio |
| **Timeouts** | Largos (testing) | ✅ Estrictos (30 min) |
| **Intentos login** | Sin límite | ✅ Máx 3 intentos |
| **Auditoría** | Opcional | ✅ Obligatoria |
| **Backups** | No críticos | ✅ Automáticos |

---

## 🚀 Flujo de Despliegue

### **Proceso de Publicación a Producción:**

```bash
# 1. DESARROLLO LOCAL
git checkout develop
# Trabajar con datos ficticios
pnpm run dev

# 2. VERIFICACIÓN
pnpm run lint
pnpm run type-check
pnpm run test:unit
pnpm run test:e2e

# 3. BUILD DE PRODUCCIÓN (local)
pnpm run build:prod
# Verifica que no hay datos de desarrollo en el build

# 4. COMMIT Y PUSH
git add .
git commit -m "feat: nueva funcionalidad"
git push origin develop

# 5. MERGE A MAIN
git checkout main
git merge develop
git push origin main

# 6. DEPLOY AUTOMÁTICO (Vercel)
# Vercel detecta push a main y despliega automáticamente
# Variables de producción YA configuradas en Vercel Dashboard
```

**⚠️ VERIFICACIÓN POST-DEPLOY:**

```bash
# Verificar en producción:
✅ Variables de entorno correctas
✅ HTTPS funcionando
✅ Cifrado activado
✅ Debug logs desactivados
✅ No hay datos de desarrollo expuestos
```

---

## 📝 Configuración en Vercel

### **Variables de Entorno en Vercel Dashboard:**

**Ruta:** `vercel.com/tu-proyecto/settings/environment-variables`

**Variables críticas:**

```
VITE_VERCEL_ENV=production
VITE_DEV_MODE=false
VITE_DEBUG_LOGS=false
VITE_SECURE_MODE=true

VITE_ADMIN_CEDULA=[secret]
VITE_ADMIN_PASSWORD=[secret]
VITE_SUPERVISOR_CEDULA=[secret]
VITE_SUPERVISOR_PASSWORD=[secret]
```

**Configuración:**
- ✅ Environment: `Production`
- ✅ Type: `Secret` (para contraseñas)
- ✅ Encrypt: Activado
- ✅ No exponer en logs

---

## 🔍 Auditoría de Separación

### **Checklist de Verificación:**

```markdown
## Antes de cada deploy a producción:

[ ] ✅ Sin console.log() con datos sensibles
[ ] ✅ Sin datos reales en código fuente
[ ] ✅ Sin credenciales hardcodeadas
[ ] ✅ .env.local NO incluido en commit
[ ] ✅ .env.production NO incluido en commit
[ ] ✅ Variables de Vercel configuradas
[ ] ✅ Build de producción exitoso
[ ] ✅ Tests pasan con datos ficticios
[ ] ✅ Debug logs desactivados en producción
[ ] ✅ HTTPS verificado en producción
```

### **Comando de Verificación:**

```bash
# Verificar que no hay datos sensibles en código
grep -r "cedula.*[0-9]{8}" src/  # Buscar cédulas hardcodeadas
grep -r "password.*=" src/       # Buscar contraseñas hardcodeadas
grep -r "console.log" src/       # Buscar logs olvidados

# Verificar .gitignore
grep ".env.local" .gitignore     # Debe estar
grep ".env.production" .gitignore # Debe estar
```

---

## 🚨 Procedimiento de Incidente

### **Si se filtraron datos reales a desarrollo:**

**Paso 1: Detección (Inmediata)**
```bash
# Revisar historial de Git
git log --all --full-history --source -- .env*
git log -S "cedula" --all
```

**Paso 2: Contención (< 1 hora)**
```bash
# Eliminar archivo del historial
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.production' \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

**Paso 3: Rotación de Credenciales (< 2 horas)**
```bash
# Cambiar TODAS las contraseñas afectadas
# Notificar a usuarios comprometidos
# Actualizar variables en Vercel
```

**Paso 4: Documentación**
- Registrar incidente en `docs/03-security/incidents/`
- Notificar según protocolo GI.1
- Actualizar procedimientos

---

## 📚 Buenas Prácticas

### **Para Desarrolladores:**

1. **Usar datos ficticios SIEMPRE**
   - Nombres obvios: "Test", "Demo", "Prueba"
   - Cédulas secuenciales: 11111111, 12345678
   - Nunca copiar backup de producción

2. **Verificar antes de commit**
   ```bash
   git diff --cached  # Revisar cambios antes de commit
   ```

3. **Limpiar datos de testing**
   ```bash
   # Limpiar IndexedDB desarrollo
   localStorage.clear()
   # Borrar base de datos de testing
   ```

4. **Usar archivos .example**
   - Nunca editar `.env.example` con datos reales
   - Siempre copiar a `.env.local` y editar ahí

5. **Separar ramas**
   ```
   main       → Producción (protegida)
   develop    → Desarrollo (datos ficticios)
   feature/*  → Features individuales
   ```

---

## ✅ Checklist de Cumplimiento SO.4

**Para auditoría AGESIC:**

```markdown
[ ] ✅ Separación clara entre desarrollo y producción
[ ] ✅ Variables de entorno diferenciadas
[ ] ✅ Sin datos personales reales en desarrollo
[ ] ✅ Contraseñas diferentes por entorno
[ ] ✅ Archivos .env excluidos de Git
[ ] ✅ Proceso de deploy documentado
[ ] ✅ Controles de seguridad por entorno
[ ] ✅ Verificación pre-deploy implementada
[ ] ✅ Procedimiento de incidente definido
[ ] ✅ Buenas prácticas documentadas
```

---

## 📊 Evidencia de Cumplimiento

### **Archivos que demuestran separación:**

```
docs/02-architecture/15-environment-separation.md   ← Este documento
.env.example                                        ← Template dev
.env.production.example                             ← Template prod
.gitignore                                          ← Excluye .env reales
vercel.json                                         ← Config producción
```

### **Prueba de no contaminación:**

```bash
# Verificar que no hay datos de producción en código
pnpm run lint
pnpm run type-check

# Verificar que tests usan datos ficticios
pnpm run test:unit
# Todos los tests usan TEST_USERS y TEST_VISITORS
```

---

## 📝 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 08-Oct-2025 | Mario BERNI | Versión inicial - Cumplimiento SO.4 |

---

**Custodio Técnico:** Mario BERNI  
**Próxima revisión:** 08-Ene-2026

---

**NOTA CRÍTICA:** Este documento es obligatorio para cumplir con normativa AGESIC y proteger la privacidad de ciudadanos uruguayos. El incumplimiento puede resultar en sanciones administrativas y penales según Ley 18.331 de Protección de Datos Personales.
