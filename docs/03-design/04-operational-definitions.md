# ⚙️ DEFINICIONES OPERATIVAS Y DE FLUJO

**Versión:** 1.0  
**Fecha:** 19-Sep-2025  
**Propósito:** Este documento define flujos de usuario específicos y reglas de negocio operativas que complementan los requisitos de alto nivel, para guiar la implementación de la lógica de la aplicación.

---

## 1. Gestión de Datos para Selectores

Esta sección define el origen y la gestión de las opciones para los campos de tipo `selector` en los formularios de registro.

### 1.1. Decisión

Para la Versión 1.0, las listas de opciones para el selector **"Destino"** serán **listas estáticas definidas como constantes** dentro del código fuente de la aplicación.

### 1.2. Justificación

*   **Simplicidad y Robustez:** Evita la complejidad de crear una interfaz de administración para listas que no se espera que cambien con frecuencia.
*   **Rendimiento Offline:** Asegura que las opciones estén siempre disponibles de inmediato en la PWA, sin necesidad de sincronización.
*   **Alcance del Proyecto:** Se alinea con el objetivo de entregar una solución funcional en el plazo de 4 semanas. Una gestión dinámica puede ser considerada como una mejora futura.

### 1.3. Implementación Propuesta

Las listas se definirán en un archivo de constantes (ej. `src/config/constants.ts`).

**Lista: Destino**
```typescript
export const DESTINOS = [
  'IRCCA',
  'Ligeral',
  'Simbiosys',
  'Jabelor',
  'Otra'
];
```

---

## 2. Flujo de Registro Optimizado para Funcionarios

Para cumplir con el objetivo de "<15 segundos para visitantes recurrentes", se define un flujo de UI/UX optimizado.

### 2.1. Flujo de Registro Optimizado

1.  En el modal de registro de ingreso, el Operador ingresa directamente los datos requeridos.
2.  Al introducir el número de C.I., el sistema busca automáticamente si esa persona ya existe en registros anteriores.
3.  Si existe, los campos **"Nombre"** y **"Apellido"** se rellenan automáticamente (autocompletado).
4.  El Operador solo necesita completar el resto de la información de la visita (Destino) y datos opcionales del vehículo.
5.  Presiona "Registrar Ingreso" para completar el proceso.

---

## 3. Proceso de Corrección de Errores (Rol Operador)

Se establece un procedimiento para que el rol `Operador` pueda corregir errores de tipeo de forma inmediata, manteniendo la integridad y la trazabilidad de los datos.

### 3.1. Regla de Corrección

*   Un `Operador` solo puede modificar un registro **creado por él mismo**.
*   La modificación solo es posible dentro de un período de **5 minutos** desde la hora de creación del registro.
*   Pasado este tiempo, cualquier modificación deberá seguir el procedimiento formal de **Derechos ARCO (Rectificación)**, gestionado por un `Supervisor` o `Administrador`.

### 3.2. Flujo de Corrección

1.  En la lista de "Últimos Ingresos" del Dashboard, los registros creados en los últimos 5 minutos por el usuario actual mostrarán un ícono de "Editar" (`mdi-pencil`).
2.  Al hacer clic en el ícono, se abrirá el modal de registro de ingreso, precargado con todos los datos del registro seleccionado.
3.  El Operador realiza la corrección y presiona "Guardar Cambios".
4.  El sistema actualiza el registro en la base de datos.
5.  **Auditoría:** La acción debe generar un evento en el `auditStore` marcándolo claramente como una **MODIFICACIÓN**, incluyendo el ID del registro, el ID del operador y la fecha/hora de la corrección.
