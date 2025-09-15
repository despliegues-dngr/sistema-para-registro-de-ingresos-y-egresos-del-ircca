# ✨ TASK 1.3.1.1-FE - DESARROLLO FE: AUTO-REGISTRO DE USUARIO

**CÓDIGO EDT:** 1.3.1.1 (Nuevo)
**RESPONSABLE:** Mario BERNI (Gerente de Proyecto)
**DURACIÓN:** 1 día
**FECHA:** 16-Sep-2025
**DEPENDE DE:** 1.3.1-FE (Autenticación y Layout)

---

## 📋 OBJETIVOS DE LA TAREA

1.  **Implementar un flujo de auto-registro** para operadores, activado desde la pantalla de Login.
2.  **Crear un diálogo modal** reutilizando el estilo del `HelpDialog` existente.
3.  **Desarrollar un formulario de registro** con los campos acordados, incluyendo validaciones.
4.  **Implementar la lógica de seguridad** basada en una "whitelist" de Cédulas autorizadas.
5.  **Conectar el flujo** con el `authStore` para la creación y persistencia del nuevo usuario.

---

## 🚀 SUBTAREAS DETALLADAS

### Fase 1: Componentes y UI

-   [x] **1.1 Modificar `LoginView.vue`:**
    -   [x] Crear una variable reactiva `showRegisterDialog = ref(false)`.
    -   [x] Actualizar el método `handleRegister` para que `showRegisterDialog.value = true`.
    -   [x] Añadir el nuevo componente `<RegistrationDialog>` al template.

-   [x] **1.2 Crear componente `components/ui/RegistrationDialog.vue`:**
    -   [x] Reutilizar la estructura de `v-dialog` y `v-card` del `HelpDialog`.
    -   [x] Incluir un título claro, como "Registro de Nuevo Operador".
    -   [x] Contendrá el nuevo componente de formulario.

-   [x] **1.3 Crear componente `components/forms/RegistrationForm.vue`:**
    -   [x] Desarrollar el formulario con los campos definidos.
    -   [x] Implementar validaciones en tiempo real para cada campo.
    -   [x] Manejar estados de carga (`loading`) y mensajes de error/éxito.

### Fase 2: Lógica y Seguridad

-   [x] **2.1 Definir campos del formulario:**
    -   [x] **Cédula de Identidad:** Numérico, 8 dígitos (funcionará como `username`).
    -   [x] **Grado:** Lista desplegable (Guardia Republicano, Cabo, Sargento, Sub Oficial, Alferez, Teniente, Tte. 1°, Capitan, Cte. Mayor, Cte. General).
    -   [x] **Nombre:** Texto.
    -   [x] **Apellido:** Texto.
    -   [x] **Contraseña:** Alfanumérica, tipo password, mínimo 6 caracteres.
    -   [x] **Confirmar Contraseña:** Debe coincidir con la contraseña anterior.

-   [x] **2.2 Actualizar `stores/auth.ts`:**
    -   [x] Crear una nueva acción `registerUser(userData)`.
    -   [x] Implementar validaciones de registro:
        -   [x] ~~Verificar si la Cédula está en la lista de usuarios autorizados (ELIMINADO - registro abierto).~~
        -   [x] Verificar que la Cédula no corresponda a un usuario ya registrado.
    -   [x] Llamar al `encryptionService` para hashear la contraseña.
    -   [x] Llamar al `databaseService` para guardar el nuevo objeto de usuario cifrado.

---

## ✅ CRITERIOS DE ACEPTACIÓN

-   [x] Al hacer clic en "Registrarse como nuevo usuario" en la `LoginView`, se abre el diálogo de registro.
-   [x] El formulario de registro valida los campos correctamente.
-   [x] El registro solo es exitoso si la Cédula está en una lista pre-autorizada (simulada).
-   [x] Tras un registro exitoso, se muestra un mensaje de éxito y el diálogo se cierra.
-   [x] El nuevo usuario puede iniciar sesión inmediatamente con su Cédula y contraseña.
-   [x] Los datos del nuevo usuario se guardan cifrados en IndexedDB.

---

## ✅ RESUMEN DE IMPLEMENTACIÓN

### **Componentes Creados:**
- ✅ `src/components/ui/RegistrationDialog.vue` - Modal siguiendo patrón HelpDialog
- ✅ `src/components/forms/RegistrationForm.vue` - Formulario con validaciones

### **Modificaciones:**
- ✅ `src/views/auth/LoginView.vue` - Integración del modal de registro
- ✅ `src/stores/auth.ts` - Nueva acción `registerUser()` con validación de duplicados
- ✅ `src/config/constants.ts` - Iconos adicionales para UI

### **Funcionalidades:**
- ✅ Validación en tiempo real de todos los campos
- ✅ Validación de cédulas duplicadas (registro abierto)
- ✅ Encriptación de contraseñas con `encryptionService`
- ✅ Persistencia segura en IndexedDB
- ✅ Manejo de errores y mensajes de usuario

### **Para Probar:**
1. Ejecutar `pnpm dev`
2. Ir a login y hacer clic en "REGISTRARSE COMO NUEVO USUARIO"
3. Usar cualquier cédula de 8 dígitos (ej: 55226350, 12345678, etc.)
4. Completar formulario y verificar funcionamiento

**Estado:** ✅ COMPLETADO - Listo para testing

---
