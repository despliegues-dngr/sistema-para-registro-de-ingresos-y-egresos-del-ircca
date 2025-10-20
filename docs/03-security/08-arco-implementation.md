# 📋 IMPLEMENTACIÓN SISTEMA ARCO - Derechos de Acceso

**Versión:** 1.0  
**Fecha inicio:** 19-Oct-2025  
**Estado:** 🟡 En desarrollo (Fase 1 completada)  
**Cumplimiento:** Ley 18.331 - Protección de Datos Personales

---

## 🎯 Objetivo

Implementar sistema técnico que permita al administrador gestionar solicitudes de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) de ciudadanos según procedimiento documentado en `05-arco-rights-procedure.md`.

---

## 📊 Estado de Implementación

### ✅ FASE 1: Exportación de Datos Completos (COMPLETADO)

**Fecha:** 19-Oct-2025

#### Archivos Creados:

1. **`src/composables/useArcoDataExport.ts`** (406 líneas)
   - ✅ Composable para recopilación de datos de usuario por cédula
   - ✅ Interface `UserDataReport` con estructura completa
   - ✅ Función `recopilarDatosUsuario()` - busca en todos los stores
   - ✅ Función `exportarJSON()` - formato técnico completo
   - ✅ Función `exportarCSV()` - tabla de registros
   - ✅ Función `exportarTexto()` - formato legible para email
   - ✅ Función `generarReporteTexto()` - vista previa del reporte

2. **`src/components/dashboard/admin/ArcoDataExportCard.vue`** (322 líneas)
   - ✅ Card UI integrado en dashboard de administrador
   - ✅ Búsqueda por cédula con validación
   - ✅ Resumen de datos encontrados
   - ✅ Botones de exportación (TXT, CSV, JSON)
   - ✅ Vista previa del reporte en pantalla
   - ✅ Alertas informativas y de resultados

#### Funcionalidades Implementadas:

##### **A - Derecho de Acceso** ✅ 50% implementado

**Lo que FUNCIONA:**
- ✅ Búsqueda completa de registros por cédula
  - Registros de ingreso con detalles (fecha, hora, destino, vehículo, acompañantes)
  - Registros de salida con duración de estadía
  - Datos en personas conocidas (si existen)
- ✅ Reporte estructurado con información legal:
  - Finalidad del tratamiento
  - Base legal
  - Plazo de conservación
  - Destinatarios
  - Derechos adicionales
- ✅ Exportación en 3 formatos:
  - **TXT:** Formato legible para responder por email
  - **CSV:** Tabla de registros para análisis
  - **JSON:** Formato técnico completo con metadata

**Ejemplo de uso:**
```typescript
// En el dashboard de admin
const { recopilarDatosUsuario, exportarTexto } = useArcoDataExport()

// Buscar datos del ciudadano
const reporte = await recopilarDatosUsuario(
  '12345678',      // cédula
  'admin-user-id', // userId del admin
  'acceso'         // tipo de solicitud
)

// Exportar en formato legible
exportarTexto(reporte)
// Descarga: ARCO_Acceso_12345678_2025-10-19.txt
```

**Lo que FALTA:**
- ❌ Registro formal de la solicitud (tracking)
- ❌ Generación de número de solicitud (ej. ARCO-2025-001)
- ❌ Sistema de estados (Recibida → En proceso → Respondida)
- ❌ Logs de auditoría específicos para exportaciones ARCO

---

### 🔜 FASE 2: Store de Solicitudes ARCO (PENDIENTE)

**Prioridad:** Media  
**Tiempo estimado:** 2-3 horas

#### Archivos a Crear:

1. **`src/stores/arcoRequests.ts`**
   - Store Pinia para gestión de solicitudes
   - Interface `ArcoRequest` con campos:
     - id: string (ej. ARCO-2025-001)
     - cedula: string
     - tipo: 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
     - estado: 'recibida' | 'en_proceso' | 'respondida' | 'rechazada'
     - fechaRecepcion: Date
     - fechaRespuesta?: Date
     - solicitante: { nombre, email, contacto }
     - procesadoPor: string (userId del admin)
     - observaciones?: string
   - CRUD completo de solicitudes
   - Persistencia en IndexedDB

#### Funcionalidades:

- Crear solicitud con auto-incremento de ID
- Actualizar estado de solicitud
- Búsqueda de solicitudes por cédula
- Filtros por estado y tipo
- Generación de reportes de solicitudes

---

### 🔜 FASE 3: Panel Administrativo ARCO (PENDIENTE)

**Prioridad:** Media  
**Tiempo estimado:** 4-5 horas

#### Archivos a Crear:

1. **`src/views/admin/GestionArcoView.vue`**
   - Vista completa de gestión de solicitudes
   - Tabla de solicitudes con filtros
   - Modal para crear nueva solicitud
   - Modal para procesar solicitud existente

2. **`src/components/dashboard/admin/arco/ArcoRequestForm.vue`**
   - Formulario para registrar solicitud
   - Validación de datos del solicitante
   - Selección de tipo de derecho

3. **`src/components/dashboard/admin/arco/ArcoRequestTable.vue`**
   - Tabla de solicitudes con estado
   - Acciones rápidas (ver, procesar, responder)
   - Indicadores visuales de antigüedad

4. **`src/components/dashboard/admin/arco/ArcoProcessDialog.vue`**
   - Workflow guiado para procesar solicitud
   - Integración con `useArcoDataExport` para Acceso
   - Formulario de rectificación de datos
   - Confirmación de eliminación de datos

#### Funcionalidades:

