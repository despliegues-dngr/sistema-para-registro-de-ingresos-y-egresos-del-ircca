# 📂 Índice de Documentos de Desarrollo - Sistema IRCCA

**Versión:** 1.1  
**Fecha:** 21-Oct-2025  
**Propósito:** Centralizar documentación técnica del proceso de desarrollo

---

## 📋 Documentos Disponibles

### 1. [`01-post-mvp-backlog.md`](./01-post-mvp-backlog.md)

**Propósito:** Roadmap estructurado de mejoras post-MVP

**Contenido:**
- ✅ 20 TODOs organizados en 3 sprints
- ✅ User Stories con criterios de aceptación
- ✅ Matriz de priorización (Impact vs Effort)
- ✅ Estimaciones de esfuerzo (60 horas total)
- ✅ KPIs de éxito por epic

**Cuándo consultar:**
- 📌 Planificación de sprints post-producción
- 📌 Priorización de features con stakeholders
- 📌 Estimación de roadmap trimestral
- 📌 Retrospectivas de sprint

**Estado:** ✅ Completo y listo para ejecución

---

## 🎯 Flujos de Trabajo por Situación

### **🚀 Iniciar Desarrollo Post-MVP**

**Proceso:**
1. Leer `01-post-mvp-backlog.md` sección "Sprint 1"
2. Crear issues/tickets para cada User Story
3. Asignar estimaciones y responsables
4. Iniciar desarrollo siguiendo DoD

**Artefactos:**
- Backlog en formato markdown
- User Stories con criterios claros
- Matriz de priorización

---

### **📊 Reportar Progreso a Stakeholders**

**Métricas clave del backlog:**
- Total TODOs: 20 items
- Esfuerzo estimado: ~60 horas (3 sprints)
- Distribución: 45% Media, 35% Baja, 20% Alta prioridad
- ROI esperado: +30% satisfacción de usuarios

**Dashboard de progreso:**
Ver sección "Estado de Implementación" en `01-post-mvp-backlog.md`

---

### **🔄 Actualizar Backlog**

**Triggers para actualización:**
1. ✅ Sprint completado → Actualizar estado
2. ✅ Nuevo TODO identificado → Agregar y re-priorizar
3. ✅ Feedback de usuarios → Ajustar prioridades
4. ✅ Cambio de requisitos → Re-evaluar impacto

**Responsable:** Líder Técnico / Product Owner

---

## 📈 Estado Actual del Proyecto

| Fase | Estado | Fecha |
|------|--------|-------|
| **MVP Completado** | ✅ 100% | 18-Oct-2025 |
| **Deploy a Producción** | 🔵 Ready | Pendiente aprobación |
| **Sprint 1 (Post-MVP)** | 🔵 Planificado | Sin fecha |
| **Sprint 2 (Post-MVP)** | 🔵 Planificado | Sin fecha |
| **Sprint 3 (Post-MVP)** | 🔵 Planificado | Sin fecha |

---

## 🎓 Mejores Prácticas de Desarrollo

### Code Quality Standards:

**Referencia:** `docs/02-architecture/`
- Seguir guías de Vuetify (`03-vuetify-guidelines.md`)
- Mantener cobertura de tests >80%
- Code reviews obligatorios
- Commits convencionales (feat/fix/refactor)

### Security Standards:

**Referencia:** `docs/03-security/00-SECURITY-INDEX.md`
- Checklist pre-commit obligatorio
- Auditoría de dependencias semanal
- Tests de seguridad en cada feature
- RBAC en todas las rutas nuevas

---

## 🔗 Referencias Relacionadas

### Documentación Técnica:
- **Arquitectura:** `docs/02-architecture/01-pwa-architecture.md`
- **Stack Técnico:** `docs/02-architecture/02-technical-stack.md`
- **Seguridad:** `docs/03-security/00-SECURITY-INDEX.md`
- **Diseño UI:** `docs/04-design/01-ui-design-system.md`

### Gestión del Proyecto:
- **Overview:** `docs/01-management/01-project-overview.md`
- **Ejecución:** `docs/01-management/02-project-execution.md`

---

## 📊 Métricas del Proyecto

### Código:
- **Líneas de código:** ~8,000 (TypeScript + Vue)
- **Tests Unitarios:** 194 tests pasando (Vitest)
- **Tests E2E:** 18 tests pasando, 2 skipped (Playwright - Chromium + WebKit)
- **Cobertura:** >85%
- **Archivos:** ~60 archivos fuente

### Calidad:
- **TODOs:** 20 (0 críticos)
- **Vulnerabilidades:** 0 críticas
- **Technical Debt:** Bajo (controlado)
- **Security Score:** 24/24 controles ✅

### Documentación:
- **Docs totales:** 20+ archivos markdown
- **Cobertura:** ~95% del sistema documentado
- **Actualización:** Sincronizado con código

---

## 🔄 Ciclo de Actualización

**Este índice debe actualizarse cuando:**
1. ✅ Se agreguen nuevos documentos de desarrollo
2. ✅ Cambien estados de sprints
3. ✅ Haya cambios mayores en arquitectura
4. ✅ Se completen hitos importantes

**Responsable:** Líder Técnico  
**Frecuencia:** Mensual o al finalizar sprints

---

## 📞 Contactos del Equipo de Desarrollo

**Líder Técnico:** Mario BERNI  
**Patrocinador:** Tte. Rodrigo LOPEZ  
**Validador Funcional:** Enc. Seguridad IRCCA  
**Usuarios Piloto:** Operadores del Puesto

---

**Versión:** 1.1  
**Última Actualización:** 21-Oct-2025  
**Próxima Revisión:** Al completar Epic 2 E2E (Registro Ingresos)

---

**💡 Tip:** Mantén este índice como referencia rápida para navegar la documentación técnica del proyecto.
