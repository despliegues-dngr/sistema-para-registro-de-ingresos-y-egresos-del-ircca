# 📋 BACKLOG POST-MVP - Sistema IRCCA

**Versión:** 1.0  
**Fecha Creación:** 19-Oct-2025  
**Estado:** Planificación Post-Producción  
**TODOs Totales:** 20 items

---

## 🎯 Propósito del Documento

Este backlog organiza las **20 mejoras pendientes** identificadas en el código fuente como TODOs. Estas mejoras **NO son bloqueantes** para el deploy a producción, pero agregarán valor incremental al sistema en sprints post-MVP.

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **TODOs Totales** | 20 |
| **Prioridad Alta** | 4 (20%) |
| **Prioridad Media** | 9 (45%) |
| **Prioridad Baja** | 7 (35%) |
| **Esfuerzo Estimado Total** | ~60 horas |
| **Sprints Proyectados** | 3 sprints |

---

## 🏆 SPRINT 1 - Mejoras de Experiencia de Usuario (Semanas 1-2)

**Objetivo:** Implementar sistema de notificaciones y mejorar feedback visual  
**Duración:** 10 días hábiles  
**Esfuerzo Total:** ~24 horas

### 📌 EPIC 1.1: Sistema de Notificaciones Toast

**Prioridad:** 🟡 **MEDIA-ALTA**  
**Impacto:** Alto (mejora significativa de UX)  
**Esfuerzo:** 16 horas  
**Usuarios Beneficiados:** Todos (Admin, Supervisor, Operador)

#### User Stories:

**US-1.1.1: Toast de Confirmación en Registros**
- **Como** operador
- **Quiero** ver una notificación de éxito al registrar ingreso/salida
- **Para** confirmar visualmente que la acción se completó

**Archivos afectados:**
- `src/views/dashboard/DashboardView.vue` (líneas 212, 216)

**Criterios de Aceptación:**
- [ ] Toast verde aparece por 3 segundos tras registro exitoso
- [ ] Toast incluye ícono de éxito + mensaje descriptivo
- [ ] Toast no bloquea interacción con el sistema
- [ ] Animación suave de entrada/salida

**Estimación:** 4 horas

---

**US-1.1.2: Toast en Gestión de Perfil**
- **Como** usuario autenticado
- **Quiero** ver confirmación visual al actualizar perfil/contraseña
- **Para** saber que los cambios se guardaron correctamente

**Archivos afectados:**
- `src/components/dashboard/WelcomeHeader.vue` (líneas 240, 244)

**Criterios de Aceptación:**
- [ ] Toast confirma actualización de perfil
- [ ] Toast confirma cambio de contraseña exitoso
- [ ] Mensaje incluye nombre del campo actualizado

**Estimación:** 3 horas

---

**US-1.1.3: Toast en Exportación de Reportes**
- **Como** supervisor/admin
- **Quiero** ver confirmación al generar PDF
- **Para** saber que el archivo se generó correctamente

**Archivos afectados:**
- `src/components/dashboard/roles/SupervisorContent.vue` (línea 167)

**Criterios de Aceptación:**
- [ ] Toast aparece al completar generación PDF
- [ ] Mensaje indica nombre del archivo generado
- [ ] Opción de descargar desde el toast (opcional)

**Estimación:** 3 horas

---

**US-1.1.4: Toast en Gestión de Usuarios (Admin)**
- **Como** administrador
- **Quiero** ver notificaciones al modificar usuarios
- **Para** confirmar operaciones de gestión

**Archivos afectados:**
- `src/components/dashboard/roles/AdminContent.vue` (líneas 408, 448)

**Criterios de Aceptación:**
- [ ] Toast de error al intentar eliminar último admin
- [ ] Toast de confirmación al eliminar usuario exitosamente
- [ ] Mensajes descriptivos y contextuales

**Estimación:** 3 horas

---

**US-1.1.5: Toast en Operaciones de Clipboard**
- **Como** usuario del sistema
- **Quiero** ver confirmación al copiar datos al portapapeles
- **Para** saber que la operación fue exitosa

**Archivos afectados:**
- `src/components/ui/HelpDialog.vue` (línea 132)
- `src/components/dashboard/admin/audit/EventDetailDialog.vue` (línea 338)

