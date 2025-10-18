# RESUMEN DEL PROYECTO - Sistema IRCCA

**PROYECTO:** Sistema de Control de Accesos del IRCCA  
**FECHA DE APROBACIÓN:** 08 de Septiembre de 2025  
**VERSIÓN:** 2.0 (Consolidado)

Montevideo, 28 de Agosto de 2025

> 📘 **Nota:** Este documento consolida el Acta de Constitución, Análisis de Stakeholders y Formulación del Proyecto.

---

## 1. PROPÓSITO Y JUSTIFICACIÓN

### Situación Actual

El control de acceso al predio del IRCCA es gestionado por personal de la Guardia Republicana (Servicio Art. 222) mediante un proceso completamente manual con planillas de papel para registrar ingresos de personas y vehículos.

### Problemática

El método manual presenta múltiples desventajas:

- **Retención de Documentación Personal:** Práctica lenta, éticamente cuestionable y riesgosa
- **Consume Tiempo Excesivo:** Retrasa ingresos/egresos del personal
- **Propenso a Errores:** Transcripción manual, caligrafía ilegible
- **Inseguridad de la Información:** Registros en papel pueden extraviarse o dañarse
- **Dificultad de Consulta:** Acceso a información histórica es complejo y lento

### Justificación

El desarrollo de una Progressive Web App (PWA) busca modernizar y automatizar este proceso crítico, proporcionando una herramienta tecnológica robusta, segura y a medida que mejorará drásticamente la operativa de control de acceso.

---

## 2. OBJETIVO Y CRITERIOS DE ÉXITO (SMART)

### Objetivo General

Desarrollar e implementar una Progressive Web App (PWA) para automatizar el registro, control y consulta de ingresos y egresos de personas y vehículos en el puesto de vigilancia del IRCCA.

### Criterios de Éxito Medibles

**Específico:** Reemplazar sistema de planillas manuales por aplicación digital en tablet

**Medible:**
- Reducir tiempo promedio de registro para nuevo visitante a <1 minuto
- Reducir tiempo de registro para visitantes recurrentes a <15 segundos (autocompletado)
- Eliminar 100% de errores de caligrafía y transcripción manual

**Alcanzable:** Proyecto factible con 1 desarrollador a tiempo completo + hardware provisto por institución

**Relevante:** Optimiza proceso de seguridad fundamental y mejora calidad de datos para auditorías

**con Plazo definido:** Desarrollo e implementación en 1 mes (09-Sep a 06-Oct-2025)

---

## 3. DESCRIPCIÓN Y ENTREGABLES PRINCIPALES

### Descripción de Alto Nivel

PWA instalada en tablet que permitirá al personal de seguridad registrar digitalmente todos los movimientos. Sistema funcionará offline, sincronizando datos cuando haya conexión, almacenando información local y segura mediante cifrado AES-256.

### Entregables Principales

1. **PWA de Registro IRCCA (v1.0)** - Aplicación funcional con módulos de ingreso/salida, consulta y gestión de usuarios
2. **Manual de Usuario** - Documento impreso para el puesto de control con instrucciones y troubleshooting
3. **Configuración Inicial** - Usuario Administrador creado manualmente con permisos de gestión
4. **Política de Uso y Privacidad** - Documento con reglas de uso y gestión de datos personales

---

## 4. PRINCIPALES INTERESADOS (STAKEHOLDERS)

### Matriz de Análisis de Interesados

| Interesado | Rol en el Proyecto | Posición | Influencia |
|------------|-------------------|----------|------------|
| **Tte. Rodrigo LOPEZ** | Patrocinador del Proyecto (Jefe Servicio 222) | Apoyo Total | Alta |
| **Encargado de Seguridad IRCCA** | Interesado Institucional Clave | Apoyo | Alta |
| **Operadores del Puesto (G.R.)** | Usuarios Finales Primarios | Apoyo | Alta (Colectiva) |
| **Mario BERNI** | Gerente de Proyecto / Desarrollador | Apoyo Total | Total (Técnica) |

### Motivación de Stakeholders

**Jefe del Servicio 222:**
- Mejorar operatividad y eficiencia del servicio
- Modernizar herramientas del personal
- Simplificar tareas complejas
- Incorporar mejora tecnológica significativa

**Encargado de Seguridad IRCCA:**
- Aumentar precisión y disponibilidad de datos de seguridad
- Acceder a base de datos centralizada para auditorías

**Operadores del Puesto:**
- Eliminar proceso manual tedioso (>200 registros diarios)
- Agilizar registro de personal recurrente
- Modernizar herramienta de trabajo diaria

**Gerente de Proyecto:**
- Entregar solución de alto impacto
- Demostrar capacidad técnica
- Modernizar proceso institucional clave

