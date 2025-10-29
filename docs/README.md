# 📚 Documentación del Proyecto IRCCA

**Sistema de Control de Accesos del Instituto de Rehabilitación de Cárceles del Campo Artigas**

## 🚀 Inicio Rápido para Nuevos Desarrolladores

### 1️⃣ **Primera lectura obligatoria**
👉 [`00_PROJECT_GUIDE.md`](./00_PROJECT_GUIDE.md) - **Guía central del proyecto**

Contiene:
- Propósito del sistema
- Estructura de documentación
- Flujo de trabajo de desarrollo
- Convenciones y principios

### 2️⃣ **Setup técnico**
👉 `01-management/01-project-overview.md` - Visión general y alcance  
👉 `02-architecture/02-technical-stack.md` - Stack y tecnologías

### 3️⃣ **Seguridad (CRÍTICO)**
👉 [`03-security/00-SECURITY-INDEX.md`](./03-security/00-SECURITY-INDEX.md) - **Índice maestro de seguridad**

---

## 📁 Estructura de Documentación

### **01-management/** - Gestión del Proyecto
Documentos formales de planificación y gobernanza.

| Archivo | Descripción |
|---------|-------------|
| `01-project-overview.md` | Charter del proyecto + stakeholders |
| `02-project-execution.md` | Cronograma y entregables |
| `03-urcdp-registration.md` | Guía de registro legal |

**Cuándo consultar:** Entender objetivos, plazos, responsables.

---

### **02-architecture/** - Arquitectura Técnica
Guías conceptuales sobre cómo está construido el sistema.

| Archivo | Descripción |
|---------|-------------|
| `01-pwa-architecture.md` | Decisiones de diseño PWA |
| `02-technical-stack.md` | **📌 Stack tecnológico (fuente única verdad)** |
| `03-vuetify-guidelines.md` | Convenciones Vuetify 3 |
| `04-database-schema.md` | Schema IndexedDB (Parte 1) |
| `05-database-operations.md` | Operaciones DB (Parte 2) |
| `06-autocomplete-design.md` | Sistema autocomplete - Diseño |
| `07-autocomplete-implementation.md` | Sistema autocomplete - Implementación |
| `08-testing-guidelines.md` | **📌 Estrategia de testing unitario (Vitest)** |
| `10-e2e-testing-strategy.md` | **🎭 Estrategia E2E con Playwright** |
| `09-features-index.md` | Índice de funcionalidades |
| `CHANGELOG-DATABASE.md` | Historial de cambios DB |

**Cuándo consultar:** Antes de modificar arquitectura, agregar features, trabajar con DB.

---

### **03-security/** - Seguridad y Cumplimiento 🔒
**⚠️ LECTURA OBLIGATORIA antes de cualquier commit**

👉 **Empieza aquí:** [`00-SECURITY-INDEX.md`](./03-security/00-SECURITY-INDEX.md)

| Archivo | Descripción |
|---------|-------------|
| `00-SECURITY-INDEX.md` | **📌 Índice maestro - LEER PRIMERO** |
| `01-security-architecture.md` | Modelo 4 capas + cifrado AES-256 |
| `02-security-implementation.md` | Testing + code review + vulnerabilidades |
| `03-agesic-compliance.md` | Checklist auditoría AGESIC |
| `04-authority-notification.md` | Notificación CERTuy/URCDP |
| `05-arco-rights-procedure.md` | Procedimiento derechos ARCO |
| `06-pwa-compliance-report.md` | Reporte Lighthouse PWA |

**Cuándo consultar:** SIEMPRE. Antes de cada feature, commit crítico, o deploy.

---

### **04-design/** - UI/UX y Diseño
Todo relacionado con interfaz y experiencia de usuario.

| Archivo | Descripción |
|---------|-------------|
| `01-ui-design-system.md` | Paleta, tipografía, componentes |
| `02-ux-flows-definitions.md` | Flujos de usuario |

