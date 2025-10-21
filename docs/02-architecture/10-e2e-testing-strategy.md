# 🎭 ESTRATEGIA DE TESTING E2E CON PLAYWRIGHT

**Versión:** 1.1  
**Fecha:** 21-Oct-2025  
**Estado:** ✅ Epic 1 Completado - 18/18 tests pasando (100%)

> 📘 **Referencia:** [Playwright Docs](https://playwright.dev/) | [Page Object Model](https://playwright.dev/docs/pom)

---

## 🎯 Objetivos y Métricas

### Objetivos:
- ✅ Validar flujos críticos end-to-end
- ✅ Detectar regresiones entre módulos
- ✅ Verificar funcionalidad offline (PWA)
- ✅ Compatibilidad multi-navegador (Chromium, WebKit)

> **Nota:** Firefox excluido de tests - PWA se desplegará solo en Chrome/Edge, por lo que testing en Chromium es suficiente

### Métricas de Éxito:
- 100% flujos críticos cubiertos | Tiempo ejecución < 5 min | 0% flakiness

---

## 🏗️ ARQUITECTURA: PAGE OBJECT MODEL

### Estructura E2E:
```
e2e/
├── pages/          # Page Objects (LoginPage, DashboardPage, etc.)
├── fixtures/       # Datos de prueba (usuarios.ts, registros.ts)
├── helpers/        # Funciones auxiliares (auth.ts, database.ts)
├── specs/          # Tests organizados por flujo (01-auth.spec.ts, etc.)
└── playwright.config.ts  # ✅ Ya configurado
```

### Patrón Page Object:
Ver [ejemplo oficial de Playwright](https://playwright.dev/docs/pom#example)

---

## 🎯 PRIORIZACIÓN DE CASOS DE PRUEBA

### 🔴 CRÍTICA (Sprint 1-2 | 28-40h)

**Epic 1: Autenticación** (8-12h)
- Login exitoso/fallido por rol | Logout | Timeout sesión | RBAC guards

**Epic 2: Registro Ingresos** (12-16h)
- Registro completo (persona+vehículo+acompañantes) | Validaciones | Autocompletado | Persistencia IndexedDB

**Epic 3: Registro Salidas** (8-12h)
- Búsqueda persona | Registro salida | Validaciones | Actualización estado

---

### 🟡 MEDIA (Sprint 3-4 | 24-32h)

**Epic 4: Consultas/Reportes** (12-16h)
- Consulta personas dentro | Historial persona/vehículo | Generación PDF | Filtros fecha

**Epic 5: Administración Usuarios** (12-16h)
- CRUD usuarios | Validación último admin | Cambio contraseña | Auditoría

---

### 🟢 BAJA (Sprint 5-6 | 28-36h)

**Epic 6: Auditoría/Exportación** (12-16h)
- Consulta logs | Filtros (evento/usuario/fecha) | Exportación CSV/ARCO

**Epic 7: PWA Offline** (16-20h)
- Instalación PWA | Funcionamiento offline | Sincronización | Service worker

---

## 💻 IMPLEMENTACIÓN

### Best Practices
- **Selectores:** Usar `getByRole()`, `getByLabel()` (semánticos) vs. CSS frágiles
- **Esperas:** Auto-wait de Playwright (no `waitForTimeout`)
- **Tests:** Independientes con setup/teardown en `beforeEach/afterEach`
- **Assertions:** Descriptivas con mensajes de error claros

Ver [Playwright Best Practices](https://playwright.dev/docs/best-practices) para detalles completos

---

## 🚀 CI/CD Y COMANDOS

### Comandos Principales
```bash
pnpm test:e2e                    # Ejecutar todos los tests
npx playwright test --ui         # Modo debugging UI
npx playwright show-report       # Ver reporte HTML
```

### Integración CI/CD
Ver [Playwright CI Guide](https://playwright.dev/docs/ci) para configuración de GitHub Actions/GitLab CI

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN

| Fase | Duración | Entregable | Esfuerzo |
|------|----------|------------|----------|
| **Fase 1: Fundamentos** | Semana 1-2 | 15-20 tests críticos (Auth + Ingreso) | 20-28h |
| **Fase 2: Operativos** | Semana 3-4 | 30-35 tests (Salida + Consultas) | 24-32h |
| **Fase 3: Admin** | Semana 5-6 | 45-50 tests (Usuarios + Auditoría) | 24-32h |
| **Fase 4: PWA** | Semana 7-8 | 60+ tests completos (Offline + Edge) | 16-20h |

**Total estimado:** 84-112 horas (~10-14 semanas con 1 dev)

---

## 📊 ESTADO DE IMPLEMENTACIÓN

**Última Actualización:** 21-Oct-2025  
**Responsable Actual:** Cascade AI + Equipo Dev  
**Tests Implementados:** 18/60+ (30%)  
**Browsers Target:** Chromium + WebKit (Firefox excluido por decisión de deploy)

### 🔴 CRÍTICA - Sprint 1-2

- [x] **Epic 1: Autenticación** (18/18 tests | 12h/12h) ✅ **100% COMPLETADO**
  - [x] Login exitoso por rol (Admin/Supervisor) - 4 tests (2 browsers)
  - [x] Login fallido con credenciales inválidas - 6 tests (3 escenarios × 2 browsers)
  - [x] Logout y limpieza de sesión - 4 tests (2 escenarios × 2 browsers)
  - [x] Redirección según rol (RBAC) - 4 tests (2 escenarios × 2 browsers)
  - [ ] Login Operador - 2 tests skip (usuario no existe en sistema)
  
  **Archivos creados:**
  - `e2e/pages/LoginPage.ts` ✅
  - `e2e/pages/DashboardPage.ts` ✅
  - `e2e/helpers/auth.ts` ✅
  - `e2e/fixtures/usuarios.ts` ✅
  - `e2e/specs/01-auth.spec.ts` ✅
  - `playwright.config.ts` ✅ (Firefox deshabilitado)
  
  **Resultado final:** 18 passed, 2 skipped, 0 failed (Chromium + WebKit)
  **Tiempo ejecución:** ~2.1 minutos
  
  **Lecciones aprendidas:**
  - WebKit requiere timeouts más largos para animaciones CSS (Vuetify v-menu)
  - `cleanDatabase()` necesita 2s para esperar hasheo asíncrono de passwords
  - Admin tiene dashboard diferente sin stats cards de operador
  - Selectores semánticos (`getByText`, `getByRole`) son más resilientes

- [ ] **Epic 2: Registro Ingresos** (0/6 tests | 0h/16h)
  - [ ] Registro completo (persona + vehículo)
  - [ ] Registro con acompañantes
  - [ ] Validación de campos obligatorios
  - [ ] Autocompletado de cédula
  - [ ] Persistencia en IndexedDB
  - [ ] Auditoría de registro

- [ ] **Epic 3: Registro Salidas** (0/5 tests | 0h/12h)
  - [ ] Búsqueda y selección de persona
  - [ ] Registro de salida exitoso
  - [ ] Validación persona no encontrada
  - [ ] Actualización de estado
  - [ ] Auditoría de salida

---

### 🟡 MEDIA - Sprint 3-4

- [ ] **Epic 4: Consultas/Reportes** (0/5 tests | 0h/16h)
  - [ ] Consulta personas actualmente dentro
  - [ ] Historial de persona
  - [ ] Historial de vehículo
  - [ ] Generación de PDF
  - [ ] Filtrado por fechas

- [ ] **Epic 5: Administración Usuarios** (0/6 tests | 0h/16h)
  - [ ] Creación de usuario
  - [ ] Modificación de usuario
  - [ ] Eliminación de usuario
  - [ ] Validación último admin
  - [ ] Cambio de contraseña
  - [ ] Auditoría de operaciones

---

### 🟢 BAJA - Sprint 5-6

- [ ] **Epic 6: Auditoría/Exportación** (0/6 tests | 0h/16h)
  - [ ] Consulta de logs
  - [ ] Filtro por tipo de evento
  - [ ] Filtro por usuario
  - [ ] Filtro por fecha
  - [ ] Exportación a CSV
  - [ ] Exportación datos ARCO

- [ ] **Epic 7: PWA Offline** (0/5 tests | 0h/20h)
  - [ ] Instalación de PWA
  - [ ] Funcionamiento offline
  - [ ] Sincronización online
  - [ ] Cache de assets
  - [ ] Update service worker

---

### 📈 Métricas de Progreso

| Sprint | Epics | Tests | Horas | Estado |
|--------|-------|-------|-------|--------|
| **Sprint 1-2** | 1/3 | 18/17 | 12/40h | 🔄 En Progreso |
| **Sprint 3-4** | 0/2 | 0/11 | 0/32h | ⏳ Pendiente |
| **Sprint 5-6** | 0/2 | 0/11 | 0/36h | ⏳ Pendiente |
| **TOTAL** | **1/7 (14%)** | **18/39 (46%)** | **12/108h (11%)** | **🔄 30% Completado** |

**Estados:** ⏳ Pendiente | 🔄 En Progreso | ✅ Completado

**Próximo Epic:** Epic 2 - Registro de Ingresos

---

## 📚 REFERENCIAS

**Documentación Oficial:**
- [Playwright Docs](https://playwright.dev/) | [Best Practices](https://playwright.dev/docs/best-practices) | [POM](https://playwright.dev/docs/pom)

**Documentación Interna:**
- [`08-testing-guidelines.md`](./08-testing-guidelines.md) - Testing unitario
- [`02-technical-stack.md`](./02-technical-stack.md) - Stack técnico
- [`01-pwa-architecture.md`](./01-pwa-architecture.md) - Arquitectura

---

**Versión:** 1.0 | **Fecha:** 21-Oct-2025 | **Próxima Revisión:** Al completar Fase 1
