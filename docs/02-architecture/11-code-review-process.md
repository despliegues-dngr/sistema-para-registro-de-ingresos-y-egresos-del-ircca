# 🔍 PROCESO DE REVISIÓN DE CÓDIGO - Sistema IRCCA

**Versión:** 1.0  
**Fecha:** 07-Oct-2025  
**Propósito:** Este documento define el proceso obligatorio de revisión de código antes de que cualquier cambio sea integrado al sistema en producción, garantizando calidad, seguridad y mantenibilidad del código.

**Cumplimiento:** Requisito AD.1-B - Marco de Ciberseguridad AGESIC

---

## 📋 Resumen Ejecutivo

### 🎯 Objetivo

Establecer un proceso sistemático y documentado de revisión de código que:
- ✅ Detecte vulnerabilidades de seguridad antes de producción
- ✅ Garantice cumplimiento de estándares de codificación
- ✅ Mejore la calidad y mantenibilidad del código
- ✅ Transfiera conocimiento entre desarrolladores
- ✅ Cumpla con requisitos de auditoría AGESIC

### 📊 Niveles de Revisión

```
NIVEL 1: Automatizada (ESLint + TypeScript + Tests)
    ↓
NIVEL 2: Peer Review (Revisión por otro desarrollador)
    ↓
NIVEL 3: Aprobación Final (Custodio Técnico)
```

---

## 🚀 Proceso de Revisión (Workflow)

### **Fase 1: Pre-Commit (Automática)**

**Antes de hacer commit, el desarrollador DEBE ejecutar:**

```bash
# Verificación completa automática
pnpm run pre-build

# Equivalente a:
# 1. ESLint (análisis de código)
# 2. TypeScript (verificación de tipos)
```

**Checklist automático:**
- ✅ Sin errores de ESLint
- ✅ Sin errores de TypeScript
- ✅ Cumple reglas de seguridad (eslint-plugin-security)
- ✅ Código formateado según Prettier

**Si falla:** ❌ NO se permite el commit hasta corregir errores

---

### **Fase 2: Pre-Push (Automática + Manual)**

**Antes de push a GitHub, ejecutar:**

```bash
# Suite completa de verificación
pnpm run test:all

# Incluye:
# 1. lint:check - Verificación ESLint
# 2. format:check - Verificación Prettier
# 3. test:unit - Tests unitarios
# 4. test:e2e - Tests End-to-End
```

**Checklist extendido:**
- ✅ Todos los tests unitarios pasan (218 tests)
- ✅ Tests E2E críticos pasan
- ✅ Sin vulnerabilidades en dependencias (npm audit)
- ✅ Cobertura de tests adecuada

**Si falla:** ❌ NO hacer push hasta resolver

---

### **Fase 3: Pull Request / Merge Request (Manual)**

**Contexto del Proyecto:**

Este proyecto tiene un **desarrollador único** (Mario BERNI - Custodio Técnico), por lo que el proceso de Pull Request se adapta a esta realidad operativa.

#### **Proceso Adaptado para Desarrollador Único:**

**Opción A: Auto-Review con Checklist Estricto**

```bash
# Antes de merge a main, ejecutar verificación completa
pnpm run pre-build
pnpm run test:all
pnpm run audit

# Revisar checklist manualmente
```

**Checklist de Auto-Review:**
```
Seguridad:
[ ] ¿Hay credenciales hardcodeadas? ❌ NO debe haber
[ ] ¿Se cifran datos sensibles? ✅ Debe cifrarse
[ ] ¿Se validan inputs de usuario? ✅ Siempre validar
[ ] ¿Se usa v-html con datos dinámicos? ❌ Prohibido
[ ] ¿Control de acceso implementado? ✅ RBAC correcto

Calidad:
[ ] ¿Código cumple guía de Vuetify? ✅ Verificar
[ ] ¿Tests unitarios agregados? ✅ Para lógica nueva
[ ] ¿Documentación actualizada? ✅ Si cambió arquitectura
[ ] ¿Logs de auditoría implementados? ✅ Para acciones críticas

Funcionalidad:
[ ] ¿Funciona en modo offline? ✅ PWA debe funcionar
[ ] ¿Probado en tablet? ✅ Si afecta UI
[ ] ¿Compatible con roles? ✅ Admin, Supervisor, Operador
```

**Opción B: Revisión Diferida con Registro**

Para cumplimiento de auditoría, mantener **registro escrito** de cada cambio importante:

```markdown
# Code Review Log

## Cambio: [Título del cambio]
**Fecha:** 07-Oct-2025
**Revisor:** Mario BERNI (Auto-review)
**Branch:** feature/nueva-funcionalidad

**Descripción del cambio:**
- Implementación de [funcionalidad]
- Archivos modificados: [lista]

**Checklist de Seguridad:**
- [x] Sin vulnerabilidades OWASP Top 10
- [x] Datos sensibles cifrados
- [x] Validación de inputs
- [x] Tests de seguridad agregados

**Herramientas ejecutadas:**
- [x] ESLint security: PASS
- [x] TypeScript: PASS
- [x] Tests unitarios: PASS (218/218)
- [x] npm audit: 0 vulnerabilidades

**Decisión:** ✅ APROBADO para merge
**Timestamp:** 2025-10-07T23:54:00-03:00
```

