# 🧪 GUÍA DE TESTING - PWA IRCCA

**Versión:** 1.0
**Fecha:** 15-Sep-2025
**Propósito:** Este documento establece la estrategia, herramientas y convenciones para la realización de pruebas de software en el proyecto PWA IRCCA, con el fin de asegurar la calidad, fiabilidad y mantenibilidad de la aplicación.

---

## 1. Filosofía de Testing

La calidad es una responsabilidad compartida. Dado que esta aplicación es para uso en un entorno de seguridad institucional, la robustez y la ausencia de errores son críticas. Adoptamos un enfoque pragmático de la pirámide de testing, priorizando las pruebas unitarias rápidas, complementadas con pruebas End-to-End (E2E) para los flujos de usuario más importantes.

---

## 2. Herramientas de Testing

El proyecto está configurado con un stack de testing moderno y unificado:

*   **Pruebas Unitarias (Unit Tests)**:
    *   **Framework**: **Vitest**. Integrado con Vite para una ejecución y recarga instantánea.
    *   **Ubicación**: Las pruebas se colocan en un directorio `__tests__` dentro del directorio del módulo que se está probando (ej. `src/stores/__tests__/auth.spec.ts`) o junto al archivo que prueban (ej. `useAuth.spec.ts`).
    *   **Comando**: `pnpm test:unit`

*   **Pruebas End-to-End (E2E)**:
    *   **Framework**: **Playwright**. Permite automatizar acciones en un navegador real para simular interacciones de usuario.
    *   **Ubicación**: Las pruebas se encuentran en el directorio `e2e/` en la raíz del proyecto.
    *   **Comando**: `pnpm test:e2e`

---

## 3. Estrategia y Flujo de Trabajo

### ¿Qué probar?

*   **Pruebas Unitarias**:
    *   **Stores (Pinia)**: Probar acciones, mutaciones (cambios de estado) y getters. Simular llamadas a servicios si es necesario.
    *   **Composables (`use...`)**: Probar la lógica de negocio pura, funciones de utilidad y estado reactivo.
    *   **Servicios**: Probar la lógica de servicios como `encryptionService` para asegurar que los algoritmos son correctos.
    *   **Componentes (Vue)**: Probar la renderización condicional, emisión de eventos y props. **Prioridad baja-media**, ya que las pruebas E2E cubrirán gran parte de la UI.

*   **Pruebas E2E**:
    *   **Flujos Críticos**: Probar los "caminos felices" de las funcionalidades más importantes.
        *   Autenticación (Login y Logout).
        *   Registro de un nuevo ingreso.
        *   Registro de una salida.
        *   Generación de un reporte (rol Supervisor).
    *   **Casos de Error**: Probar cómo reacciona la UI a entradas inválidas (ej. login con PIN incorrecto).

### ¿Cuándo probar?

1.  **Durante el Desarrollo**:
    *   Al crear o modificar una unidad de lógica (una función, una acción de store), crea o actualiza su **prueba unitaria**.
    *   Ejecuta `pnpm test:unit --watch` mientras desarrollas para obtener feedback instantáneo.

2.  **Al Finalizar una Funcionalidad**:
    *   Cuando un flujo de usuario esté completo (ej. el formulario de registro de ingreso funciona de principio a fin), considera añadir una **prueba E2E** para ese flujo.

3.  **Antes de un `commit`**:
    *   Ejecuta `pnpm test:unit` como mínimo. Esto asegura que no estás introduciendo una regresión.
    *   Idealmente, ejecuta también `pnpm build` para confirmar que no hay errores de tipo.

---

## 4. Convenciones y Buenas Prácticas

*   **Nomenclatura**: Los archivos de pruebas unitarias deben terminar en `.spec.ts`. Los de E2E también usan `.spec.ts` pero viven en la carpeta `e2e`.
*   **Descripción Clara**: Usa `describe` para agrupar pruebas de una misma funcionalidad y `it` o `test` para describir claramente qué comportamiento se está probando.
    ```typescript
    describe('useAuth', () => {
      it('should return isAuthenticated as true after successful login', () => {
        // ... test logic
      });
    });
    ```
*   **AAA (Arrange, Act, Assert)**: Estructura tus pruebas siguiendo este patrón para que sean fáciles de leer.
    *   **Arrange**: Configura el estado inicial, mocks o datos necesarios.
    *   **Act**: Ejecuta la función o acción que quieres probar.
    *   **Assert**: Comprueba que el resultado es el esperado usando las aserciones de Vitest (`expect`, `toBe`, etc.).
*   **Independencia**: Cada prueba debe ser independiente. No debe depender del resultado de una prueba anterior. Usa los hooks `beforeEach` o `afterEach` para limpiar el estado entre pruebas.

---