**Criterios de Aceptación:**
- [ ] Toast discreto confirma "Copiado al portapapeles"
- [ ] Duración corta (2 segundos)
- [ ] Ícono de clipboard

**Estimación:** 3 horas

---

### 📦 Entregables Sprint 1:

1. ✅ Composable `useToast.ts` con API unificada
2. ✅ Componente global `ToastNotification.vue`
3. ✅ Integración en 9 puntos del código
4. ✅ Tests unitarios para sistema de toasts
5. ✅ Documentación de uso en `docs/`

---

## 🎨 SPRINT 2 - Funcionalidades Administrativas (Semanas 3-4)

**Objetivo:** Completar modales de gestión y exportación  
**Duración:** 10 días hábiles  
**Esfuerzo Total:** ~28 horas

### 📌 EPIC 2.1: Modales de Gestión de Usuarios

**Prioridad:** 🟡 **MEDIA**  
**Impacto:** Medio (funcionalidad ya existe en AdminContent, se duplica para acceso rápido)  
**Esfuerzo:** 12 horas  
**Usuarios Beneficiados:** Administradores

#### User Stories:

**US-2.1.1: Modal de Gestión de Usuarios desde Dashboard**
- **Como** administrador
- **Quiero** acceder a gestión de usuarios desde el dashboard principal
- **Para** no tener que navegar a la sección de admin

**Archivos afectados:**
- `src/views/dashboard/DashboardView.vue` (línea 221)

**Criterios de Aceptación:**
- [ ] Modal muestra tabla de usuarios (reutilizar componente)
- [ ] Incluye acciones de editar/eliminar
- [ ] Cierra con Esc o click fuera
- [ ] Actualiza datos al cerrar

**Estimación:** 4 horas

---

**US-2.1.2: Modal de Ver Perfil**
- **Como** usuario autenticado
- **Quiero** ver mi perfil en modal
- **Para** consultar mis datos sin navegar

**Archivos afectados:**
- `src/views/dashboard/DashboardView.vue` (línea 226)

**Criterios de Aceptación:**
- [ ] Modal muestra datos del usuario actual
- [ ] Formato de solo lectura elegante
- [ ] Botón de "Editar" abre modal de edición

**Estimación:** 3 horas

---

**US-2.1.3: Modal de Editar Perfil**
- **Como** usuario autenticado
- **Quiero** editar mi perfil en modal
- **Para** actualizar mis datos personales

**Archivos afectados:**
- `src/views/dashboard/DashboardView.vue` (línea 230)

**Criterios de Aceptación:**
- [ ] Formulario con validación
- [ ] Campos editables: nombre, email (no cédula)
- [ ] Confirmación antes de guardar
- [ ] Toast de éxito/error

**Estimación:** 3 horas

---

**US-2.1.4: Modal de Cambio de Contraseña**
- **Como** usuario autenticado
- **Quiero** cambiar mi contraseña desde modal
- **Para** mantener mi cuenta segura

**Archivos afectados:**
- `src/views/dashboard/DashboardView.vue` (línea 234)

**Criterios de Aceptación:**
- [ ] Solicita contraseña actual
- [ ] Validación de fortaleza de nueva contraseña
- [ ] Confirmación de nueva contraseña
- [ ] Hash con PBKDF2 (seguridad)

**Estimación:** 2 horas

---

### 📌 EPIC 2.2: Exportación de Reportes

**Prioridad:** 🟡 **MEDIA**  
**Impacto:** Medio (ya existe generación de PDF en otros módulos)  
**Esfuerzo:** 16 horas  
**Usuarios Beneficiados:** Administradores

#### User Stories:

**US-2.2.1: Exportación a PDF desde AdminContent**
- **Como** administrador
- **Quiero** exportar la tabla de usuarios a PDF
- **Para** generar reportes físicos

**Archivos afectados:**
- `src/components/dashboard/roles/AdminContent.vue` (línea 469)

**Criterios de Aceptación:**
- [ ] Botón "Exportar PDF" funcional
- [ ] Incluye logo institucional
- [ ] Tabla formateada profesionalmente
- [ ] Nombre de archivo con fecha: `usuarios_YYYY-MM-DD.pdf`

**Estimación:** 8 horas

---

**US-2.2.2: Exportación a CSV desde AdminContent**
- **Como** administrador
- **Quiero** exportar datos a CSV
- **Para** análisis en Excel/hojas de cálculo

