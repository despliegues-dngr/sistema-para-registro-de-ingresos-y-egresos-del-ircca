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

### Fase 1: Modal de Registro de Ingreso

- [ ] **1.1 Crear componente `RegistroIngresoModal.vue`**
  - [ ] Modal con `v-dialog` que se superponga al Dashboard
  - [ ] Formulario con secciones: Datos Personales, Datos de Visita, Datos de Vehículo (opcional)
  - [ ] Validaciones en tiempo real según `VALIDATION_PATTERNS`
  - [ ] Estados de carga y mensajes de error/éxito

- [ ] **1.2 Implementar formulario de datos personales**
  - [ ] Campos: Cédula (8 dígitos), Nombre, Apellido, Teléfono (opcional)
  - [ ] Validación de formato de cédula y teléfono
  - [ ] Campo de cédula como foco inicial

- [ ] **1.3 Implementar formulario de datos de visita**
  - [ ] Selector de tipo de visitante
  - [ ] Selector de área a visitar
  - [ ] Campo de texto para motivo

- [ ] **1.4 Implementar sección de vehículo (expandible)**
  - [ ] Campos: Matricula (ABC1234), Modelo, Color
  - [ ] Validación de formato de Matricula
  - [ ] Sección colapsable para no sobrecargar UI

### Fase 2: Modal de Registro de Salida

- [ ] **2.1 Crear componente `RegistroSalidaModal.vue`**
  - [ ] Modal con funcionalidad de búsqueda principal
  - [ ] Campo de búsqueda por cédula con filtrado en tiempo real
  - [ ] Lista de resultados de personas dentro del predio

- [ ] **2.2 Implementar funcionalidad de búsqueda**
  - [ ] Búsqueda por cédula con filtrado instantáneo
  - [ ] Lista visual de personas actualmente dentro
  - [ ] Selección clara de la persona correcta

- [ ] **2.3 Implementar información adicional**
  - [ ] Mostrar tiempo transcurrido desde ingreso
  - [ ] Campo opcional de observaciones sobre la salida
  - [ ] Confirmación antes de registrar salida

### Fase 3: Integración con Dashboard

- [ ] **3.1 Actualizar `DashboardView.vue`**
  - [ ] Agregar botones "Registrar Ingreso" y "Registrar Salida"
  - [ ] Integrar modals con v-model para control de visibilidad
  - [ ] Actualizar estadísticas tras registros exitosos

- [ ] **3.2 Conectar con stores**
  - [ ] Integrar con `registroStore` (crear si no existe)
  - [ ] Actualizar `personas_dentro` en tiempo real
  - [ ] Persistir registros en IndexedDB

### Fase 4: Store y Servicios

- [ ] **4.1 Crear/actualizar `stores/registro.ts`**
  - [ ] Acciones: `registrarIngreso()`, `registrarSalida()`
  - [ ] Estado: lista de personas dentro, últimos registros
  - [ ] Getters: estadísticas en tiempo real

- [ ] **4.2 Integrar con servicios**
  - [ ] Cifrado de datos sensibles con `encryptionService`
  - [ ] Persistencia en `databaseService`
  - [ ] Generación de IDs únicos para registros

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Modal de ingreso permite registrar persona con datos completos
- [ ] Modal de salida permite buscar y registrar salida de personas
- [ ] Botones en Dashboard abren modals correctamente
- [ ] Datos se persisten en IndexedDB cifrados
- [ ] Estadísticas del Dashboard se actualizan en tiempo real
- [ ] Validaciones funcionan según especificaciones del proyecto
- [ ] UI sigue el design system gubernamental establecido
- [ ] Componentes son modulares y reutilizables

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