### Recursos Proporcionados

- **Encargado IRCCA:** Hardware (Tablet)
- **Operadores:** Retroalimentación desde operativa diaria
- **Gerente Proyecto:** 400 horas de desarrollo + conocimiento técnico

---

## 5. GOBERNANZA DEL PROYECTO

### Patrocinador del Proyecto
- **Nombre:** Tte. Rodrigo LOPEZ
- **Rol:** Jefe del Servicio 222 (Guardia Republicana)

### Equipo de Gestión y Desarrollo
- **Nombre:** Mario BERNI
- **Rol:** Gerente de Proyecto y Desarrollador
- **Autoridad:** Plena autoridad para decisiones técnicas y de desarrollo, reportando avances semanales al Patrocinador

### Otros Interesados Relevantes
- **Encargado de Seguridad del IRCCA:** Cliente institucional, validador de entregables, proveedor de hardware
- **Operadores del Puesto:** Usuarios finales, participantes críticos en UAT

---

## 6. HITOS PRINCIPALES

| Hito Clave | Fecha | Responsable Validación |
|------------|-------|------------------------|
| Diseño UI/UX Aprobado | 12-Sep-2025 | Enc. Seguridad IRCCA |
| Informe Avance Semana 1 | 15-Sep-2025 | Patrocinador |
| Informe Avance Semana 2 | 22-Sep-2025 | Patrocinador |
| Recepción de Tablet | 29-Sep-2025 | Gerente de Proyecto |
| Informe Avance Semana 3 | 29-Sep-2025 | Patrocinador |
| Manual Usuario Aprobado | 03-Oct-2025 | Patrocinador |
| **PROYECTO FINALIZADO** | **06-Oct-2025** | **Todos los Interesados** |

---

## 7. RESTRICCIONES Y EXCLUSIONES

### Restricciones
- **Plazo:** 4 semanas (09-Sep-2025 a 06-Oct-2025)
- **Presupuesto:** Sin presupuesto monetario (costos desarrollo: Gerente Proyecto; hardware: IRCCA)
- **Recursos:** Desarrollo por único recurso (Gerente/Desarrollador)
- **Hardware:** Tablet Android provista por IRCCA
- **Conectividad:** Sistema debe funcionar offline (conexión intermitente)

### Exclusiones
- **NO incluye:** Integración con sistemas externos del IRCCA o Ministerio del Interior
- **NO incluye:** Soporte técnico post-implementación de largo plazo
- **NO incluye:** Sincronización en la nube (datos solo locales en tablet)

---

## 8. INDICADORES DE ÉXITO

### Indicadores Técnicos
- ✅ PWA instalada y funcionando offline en tablet
- ✅ Tiempo de registro <1 minuto (nuevos) y <15 segundos (recurrentes)
- ✅ 100% de registros sin errores de transcripción
- ✅ Cifrado AES-256 implementado para datos sensibles

### Indicadores de Adopción
- ✅ 100% de operadores capacitados en uso del sistema
- ✅ Manual de usuario entregado y aprobado
- ✅ Satisfacción de usuarios finales ≥80% (encuesta UAT)

### Indicadores de Gestión
- ✅ Proyecto completado en plazo (06-Oct-2025)
- ✅ Todos los entregables aprobados por stakeholders
- ✅ Reuniones semanales de avance realizadas

---

## 9. SUPUESTOS Y RIESGOS PRINCIPALES

### Supuestos Clave
- Tablet Android será entregada a tiempo (29-Sep)
- Operadores tienen conocimientos básicos de uso de tablets
- No habrá cambios significativos en alcance durante ejecución
- Acceso al predio IRCCA estará disponible para pruebas

### Riesgos Principales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Retraso en entrega de tablet | Media | Alto | Desarrollar con emulador, ajustar cronograma si necesario |
| Resistencia al cambio de usuarios | Baja | Medio | Capacitación efectiva + manual claro |
| Problemas de rendimiento offline | Baja | Alto | Testing exhaustivo en condiciones reales |
| Pérdida de datos locales | Baja | Alto | Sistema de backups automáticos implementado |

---

## 10. APROBACIÓN DEL DOCUMENTO

**Gerente de Proyecto:** Mario BERNI  
**Fecha:** 08 de Septiembre de 2025

**Patrocinador del Proyecto:** Tte. Rodrigo LOPEZ  
**Fecha:** 08 de Septiembre de 2025

---

**Documentos consolidados en esta versión:**
- `01-project-charter.md` (205 líneas)
- `02-stakeholder-analysis.md` (103 líneas)
- `05-project-formulation.md` (142 líneas)

**Total:** 450 líneas → 280 líneas (38% reducción)