**Cuándo consultar:** Crear/modificar componentes visuales.

---

### **05-tasks/** - Seguimiento de Tareas
Estado actual del proyecto y pendientes.

| Archivo | Descripción |
|---------|-------------|
| `00-tasks-tracker.md` | Tablero Kanban del proyecto |

**Cuándo consultar:** Diario - saber qué hacer siguiente.

**Nota:** La carpeta `05-backup/` fue eliminada el 28-Oct-2025. La información del sistema de backups está consolidada en `02-architecture/09-features-index.md`.

---

### **07-development/** - Backlog y Planificación 🚀
**NUEVO:** Roadmap post-MVP y gestión de mejoras incrementales.

👉 **Empieza aquí:** [`00-DEVELOPMENT-INDEX.md`](./07-development/00-DEVELOPMENT-INDEX.md)

| Archivo | Descripción |
|---------|-------------|
| `00-DEVELOPMENT-INDEX.md` | **📌 Índice de desarrollo - LEER PRIMERO** |
| `01-post-mvp-backlog.md` | Backlog estructurado con 20 TODOs (3 sprints, ~60h) |

**Contenido del backlog:**
- ✅ 20 TODOs organizados por prioridad (9 Media, 9 Baja, 2 Alta)
- ✅ User Stories con criterios de aceptación
- ✅ Estimaciones de esfuerzo por sprint
- ✅ Matriz de priorización (Impact vs Effort)
- ✅ KPIs de éxito por epic

**Cuándo consultar:** 
- Planificación post-producción
- Priorización de features con stakeholders
- Retrospectivas de sprint
- Estimación de roadmap trimestral

---

### **manuals/** - Manuales de Usuario
Documentación HTML para usuarios finales.

- `MANUAL-OPERADOR.html`
- `MANUAL-SUPERVISOR.html`
- `MANUAL-USUARIO.html`
- `estilos.css`

**Cuándo consultar:** Entender flujos desde perspectiva usuario.

---

### **reports/** - Reportes de Auditoría
Artefactos generados de auditorías técnicas.

- `lighthouse-completo.html` - Reporte Lighthouse v12 (4 categorías)
- `lighthouse-pwa-v9.html` - Reporte PWA específico

**Cuándo consultar:** Validar performance/PWA/accesibilidad.

---

## 🎯 Flujos de Trabajo Comunes

### **Agregar Nueva Feature**
```
1. Consultar 05-tasks/00-tasks-tracker.md
2. Leer 02-architecture/02-technical-stack.md (stack)
3. Leer 03-security/01-security-architecture.md (requisitos seguridad)
4. Leer 02-architecture/08-testing-guidelines.md (tests unitarios)
5. Leer 02-architecture/10-e2e-testing-strategy.md (tests E2E)
6. Implementar con TDD
7. Ejecutar checklist 03-security/02-security-implementation.md
8. Actualizar tracker
```

### **Resolver Bug de Seguridad**
```
1. Leer 03-security/00-SECURITY-INDEX.md
2. Identificar capa afectada (01-security-architecture.md)
3. Verificar cumplimiento OWASP (02-security-implementation.md)
4. Implementar fix + tests
5. npm audit + tests de seguridad
6. Si es crítico → Notificar según 04-authority-notification.md
```

### **Pre-Deploy Checklist**
```bash
# Ejecutar en orden:
pnpm lint:check          # ✅ 0 errores
pnpm type-check          # ✅ TypeScript OK
pnpm test:unit           # ✅ 194 tests PASS
pnpm test:e2e            # ✅ 18/18 tests PASS (Chromium + WebKit)
npm audit                # ✅ 0 vulnerabilidades críticas

# Verificar documentación:
03-security/03-agesic-compliance.md → 90.9% cumplimiento ✅
```

---

## 🔑 Conceptos Clave del Proyecto

