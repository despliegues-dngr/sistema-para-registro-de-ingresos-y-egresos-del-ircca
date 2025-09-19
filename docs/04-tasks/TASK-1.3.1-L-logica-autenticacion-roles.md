# 🔐 TASK 1.3.1-L - LÓGICA: AUTENTICACIÓN Y ROLES

**CÓDIGO EDT:** 1.3.1-L
**RESPONSABLE:** Mario BERNI (Gerente de Proyecto)
**DURACIÓN:** 1 día
**FECHA:** 23-Sep-2025 (Según cronograma)
**DEPENDE DE:** `TASK-1.3.1-FE` (UI de Autenticación)

---

## 📋 OBJETIVOS DE LA TAREA

1.  **Verificar y completar la lógica** de negocio en `authStore` para el inicio de sesión y el auto-registro de nuevos operadores.
2.  **Implementar el Control de Acceso Basado en Roles (RBAC)** para restringir el acceso a rutas y funcionalidades.
3.  **Asegurar la correcta comunicación** entre los componentes de la interfaz (`LoginForm`, `RegistrationForm`) y el `authStore`.
4.  **Implementar la gestión de sesión**, incluyendo el timeout por inactividad.

---

## 🚀 SUBTAREAS DETALLADAS

### Fase 1: Verificación y Conexión de Lógica Existente

- [ ] **1.1 Verificar `authStore`:**
    - [ ] Revisar que la acción `login()` maneje correctamente los casos de éxito y error (PIN incorrecto, usuario no existe).
    - [ ] Revisar que la acción `registerUser()` valide los datos, verifique duplicados y guarde el nuevo usuario cifrado.
    - [ ] Confirmar que el estado del store (`user`, `isAuthenticated`, `role`) se actualiza correctamente tras cada acción.

- [ ] **1.2 Conectar Componentes de UI:**
    - [ ] Asegurar que el evento `submit` de `LoginForm.vue` llama a la acción `authStore.login()`.
    - [ ] Asegurar que el evento `submit` de `RegistrationForm.vue` llama a la acción `authStore.registerUser()`.
    - [ ] Verificar que los estados de `loading` y los mensajes de error/éxito se propagan desde el store a los componentes de formulario.

### Fase 2: Implementación de Roles y Permisos (RBAC)

- [ ] **2.1 Extender Modelo de Usuario:**
    - [ ] Asegurar que el objeto `User` en `authStore` incluya la propiedad `role` (ej. 'Operador', 'Supervisor', 'Administrador').
    - [ ] Al registrar un nuevo usuario, asignarle por defecto el rol de 'Operador' según se define en el `project-charter.md`.

- [ ] **2.2 Implementar Navigation Guards en el Router:**
    - [ ] En `src/router/index.ts`, implementar la lógica en `beforeEach` para:
        - [ ] Redirigir a `/login` si un usuario no autenticado intenta acceder a una ruta protegida.
        - [ ] Redirigir a `/dashboard` si un usuario ya autenticado intenta acceder a `/login`.
        - [ ] **(Para el futuro)** Prevenir el acceso a rutas de `Supervisor` o `Administrador` si el `authStore.user.role` no tiene los permisos necesarios.

### Fase 3: Gestión de Sesión

- [ ] **3.1 Implementar Timeout por Inactividad:**
    - [ ] Utilizar una librería como `@vueuse/core` (ya instalada) para detectar inactividad del usuario.
    - [ ] Tras un período de inactividad definido (ej. 30 minutos, según `security-architecture.md`), llamar automáticamente a la acción `authStore.logout()`.
    - [ ] Implementar un diálogo de advertencia que se muestre 1 minuto antes de que la sesión expire, permitiendo al usuario extenderla.

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Un usuario puede registrarse exitosamente y sus datos se guardan cifrados en IndexedDB.
- [ ] Un usuario registrado puede iniciar sesión con sus credenciales.
- [ ] El sistema previene el registro de Cédulas duplicadas.
- [ ] El login falla con un mensaje de error claro si las credenciales son incorrectas.
- [ ] Un usuario no autenticado es redirigido a la página de login si intenta acceder al dashboard.
- [ ] La sesión de un usuario se cierra automáticamente tras 30 minutos de inactividad.
- [ ] Toda la lógica implementada está cubierta por pruebas unitarias en `auth.spec.ts` y `router.spec.ts`.

---

## 🧪 TESTING

-   Verificar que todas las pruebas en `auth.spec.ts` y `router.spec.ts` pasen exitosamente.
-   Realizar pruebas manuales del flujo completo de registro y login para confirmar la correcta interacción entre la UI y la lógica.
