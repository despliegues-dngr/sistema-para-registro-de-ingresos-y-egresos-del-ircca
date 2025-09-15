# 🎨 TASK 1.3.1-FE - DESARROLLO FE: AUTENTICACIÓN Y LAYOUT

**CÓDIGO EDT:** 1.3.1-FE
**RESPONSABLE:** Mario BERNI (Gerente de Proyecto)
**DURACIÓN:** 2 días
**FECHAS:** 16-Sep-2025 → 17-Sep-2025 (Iniciado el 12-Sep)
**DEPENDE DE:** 1.2.3 (Diseño UI/UX)

---

## 📋 OBJETIVOS DE LA TAREA

1.  **Finalizar la `LoginView` al 100%** de su funcionalidad de interfaz.
2.  **Conectar la vista** con el store de autenticación (`authStore`).
3.  **Asegurar que los estados visuales** (carga, error, éxito) se reflejen en la UI.
4.  **Establecer el layout principal** de la aplicación en `App.vue`.

---

## 🚀 SUBTAREAS DETALLADAS

- [x] **1. Creación de componentes visuales base (Completado).**
  - Se ha implementado una arquitectura modular y profesional.
  - Componentes creados: `AuthBackground`, `InstitutionalHeader`, `LoginCard`, `LoginForm`, `GovernmentFooter`, `HelpDialog`.
  - El componente `LoginForm` ya incluye validación de reglas y maneja el estado visual de carga y mensajes.

- [ ] **2. Activar y conectar Store y Router (Pendiente).**
  - [ ] Descomentar las importaciones de `useAuthStore` y `useRouter` en `LoginView.vue`.
  - [ ] Reemplazar la lógica de `if/else` simulada en `onSubmit` por llamadas a las acciones del `authStore` (ej. `authStore.login()`, `authStore.incrementLoginAttempts()`).
  - [ ] Descomentar la línea `router.push(ROUTES.DASHBOARD)` dentro de `onSubmit` para activar la redirección tras un login exitoso.

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Al hacer clic en "Ingresar", se ejecuta la lógica del `authStore`.
- [ ] La interfaz reacciona visualmente a los estados de carga y a los mensajes de error/éxito.
- [ ] Tras un login exitoso (simulado), la aplicación redirige a la ruta del Dashboard.
- [ ] El código está limpio, sigue las guías de estilo y es modular.
- [ ] La tarea se marca como completada en `00-tasks-tracker.md`.