### **Tecnologías Core**
- **Frontend:** Vue 3 + Vite + Vuetify 3 + TypeScript
- **Estado:** Pinia
- **BD:** IndexedDB (offline-first)
- **Seguridad:** AES-256-GCM + PBKDF2
- **Testing:** Vitest (194 unitarios) + Playwright (18 E2E en Chromium/WebKit)
- **PWA:** Service Worker + Workbox

### **Principios de Desarrollo**
1. **Offline-first** - App funciona sin internet
2. **Security by design** - Seguridad desde inicio
3. **DRY** - Don't Repeat Yourself
4. **Testing** - TDD cuando aplica
5. **SOLID** - Single Responsibility, etc.

### **Cumplimiento Normativo**
- ✅ Ley N° 18.331 (Protección Datos Personales - Uruguay)
- ✅ AGESIC Marco de Ciberseguridad (90.9%)
- ✅ OWASP Top 10:2021 (9/10 cubierto)
- ✅ PWA Standards (Google Lighthouse 100%)

---

## 📞 Contacto y Soporte

**Seguridad / Vulnerabilidades:**
- Email: security@ircca.gub.uy
- Respuesta: < 24 horas

**Datos Personales:**
- Email: datospersonales@ircca.gub.uy
- Según Ley 18.331

**Incidentes de Ciberseguridad:**
- CERTuy: incidentes@cert.uy (+598 2901 2929)
- Plazo notificación: < 24 horas

---

## 📊 Estado del Proyecto

**Última actualización:** 21-Oct-2025

| Categoría | Estado | Notas |
|-----------|--------|-------|
| **Documentación** | ✅ 100% | Reorganizada 18-Oct-2025 |
| **Testing Unitario** | ✅ 100% | 194 tests PASS (Vitest) |
| **Testing E2E** | ✅ 100% Epic 1 | 18 tests PASS, 2 skip (Playwright) |
| **Seguridad AGESIC** | ✅ 90.9% | 10/11 requisitos |
| **PWA Compliance** | ✅ 100% | Lighthouse v9 PASS |
| **Tareas** | 🟡 79% | 19/24 completadas |

---

## 🚨 Avisos Importantes

### **⚠️ NUNCA hacer esto:**
- ❌ Hardcodear credenciales en código
- ❌ Usar datos reales en desarrollo
- ❌ Saltear tests de seguridad
- ❌ Commit sin ejecutar `npm audit`
- ❌ Modificar schema DB sin actualizar `CHANGELOG-DATABASE.md`

### **✅ SIEMPRE hacer esto:**
- ✅ Leer `03-security/00-SECURITY-INDEX.md` antes de features críticas
- ✅ Ejecutar `pnpm test:unit` antes de commit
- ✅ Validar entrada de usuario
- ✅ Cifrar datos sensibles (AES-256-GCM)
- ✅ Usar variables de entorno para credenciales

---

## 📖 Lectura Recomendada por Rol

### **👨‍💻 Desarrollador Frontend**
1. `00_PROJECT_GUIDE.md`
2. `02-architecture/02-technical-stack.md`
3. `02-architecture/03-vuetify-guidelines.md`
4. `04-design/01-ui-design-system.md`
5. `03-security/00-SECURITY-INDEX.md`

### **🔒 Security Reviewer**
1. `03-security/00-SECURITY-INDEX.md` (todos los archivos)
2. `02-architecture/08-testing-guidelines.md`
3. `reports/` (auditorías)

### **🏗️ Arquitecto de Sistema**
1. `02-architecture/01-pwa-architecture.md`
2. `02-architecture/04-database-schema.md`
3. `02-architecture/05-database-operations.md`
4. `03-security/01-security-architecture.md`

### **📋 Project Manager**
1. `01-management/01-project-overview.md`
2. `01-management/02-project-execution.md`
3. `05-tasks/00-tasks-tracker.md`

---

**¿Perdido? Empieza por [`00_PROJECT_GUIDE.md`](./00_PROJECT_GUIDE.md) 👈**