**Archivos afectados:**
- `src/components/dashboard/roles/AdminContent.vue` (línea 473)

**Criterios de Aceptación:**
- [ ] Botón "Exportar CSV" funcional
- [ ] Codificación UTF-8 (caracteres especiales)
- [ ] Headers descriptivos
- [ ] Formato compatible con Excel

**Estimación:** 8 horas

---

### 📦 Entregables Sprint 2:

1. ✅ 4 componentes de modal (gestión, perfil, editar, password)
2. ✅ Servicio de exportación (`exportService.ts`)
3. ✅ Tests E2E para flujos de modales
4. ✅ Documentación de uso de exportación

---

## 🔧 SPRINT 3 - Optimizaciones y Limpieza (Semana 5)

**Objetivo:** Optimizar gestión de datos y limpieza técnica  
**Duración:** 5 días hábiles  
**Esfuerzo Total:** ~8 horas

### 📌 EPIC 3.1: Optimizaciones de Datos

**Prioridad:** 🟢 **BAJA**  
**Impacto:** Bajo (mejora de performance a largo plazo)  
**Esfuerzo:** 6 horas

#### User Stories:

**US-3.1.1: Limpieza de Datos Cifrados en Logout**
- **Como** sistema
- **Quiero** limpiar datos sensibles de memoria al cerrar sesión
- **Para** mejorar seguridad y liberar memoria

**Archivos afectados:**
- `src/stores/auth.ts` (línea 242)

**Criterios de Aceptación:**
- [ ] Limpia claves de cifrado de memoria
- [ ] Limpia datos temporales del store
- [ ] No afecta persistencia en IndexedDB
- [ ] Test de no-leak de memoria

**Estimación:** 3 horas

---

**US-3.1.2: Eliminación Selectiva de Registros Antiguos**
- **Como** administrador
- **Quiero** eliminar registros antiguos por ID
- **Para** gestionar el crecimiento de la base de datos

**Archivos afectados:**
- `src/services/databaseService.ts` (línea 502)

**Criterios de Aceptación:**
- [ ] Método `deleteRegistroById(id: string)`
- [ ] Validación de permisos (solo admin)
- [ ] Registro en auditoría
- [ ] Confirmación obligatoria

**Estimación:** 3 horas

---

### 📌 EPIC 3.2: Configuración Persistente

**Prioridad:** 🟢 **BAJA**  
**Impacto:** Bajo (mejora de persistencia de config)  
**Esfuerzo:** 2 horas

**US-3.2.1: Persistencia de Configuración de App**
- **Como** sistema
- **Quiero** guardar configuración en localStorage cifrado
- **Para** mantener preferencias entre sesiones

**Archivos afectados:**
- `src/stores/app.ts` (línea 50)

**Criterios de Aceptación:**
- [ ] Config se guarda cifrada en localStorage
- [ ] Se carga automáticamente al iniciar
- [ ] Validación de integridad

**Estimación:** 2 horas

---

### 📦 Entregables Sprint 3:

1. ✅ Funciones de limpieza optimizadas
2. ✅ Sistema de persistencia de config
3. ✅ Tests de rendimiento
4. ✅ Métricas de uso de memoria

---

## 📋 BACKLOG - Features Futuras (Post-Sprint 3)

### 🔮 Items de Baja Prioridad

**BACKLOG-1: Edición de Usuarios**
- **Archivo:** `src/components/dashboard/roles/AdminContent.vue` (línea 402)
- **Descripción:** Implementar lógica de edición de usuarios existentes
- **Esfuerzo:** 4 horas
- **Prioridad:** 🟢 BAJA (create/delete ya implementados)

**BACKLOG-2: Crear Vistas Gradualmente**
- **Archivo:** `src/router/index.ts` (línea 17)
- **Descripción:** Expandir rutas según necesidades futuras
- **Esfuerzo:** Variable
- **Prioridad:** 🟢 BAJA (depende de nuevos requisitos)

---

## 📊 Matriz de Priorización (Impact vs Effort)