**Ubicación del log:** `docs/04-tasks/code-review-log.md`

---

### **Fase 4: Post-Merge (Automática)**

**Después de merge a main:**

```bash
# Verificación en main
pnpm run build
pnpm run preview

# Verificar que build de producción funciona
```

**Checklist post-merge:**
- ✅ Build de producción exitoso
- ✅ Sin errores en consola
- ✅ PWA funciona offline
- ✅ Tests en main branch pasan

---

## 🛠️ Herramientas Automatizadas

### **1. ESLint con Plugin de Seguridad**

**Configuración:**

```typescript
// eslint.config.ts
import pluginSecurity from 'eslint-plugin-security'

export default defineConfigWithVueTs(
  // ... otras configuraciones
  pluginSecurity.configs.recommended,
  {
    rules: {
      // Reglas de seguridad críticas
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'warn',
      'security/detect-possible-timing-attacks': 'warn'
    }
  }
)
```

**Detección automática de:**
- ✅ Uso de `eval()`
- ✅ Regex inseguros
- ✅ Buffers sin validación
- ✅ Posibles timing attacks
- ✅ Inyección de objetos

---

### **2. TypeScript Strict Mode**

**Configuración:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Previene:**
- ✅ Variables sin tipo definido
- ✅ Valores null/undefined inesperados
- ✅ Funciones con tipos incorrectos

---

### **3. Prettier (Formateo Automático)**

**Configuración:** `.prettierrc.json`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

**Garantiza:**
- ✅ Código consistente en todo el proyecto
- ✅ Sin debates sobre estilo
- ✅ Diffs de Git más limpios

---

### **4. Vitest (Tests Unitarios)**

**Ejecución:**

```bash
# Con coverage
pnpm run test:unit --coverage

# Watch mode durante desarrollo
pnpm run test:unit --watch
```

**Mínimos requeridos:**
- ✅ Cobertura >70% en lógica crítica
- ✅ Tests para funciones de seguridad
- ✅ Tests de validación de inputs

---

### **5. npm audit (Vulnerabilidades)**

**Scripts agregados:**

```json
{
  "scripts": {
    "audit": "npm audit --production",
    "audit:fix": "npm audit fix",
    "audit:report": "npm audit --json > audit-report.json"
  }
}
```

**Ejecución obligatoria:**
- ✅ Antes de cada release
- ✅ Semanalmente en desarrollo
- ✅ Después de actualizar dependencias

---

## 📝 Criterios de Aprobación

### **Cambios Críticos (Requieren Revisión Exhaustiva)**

**Categorías:**
- 🔴 Cambios en sistema de autenticación
- 🔴 Cambios en cifrado/descifrado
- 🔴 Cambios en control de acceso (RBAC)
- 🔴 Cambios en gestión de datos personales
- 🔴 Nuevas dependencias de npm

**Proceso:**
1. ✅ Revisión de seguridad detallada
2. ✅ Tests específicos de seguridad
3. ✅ Documentación actualizada
4. ✅ Registro en code-review-log.md
5. ✅ Aprobación explícita del Custodio Técnico

---

### **Cambios Menores (Revisión Automatizada Suficiente)**

**Categorías:**
- 🟢 Ajustes de UI/UX sin lógica
- 🟢 Correcciones de typos
- 🟢 Actualización de documentación
- 🟢 Cambios de estilo CSS

**Proceso:**
1. ✅ ESLint + TypeScript pasan
2. ✅ Tests existentes pasan
3. ✅ Build de producción exitoso

---

## 🚫 Cambios Prohibidos sin Revisión Manual

**NUNCA hacer merge directo de:**

```typescript
// ❌ PROHIBIDO sin revisión
- Código con eval()
- Uso de v-html con datos dinámicos
- Credenciales en código fuente
- Desactivación de reglas de seguridad
- Comentarios // @ts-ignore sin justificación
- Código que desactiva ESLint
```

**Estos cambios requieren:**
- ✅ Justificación documentada
- ✅ Aprobación explícita del Custodio Técnico
- ✅ Plan de mitigación de riesgos
- ✅ Tests de seguridad adicionales

---

## 📊 Métricas de Calidad

### **Indicadores Mínimos Aceptables**

| Métrica | Mínimo Requerido | Actual |
|---------|------------------|--------|
| **ESLint** | 0 errores | ✅ |
| **TypeScript** | 0 errores críticos | ✅ |
| **Tests Unitarios** | >70% cobertura | ✅ 218 tests |
| **Vulnerabilidades npm** | 0 críticas/altas | ✅ |
| **Build de Producción** | Exitoso | ✅ |

