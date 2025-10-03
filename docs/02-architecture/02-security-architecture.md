# 🔒 SEGURIDAD IRCCA - GUÍA CONCEPTUAL DE ARQUITECTURA

**Versión:** 3.0.0 (Refactorizado)
**Fecha:** 10-Sep-2025
**Propósito:** Este documento describe la arquitectura de seguridad, las políticas y los mecanismos implementados en la PWA del IRCCA. Su objetivo es servir como una guía conceptual de alto nivel, sin detallar la implementación técnica específica, la cual reside en el código fuente.

---

## 1. ÍNDICE DE SEGURIDAD

1.  [Arquitectura de Seguridad](#2-arquitectura-de-seguridad)
2.  [Sistema de Cifrado de Datos](#3-sistema-de-cifrado-de-datos)
3.  [Autenticación y Gestión de Usuarios](#4-autenticación-y-gestión-de-usuarios)
4.  [Control de Acceso Basado en Roles (RBAC)](#5-control-de-acceso-basado-en-roles-rbac)
5.  [Modo Kiosco para Tablets](#6-modo-kiosco-para-tablets)
6.  [Sistema de Auditoría](#7-sistema-de-auditoría)
7.  [Estrategia de Respaldo y Recuperación (3-2-1)](#8-estrategia-de-respaldo-y-recuperación-3-2-1)
8.  [Gestión de Sesiones de Usuario](#9-gestión-de-sesiones-de-usuario)
9.  [Cumplimiento Normativo y Políticas de Datos](#10-cumplimiento-normativo-y-políticas-de-datos)

---

## 2. ARQUITECTURA DE SEGURIDAD

La seguridad del sistema se estructura en un modelo de **4 capas de protección**, diseñado para mitigar amenazas en todos los niveles, desde el acceso físico al dispositivo hasta la protección de los datos almacenados.

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 4: FÍSICA - Modo Kiosco + Control de Dispositivo     │
├─────────────────────────────────────────────────────────────┤
│  CAPA 3: APLICACIÓN - Autenticación + Roles + Sesiones     │
├─────────────────────────────────────────────────────────────┤  
│  CAPA 2: DATOS - Cifrado AES-256 + PBKDF2 + Validación     │
├─────────────────────────────────────────────────────────────┤
│  CAPA 1: ALMACENAMIENTO - IndexedDB + Respaldos + Logs     │
└─────────────────────────────────────────────────────────────┘
```

Este modelo está diseñado para contrarrestar las siguientes amenazas principales:
*   **Acceso físico no autorizado:** Mitigado por el Modo Kiosco, que bloquea el acceso al sistema operativo de la tablet.
*   **Extracción de datos locales:** Mitigado por el cifrado fuerte de toda la información sensible almacenada en la base de datos local.
*   **Uso indebido del sistema:** Mitigado por un sistema de roles y permisos que restringe las acciones según el perfil del usuario.
*   **Pérdida de datos por fallo o daño:** Mitigado por una estrategia robusta de respaldos automáticos y manuales.
*   **Actividad maliciosa o no autorizada:** Mitigada por un registro de auditoría inmutable que traza todas las acciones críticas.

---

## 3. SISTEMA DE CIFRADO DE DATOS

Toda la información sensible almacenada en la base de datos IndexedDB se encuentra cifrada para protegerla contra accesos no autorizados, incluso si se obtiene acceso físico al dispositivo.

*   **Algoritmo:** Se utiliza el estándar **AES-256 en modo GCM**, que proporciona confidencialidad, integridad y autenticidad de los datos.
*   **Gestión de Claves:**
    *   **Clave de Sesión:** Los datos del sistema se cifran utilizando una clave de sesión derivada criptográficamente de las credenciales del usuario autenticado mediante PBKDF2.
    *   **Sin Claves Maestras Hardcodeadas:** El sistema no utiliza claves predefinidas o hardcodeadas. Todas las operaciones de cifrado requieren inicialización previa con credenciales de usuario válidas.
    *   **Limpieza de Sesión:** Las claves de cifrado se eliminan de memoria al cerrar sesión, garantizando que los datos no puedan ser accedidos sin nueva autenticación.
*   **Derivación de Claves:** Se utiliza el algoritmo **PBKDF2** con un alto número de iteraciones y un `salt` criptográfico único para cada operación. Esto previene ataques de diccionario o de fuerza bruta contra las claves.
*   **Vectores de Inicialización (IV):** Se genera un IV único para cada operación de cifrado, garantizando que cifrar el mismo dato dos veces produzca resultados diferentes.

---

## 4. AUTENTICACIÓN Y GESTIÓN DE USUARIOS

El sistema implementa un mecanismo de autenticación multiusuario robusto para verificar la identidad de los operadores.

*   **Credenciales:** Cada usuario accede al sistema mediante una combinación de `nombre de usuario` y un `PIN` numérico.
*   **Almacenamiento Seguro de PINs:** Los PINs nunca se almacenan en texto plano. En su lugar, se utiliza el algoritmo **PBKDF2** con SHA-256 para generar un `hash` seguro con un `salt` individual único. La verificación utiliza el salt original para recrear el hash y compararlo con el almacenado, garantizando seguridad sin almacenar la contraseña.
*   **Protección contra Fuerza Bruta:** El sistema bloquea automáticamente la cuenta de un usuario después de un número predefinido de intentos de inicio de sesión fallidos (ej. 3 intentos), previniendo ataques de fuerza bruta.
*   **Gestión de Usuarios:** Los usuarios con rol de "Administrador" tienen la capacidad de crear, modificar y desactivar cuentas de usuario a través de un módulo de administración seguro.

---

## 5. CONTROL DE ACCESO BASADO EN ROLES (RBAC)

El sistema utiliza un modelo de Control de Acceso Basado en Roles (RBAC) para restringir las funcionalidades disponibles según el perfil del usuario autenticado.

*   **Roles Definidos:** Se establecen roles claros con responsabilidades específicas:
    *   **Operador:** Rol estándar con permisos para las operaciones diarias de registro de ingresos/salidas y consultas básicas.
    *   **Supervisor:** Rol intermedio con acceso a funcionalidades de supervisión, como la generación de reportes y la visualización de estadísticas avanzadas.
    *   **Administrador:** Rol con acceso total al sistema, incluyendo la gestión de usuarios, la configuración del sistema y la realización de respaldos.
*   **Aplicación de Permisos:** Los permisos se verifican en el `router` de la aplicación (para restringir el acceso a vistas completas) y a nivel de componente (para ocultar o deshabilitar elementos específicos de la UI, como botones o campos de formulario).

---

## 6. MODO KIOSCO PARA TABLETS

La PWA está diseñada para operar en un "Modo Kiosco" en la tablet Android, lo que la convierte en la única aplicación accesible para el usuario.

*   **Objetivo:** Prevenir que los operadores salgan de la aplicación, accedan a otras apps o modifiquen la configuración del sistema operativo.
*   **Mecanismos Conceptuales:**
    *   **Pantalla Completa Forzada:** La aplicación se ejecuta permanentemente en modo de pantalla completa.
    *   **Bloqueo de Gestos y Teclas:** Se desactivan los gestos de navegación del sistema, el acceso a notificaciones y las teclas de función (como `Alt`, `Ctrl`, `F11`).
    *   **Foco Permanente:** La aplicación intenta recuperar el foco si lo pierde, dificultando el cambio a otras tareas.
*   **Implementación:** Esta funcionalidad se logra mediante una combinación de APIs del navegador (Fullscreen API, Pointer Lock) y la configuración del dispositivo a través de políticas de Mobile Device Management (MDM) o funciones nativas de Android (como "App Pinning").

---

## 7. SISTEMA DE AUDITORÍA

Se implementa un sistema de auditoría exhaustivo para registrar todas las acciones críticas realizadas en la aplicación, creando una traza inmutable para fines de seguridad y control.

*   **Eventos Auditables:** Se registran eventos clave como:
    *   Inicios y cierres de sesión (exitosos y fallidos).
    *   Creación, modificación o eliminación de registros de acceso.
    *   Gestión de usuarios (creación, bloqueo).
    *   Generación de respaldos y restauraciones.
    *   Errores críticos del sistema.
*   **Integridad de los Registros:** Cada evento de auditoría incluye el `ID del usuario` responsable, la `fecha y hora` exactas, y los datos relevantes de la acción. Todos los registros de auditoría se cifran antes de ser almacenados para garantizar su integridad y confidencialidad.

---

## 8. ESTRATEGIA DE RESPALDO Y RECUPERACIÓN (3-2-1)

Para garantizar la resiliencia y la continuidad operativa, el sistema implementa una estrategia de respaldo 3-2-1 adaptada a un entorno offline.

*   **Nivel 1 (Automático Diario):** La aplicación genera automáticamente un respaldo diario de los datos operativos dentro de la misma base de datos local. Se conservan los últimos 7 respaldos, permitiendo una recuperación rápida ante errores lógicos menores.
*   **Nivel 2 (Automático Semanal):** Se genera un respaldo consolidado cada semana, conservando las últimas 4 copias. Esto proporciona puntos de restauración mensuales.
*   **Nivel 3 (Manual Mensual):** El rol de Administrador puede exportar un archivo de respaldo completo y cifrado. Este archivo debe ser transferido a un medio de almacenamiento externo (como un pendrive cifrado) y guardado en una ubicación física segura, de acuerdo con los protocolos institucionales. Esto protege los datos contra la pérdida total del hardware.

---

## 9. GESTIÓN DE SESIONES DE USUARIO

Se aplican políticas estrictas de gestión de sesiones para minimizar el riesgo de acceso no autorizado a una sesión activa.

*   **Timeout por Inactividad:** Las sesiones de usuario expiran automáticamente después de un período de inactividad de 3 horas.
*   **Advertencia de Expiración:** El sistema notifica al usuario antes de que la sesión expire, dándole la oportunidad de continuar trabajando.
*   **Cierre de Sesión Seguro:** El proceso de cierre de sesión invalida la sesión activa y redirige al usuario a la pantalla de Login.

---

## 10. CUMPLIMIENTO NORMATIVO Y POLÍTICAS DE DATOS

El sistema se adhiere a la normativa uruguaya de protección de datos y a políticas internas estrictas.

*   **Ley N° 18.331:** El tratamiento de datos personales se realiza en cumplimiento con la Ley de Protección de Datos Personales, asegurando la finalidad, seguridad y confidencialidad de la información.
*   **Política de Retención:** Los datos se conservan en el dispositivo por un período activo de 12 meses. Pasado este tiempo, son purgados automáticamente para cumplir con el principio de minimización de datos. Los respaldos externos se conservan por 5 años para fines de auditoría.
*   **Derechos ARCO:** El sistema proporciona las herramientas necesarias para que el Custodio de los Datos pueda atender las solicitudes de Acceso, Rectificación, Cancelación y Oposición por parte de los titulares de los datos.