```
         │ Alto Impacto
         │
ALTA     │  [EPIC 1.1]
Prioridad│  Notificaciones
         │     ⭐⭐⭐
─────────┼────────────────────────
         │  [EPIC 2.1]    [EPIC 2.2]
MEDIA    │   Modales      Exportación
         │     ⭐⭐          ⭐⭐
─────────┼────────────────────────
         │  [EPIC 3.1]  [EPIC 3.2]
BAJA     │  Optimización  Config
         │     ⭐          ⭐
         │
         └─────────────────────────
           Bajo Esfuerzo → Alto Esfuerzo
```

---

## 🎯 Criterios de Priorización Aplicados

### Metodología MoSCoW:

- **Must Have:** (0 items) - Todo ya implementado en MVP
- **Should Have:** EPIC 1.1 (Notificaciones) - 🟡 Alta prioridad post-MVP
- **Could Have:** EPIC 2.1, 2.2 (Modales y Exportación) - 🟡 Media prioridad
- **Won't Have (ahora):** EPIC 3.x, Backlog items - 🟢 Baja prioridad

---

## 📈 Métricas de Progreso

### Definición de Done (DoD) por Sprint:

**Sprint Completado cuando:**
- [ ] 100% de User Stories implementadas
- [ ] Tests unitarios/E2E pasan
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Deploy a staging exitoso
- [ ] UAT aprobado por stakeholders

### KPIs de Éxito:

| KPI | Meta |
|-----|------|
| **Tiempo de respuesta percibido** | -20% con toasts |
| **Satisfacción de usuarios** | +30% en encuestas |
| **Errores de usabilidad** | -50% en reportes |
| **Tiempo de exportación** | <3 segundos |

---

## 🔄 Proceso de Actualización

**Este backlog debe actualizarse:**
1. ✅ Al finalizar cada sprint (mover items a "Completado")
2. ✅ Al recibir nuevo feedback de usuarios
3. ✅ Al identificar nuevos TODOs en el código
4. ✅ Al cambiar prioridades de negocio

**Responsable:** Líder Técnico / Product Owner  
**Revisión:** Quincenal en retrospectivas

---

## 📞 Stakeholders y Validación

| Rol | Responsabilidad | Validación |
|-----|-----------------|------------|
| **Patrocinador (Tte. Lopez)** | Aprobación de prioridades | Por sprint |
| **Usuarios Finales** | UAT y feedback | Por epic |
| **Desarrollador** | Implementación | Diaria |
| **Enc. Seguridad IRCCA** | Validación funcional | Por sprint |

---

## ✅ Estado de Implementación

**Fecha de última actualización:** 19-Oct-2025

| Sprint | Estado | Completado | Pendiente |
|--------|--------|------------|-----------|
| **Sprint 1** | 🔵 Planificado | 0/5 US | 5 US |
| **Sprint 2** | 🔵 Planificado | 0/6 US | 6 US |
| **Sprint 3** | 🔵 Planificado | 0/3 US | 3 US |
| **Backlog** | ⚪ No programado | 0/2 items | 2 items |

**Total:** 0/16 items completados (0%)

---

## 🎓 Lecciones Aprendidas

### Del Proceso de Identificación de TODOs:

1. ✅ **Buena práctica:** TODOs bien distribuidos por categoría
2. ✅ **Fortaleza:** Ningún TODO crítico para seguridad
3. ⚠️ **Mejora:** Actualizar TODOs desactualizados regularmente
4. 💡 **Aprendizaje:** Convertir TODOs en backlog estructurado facilita planificación

### Recomendaciones Futuras:

- 📌 Vincular TODOs con issues de GitHub/Jira
- 📌 Establecer convención: `TODO(fecha): descripción`
- 📌 Review trimestral de TODOs en retrospectivas
- 📌 Limitar TODOs a <30 en total

---

## 📚 Referencias

- **Código Fuente:** Ver archivos mencionados en cada US
- **Auditoría Inicial:** `docs/03-security/07-security-audit-report.md`
- **Arquitectura:** `docs/02-architecture/`
- **Guía de Desarrollo:** `docs/02-architecture/03-vuetify-guidelines.md`

---

**Versión:** 1.0  
**Autor:** Sistema de Análisis de Código  
**Última Revisión:** 19-Oct-2025  
**Próxima Revisión:** Al iniciar Sprint 1

---

**💡 Nota Final:** Este backlog representa **deuda técnica controlada** y **mejoras incrementales**. El sistema es 100% funcional sin estos items, pero su implementación mejorará significativamente la experiencia de usuario y capacidades administrativas.