### **Métricas Deseadas (No bloqueantes)**

- Tests E2E: >90% de flujos críticos cubiertos
- Cobertura de código: >85%
- Performance: Lighthouse score >90
- Accesibilidad: WCAG 2.1 AA

---

## 🔒 Checklist de Seguridad en Code Review

### **Antes de Aprobar Cualquier Cambio:**

```markdown
### Autenticación y Autorización
- [ ] ¿Control de acceso verificado?
- [ ] ¿Roles y permisos correctos?
- [ ] ¿Sesiones gestionadas apropiadamente?

### Protección de Datos
- [ ] ¿Datos sensibles cifrados?
- [ ] ¿Contraseñas hasheadas (PBKDF2)?
- [ ] ¿No hay datos personales en logs?

### Validación de Inputs
- [ ] ¿Todos los inputs validados?
- [ ] ¿TypeScript types definidos?
- [ ] ¿Sanitización implementada?

### Prevención de Vulnerabilidades
- [ ] ¿Sin uso de v-html con datos dinámicos?
- [ ] ¿Sin eval() o Function()?
- [ ] ¿Sin credenciales hardcodeadas?
- [ ] ¿Variables de entorno usadas correctamente?

### Auditoría y Logs
- [ ] ¿Eventos críticos registrados?
- [ ] ¿Logs no exponen datos sensibles?
- [ ] ¿Timestamp e userId incluidos?

### Tests
- [ ] ¿Tests unitarios agregados?
- [ ] ¿Casos de seguridad testeados?
- [ ] ¿Tests pasan en local?

### Documentación
- [ ] ¿Cambios documentados?
- [ ] ¿README actualizado si necesario?
- [ ] ¿Comentarios en código complejo?
```

---

## 📁 Estructura de Branches (Recomendada)

### **Para Proyecto de Desarrollador Único:**

```
main (producción)
  ↑
  ├── feature/nueva-funcionalidad
  ├── fix/correccion-bug
  ├── security/mejora-seguridad
  └── docs/actualizacion-documentacion
```

**Reglas:**
- ✅ `main` siempre debe estar en estado deployable
- ✅ Crear branch por cada cambio significativo
- ✅ Merge a main solo después de verificación completa
- ✅ Tags para releases (v1.0.0, v1.1.0, etc.)

---

## 🔄 Proceso de Actualización de Dependencias

### **Frecuencia:**
- **Mensual:** Revisión de dependencias desactualizadas
- **Semanal:** `npm audit` para vulnerabilidades
- **Inmediato:** Vulnerabilidades críticas/altas

### **Proceso:**

```bash
# 1. Verificar dependencias desactualizadas
pnpm run deps:check

# 2. Auditar vulnerabilidades
pnpm run audit

# 3. Actualizar dependencias (con cuidado)
pnpm run deps:update

# 4. Ejecutar suite completa de tests
pnpm run test:all

# 5. Verificar build
pnpm run build

# 6. Si todo pasa, commit
git commit -m "chore: update dependencies"
```

**Documentar en code-review-log.md:**
- Qué dependencias se actualizaron
- Por qué (vulnerabilidad, nueva feature, etc.)
- Verificaciones realizadas

---

## 📞 Escalación de Problemas

### **Si se encuentra vulnerabilidad en Code Review:**

**Severidad CRÍTICA:**
1. ⚠️ DETENER el merge inmediatamente
2. 🔒 Notificar al Custodio Técnico
3. 📝 Documentar en `docs/03-security/security-incidents.md`
4. 🛠️ Crear plan de remediación
5. ✅ Re-revisar después de corrección

**Severidad MEDIA/BAJA:**
1. 📋 Crear issue en GitHub
2. 🏷️ Etiquetar como "security"
3. 📅 Priorizar en siguiente sprint
4. ✅ Merge puede proceder con aprobación

---

## 📚 Referencias

### **Documentación del Proyecto**
- `02-architecture/10-secure-coding-guidelines.md` - Guía de codificación segura
- `02-architecture/05-testing-guidelines.md` - Guía de testing
- `02-architecture/04-vuetify-guidelines.md` - Guía de Vuetify

### **Estándares Externos**
- **OWASP Code Review Guide:** https://owasp.org/www-project-code-review-guide/
- **Google Code Review Guidelines:** https://google.github.io/eng-practices/review/
- **AGESIC - Marco de Ciberseguridad:** https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/

---

## 📝 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 07-Oct-2025 | Mario BERNI | Versión inicial - Cumplimiento AD.1-B |

---

## ✅ Aprobación

**Custodio Técnico:** Mario BERNI  
**Fecha:** 07-Oct-2025  
**Próxima revisión:** 07-Ene-2026

---

**NOTA IMPORTANTE:** Este proceso es obligatorio para todos los cambios que se integren al sistema en producción. El incumplimiento puede resultar en vulnerabilidades de seguridad no detectadas y violación de requisitos de auditoría AGESIC.
