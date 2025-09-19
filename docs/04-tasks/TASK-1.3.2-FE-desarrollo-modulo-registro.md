# 📋 TASK 1.3.2-FE - DESARROLLO FE: MÓDULO DE REGISTRO

**CÓDIGO EDT:** 1.3.2-FE
**RESPONSABLE:** Mario BERNI (Gerente de Proyecto)
**DURACIÓN:** 2 días
**FECHAS:** 18-Sep-2025 → 19-Sep-2025
**DEPENDE DE:** 1.3.1-FE (Autenticación y Layout)

---

## 📋 OBJETIVOS DE LA TAREA

1. **Implementar modal de registro de ingreso** con formulario completo de datos personales y vehículo.
2. **Implementar modal de registro de salida** con funcionalidad de búsqueda y selección.
3. **Integrar modals con el Dashboard** mediante botones de acción rápida.
4. **Conectar con stores** para persistencia de datos y actualización de estado.

---

## 🚀 SUBTAREAS DETALLADAS

### Fase 0: Setup TDD y Pruebas Unitarias

- [x] **0.1 Crear estructura de testing para registro**
  - [x] Crear `src/stores/registro.ts` con estructura inicial y tipos
  - [x] Crear `src/stores/__tests__/registro.spec.ts` con casos de prueba base
  - [x] Verificar integración con Vitest (`pnpm test:unit`)
  - [x] Implementar primeros tests para acciones básicas: `registrarIngreso()` y `registrarSalida()`

- [x] **0.2 Definir interfaz del store**
  - [x] Definir tipos TypeScript para `RegistroIngreso`, `RegistroSalida`, `PersonaDentro`
  - [x] Establecer estado inicial del store con propiedades reactivas
  - [x] Crear getters para estadísticas y consultas frecuentes

### Fase 1: Modal de Registro de Ingreso

- [x] **1.1 Crear componente `RegistroIngresoModal.vue`**
  - [x] Modal con `v-dialog` que se superponga al Dashboard
  - [x] Formulario con secciones: Datos Personales, Datos de Visita, Datos de Vehículo (opcional)
  - [x] Validaciones en tiempo real según `VALIDATION_PATTERNS`
  - [x] Estados de carga y mensajes de error/éxito

- [x] **1.2 Implementar formulario de datos personales**
  - [x] Campos: Cédula (8 dígitos), Nombre, Apellido, Teléfono (opcional)
  - [x] Validación de formato de cédula y teléfono
  - [x] Campo de cédula como foco inicial

- [x] **1.3 Implementar formulario de datos de visita**
  - [x] Selector de tipo de visitante
  - [x] Selector de área a visitar
  - [x] Campo de texto para motivo

- [x] **1.4 Implementar sección de vehículo (expandible)**
  - [x] Campos: Matricula (ABC1234), Modelo, Color
  - [x] Validación de formato de Matricula
  - [x] Sección colapsable para no sobrecargar UI

### Fase 2: Modal de Registro de Salida

- [x] **2.1 Crear componente `RegistroSalidaModal.vue`**
  - [x] Modal con funcionalidad de búsqueda principal
  - [x] Campo de búsqueda por cédula con filtrado en tiempo real
  - [x] Lista de resultados de personas dentro del predio

- [x] **2.2 Implementar funcionalidad de búsqueda**
  - [x] Búsqueda por cédula con filtrado instantáneo
  - [x] Lista visual de personas actualmente dentro
  - [x] Selección clara de la persona correcta

- [x] **2.3 Implementar información adicional**
  - [x] Mostrar tiempo transcurrido desde ingreso
  - [x] Campo opcional de observaciones sobre la salida
  - [x] Confirmación antes de registrar salida

### Fase 3: Integración con Dashboard

- [x] **3.1 Actualizar `DashboardView.vue`**
  - [x] Agregar botones "Registrar Ingreso" y "Registrar Salida"
  - [x] Integrar modals con v-model para control de visibilidad
  - [x] Actualizar estadísticas tras registros exitosos

- [x] **3.2 Conectar con stores**
  - [x] Integrar con `registroStore` (crear si no existe)
  - [x] Actualizar `personas_dentro` en tiempo real
  - [x] Persistir registros en IndexedDB

### Fase 4: Store y Servicios

- [x] **4.1 Crear/actualizar `stores/registro.ts`**
  - [x] Acciones: `registrarIngreso()`, `registrarSalida()`
  - [x] Estado: lista de personas dentro, últimos registros
  - [x] Getters: estadísticas en tiempo real

- [x] **4.2 Integrar con servicios**
  - [x] Cifrado de datos sensibles con `encryptionService`
  - [x] Persistencia en `databaseService`
  - [x] Generación de IDs únicos para registros

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [x] Modal de ingreso permite registrar persona con datos completos
- [x] Modal de salida permite buscar y registrar salida de personas
- [x] Botones en Dashboard abren modals correctamente
- [x] Datos se persisten en IndexedDB cifrados
- [x] Estadísticas del Dashboard se actualizan en tiempo real
- [x] Validaciones funcionan según especificaciones del proyecto
- [x] UI sigue el design system gubernamental establecido
- [x] Componentes son modulares y reutilizables

---

## 🎨 REFERENCIAS DE DISEÑO

**Seguir especificaciones de:**
- `docs/03-design/02-design-system.md` (requisitos de pantallas)
- `docs/03-design/03-user-flow.md` (flujo de usuario)
- Paleta de colores institucional (#1565C0, #424242)
- Componentes Vuetify 3 con buenas prácticas

---

## 🧪 TESTING

**Al finalizar la implementación:**
- Crear pruebas unitarias para `registroStore`
- Considerar pruebas E2E para el flujo completo más adelante
- Validar que `pnpm test:unit` siga pasando al 100%

---