- Dashboard de solicitudes pendientes
- Workflow completo por tipo de solicitud:
  - **Acceso:** Generar y exportar reporte
  - **Rectificación:** Buscar registro → Editar → Confirmar
  - **Cancelación:** Buscar registros → Eliminar con confirmación
  - **Oposición:** Evaluar y documentar decisión
- Notificaciones de solicitudes antiguas (>10 días)
- Generación de plantillas de respuesta

---

### 🔜 FASE 4: Mejoras de Auditoría (PENDIENTE)

**Prioridad:** Baja  
**Tiempo estimado:** 1-2 horas

#### Archivos a Modificar:

1. **`src/stores/audit.ts`**
   - Nuevo tipo de evento: `'arco_request'`
   - Acciones específicas:
     - `arco.solicitud_recibida`
     - `arco.datos_exportados`
     - `arco.rectificacion_aplicada`
     - `arco.datos_eliminados`

2. **`src/composables/useArcoDataExport.ts`**
   - Agregar log de auditoría al exportar datos
   - Registrar quién exportó y cuándo

#### Funcionalidades:

- Trazabilidad completa de operaciones ARCO
- Reportes de cumplimiento para AGESIC
- Estadísticas de solicitudes procesadas

---

## 📋 Checklist de Cumplimiento

### Requisitos Legales (Ley 18.331)

- ✅ Procedimiento documentado (`05-arco-rights-procedure.md`)
- ⚠️ **Acceso:** Funcionalidad técnica ✅ | Workflow formal ❌
- ❌ **Rectificación:** Capacidad técnica existe, interfaz pendiente
- ❌ **Cancelación:** Capacidad técnica existe, interfaz pendiente
- ❌ **Oposición:** No implementado (aplicabilidad limitada)
- ❌ Registro de solicitudes (obligatorio según docs/)
- ❌ Templates de respuesta
- ❌ Control de plazos (10 días hábiles)

### Cumplimiento AGESIC (Requisito PD.8)

- ✅ Documentación completa
- ⚠️ Implementación parcial (40%)
- ❌ Sistema completo operativo

---

## 🚀 Próximos Pasos Inmediatos

### Prioridad ALTA (Cierre de brecha crítica):

1. **Completar Fase 1:**
   - ✅ Composable de exportación
   - ✅ UI de exportación
   - ⚠️ Agregar logs de auditoría a exportaciones
   - ⚠️ Testing del composable

2. **Iniciar Fase 2:**
   - Crear store de solicitudes
   - Implementar persistencia en IndexedDB
   - CRUD básico

### Prioridad MEDIA (Workflow completo):

3. **Completar Fase 2 y 3:**
   - Panel de gestión de solicitudes
   - Workflows guiados por tipo
   - Integración con sistema de usuarios

### Prioridad BAJA (Mejoras):

4. **Fase 4:**
   - Auditoría completa
   - Reportes estadísticos
   - Optimizaciones de UX

---

## 🧪 Testing Requerido

### Tests Unitarios (Pendiente)

```typescript
// src/composables/__tests__/useArcoDataExport.spec.ts
describe('useArcoDataExport', () => {
  it('debe recopilar datos de usuario correctamente')
  it('debe generar reporte con estructura completa')
  it('debe manejar usuario sin registros')
  it('debe incluir información legal obligatoria')
  it('debe exportar en formato TXT correcto')
  it('debe exportar en formato CSV válido')
  it('debe exportar en formato JSON válido')
})
```

### Tests de Integración (Pendiente)

- Búsqueda de registros en BD real
- Exportación de archivos
- Integración con dashboard de admin

### Tests E2E (Pendiente)

- Flujo completo: buscar → exportar → verificar archivo
- Validación de formularios
- Manejo de errores

---

## 📊 Métricas de Progreso

| Fase | Estado | Completitud | Archivos | Líneas Código |
|------|--------|-------------|----------|---------------|
| **Fase 1** | ✅ Completado | 100% | 2 archivos | ~728 líneas |
| **Fase 2** | 🔴 Pendiente | 0% | - | - |
| **Fase 3** | 🔴 Pendiente | 0% | - | - |
| **Fase 4** | 🔴 Pendiente | 0% | - | - |
| **TOTAL** | 🟡 En progreso | 25% | 2/8 archivos | 728 líneas |

---

## 🔗 Referencias

### Documentación Relacionada:

- `docs/03-security/00-SECURITY-INDEX.md` - Índice maestro
- `docs/03-security/05-arco-rights-procedure.md` - Procedimiento completo
- `docs/03-security/01-security-architecture.md` - Arquitectura de seguridad

### Código Relacionado:

- `src/stores/registro.ts` - Store principal de registros
- `src/composables/useRegistros.ts` - Composable de búsqueda
- `src/composables/useDatabase.ts` - Operaciones de BD
- `src/stores/audit.ts` - Sistema de auditoría

### Normativa Legal:

- Ley N° 18.331 - Protección de Datos Personales (Uruguay)
- Decreto 414/009 - Reglamentación Ley 18.331
- Marco de Ciberseguridad AGESIC - Requisito PD.8

---

## 👤 Responsables

**Desarrollador:** Mario BERNI  
**Custodio Técnico:** Mario BERNI  
**Contacto ARCO:** datospersonales@ircca.gub.uy

---

## 📝 Registro de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.2 | 19-Oct-2025 | Mario BERNI | Fix: Corrección mapping destino y operadorId en reportes |
| 1.1 | 19-Oct-2025 | Mario BERNI | Mejora UX: Autocomplete en búsqueda de cédula |
| 1.0 | 19-Oct-2025 | Mario BERNI | Fase 1 completada: Composable y UI de exportación |

---

**Próxima revisión:** 26-Oct-2025  
**Objetivo próxima revisión:** Completar Fase 2 (Store de solicitudes)
