# EDT Y REQUISITOS DE ENTREGABLES

**PROYECTO:** Sistema para Registro de Ingresos y Egresos en IRCCA  
**FECHA DE APROBACIÓN:** 08 de Septiembre de 2025  
**VERSIÓN:** 1.0  

Montevideo, 28 de Agosto de 2025  
Página 1 de 9

---

## 1. PARTE 1: EDT - ESTRUCTURA DE DESGLOSE DEL TRABAJO

### 1.1 Gestión del Proyecto
a) Acta de Constitución (Completado)  
b) Análisis de Interesados (Completado)  
c) EDT y Requisitos de Entregables (Este documento)  
d) Cronograma Detallado del Proyecto  
e) Informes de Avance Semanales  
f) Acta de Cierre y Lecciones Aprendidas  

### 1.2 Diseño y Arquitectura
a) Diseño de Arquitectura Técnica y de Seguridad  
b) Diseño de Base de Datos (IndexedDB)  
c) Diseño de UI/UX (Maquetas y Flujo de Usuario)  

### 1.3 Desarrollo de la PWA (Plataforma Funcional)
a) Módulo de Autenticación y Roles (Admin, Supervisor, Operador)  
b) Módulo de Registro (Formularios de Ingreso y Salida)  
c) Módulo de Consulta (Dashboard y Vista "Personas Dentro")  
d) Módulo de Supervisión (Reportes PDF y Gráficas)  
e) Módulo de Feedback de Usuario  
f) Módulo de Administración (Gestión de Usuarios y Backups)  

### 1.4 Infraestructura y Despliegue
a) Adquisición y Preparación de Hardware (Tablet)  
b) Configuración de Tablet (Modo Kiosco y Seguridad)  
c) Despliegue de PWA en Tablet (Go-Live)  

### 1.5 Documentación y Aceptación
a) Pruebas de Aceptación de Usuario (UAT)  
b) Manual de Usuario (PDF Impreso)  
c) Política de Uso y Privacidad  

---

## 2. PARTE 2 - REQUISITOS DETALLADOS POR ENTREGABLE

### 2.1 Diseño y Arquitectura

#### a) Diseño de UI/UX
*(Requisitos detallados por definir según aprobación del cliente)*

---

### 2.2 Desarrollo de la PWA

#### a) Módulo de Autenticación y Roles

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Login por usuario y PIN<br>- Hashing seguro de PIN (bcrypt)<br>- Tres roles definidos: Administrador, Supervisor, Operador<br>- Bloqueo de cuenta tras 3 intentos fallidos |
| **Criterios de Aceptación** | - Login exitoso con credenciales correctas<br>- Acceso denegado con credenciales incorrectas<br>- Las vistas y acciones se restringen correctamente según el rol del usuario logueado |
| **Actividades** | - Implementar lógica de hashing<br>- Crear componentes Vue para el login<br>- Implementar middleware de roles en el router |
| **Duración Estimada** | 3 días |
| **Recursos** | - Gerente de Proyecto (Desarrollador) |
| **Riesgos/Supuestos** | **Riesgo:** La lógica de permisos para ocultar/mostrar elementos de la UI es más compleja de lo previsto |

#### b) Módulo de Registro

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Formulario de ingreso con datos personales, de visita y vehículo (opcional)<br>- Autocompletado de datos para visitantes recurrentes buscando por C.I.<br>- Formulario de salida que permite buscar personas dentro del predio por C.I. |
| **Criterios de Aceptación** | - El tiempo de registro para un nuevo visitante es menor a 1 minuto<br>- El tiempo de registro para un visitante recurrente es menor a 15 segundos<br>- El registro de salida se completa seleccionando una persona de una lista filtrada |
| **Actividades** | - Desarrollar el componente de formulario de ingreso<br>- Desarrollar el modal de registro de salida<br>- Implementar la lógica de almacenamiento y recuperación en IndexedDB |
| **Duración Estimada** | 4 días |
| **Recursos** | - Gerente de Proyecto (Desarrollador) |
| **Riesgos/Supuestos** | **Supuesto:** Los campos definidos en las maquetas son suficientes para la operativa del registro |

#### c) Módulo de Consulta

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Dashboard con estadísticas clave en tiempo real (Personas dentro, ingresos/salidas hoy)<br>- Vista dedicada para listar todas las personas actualmente en el predio<br>- Reloj en tiempo real en la interfaz principal |
| **Criterios de Aceptación** | - El dashboard se actualiza automáticamente y de forma precisa tras cada registro de ingreso o salida<br>- La lista de "Personas Dentro" es 100% precisa |
| **Actividades** | - Desarrollar los componentes de tarjetas de estadísticas<br>- Crear la vista "Personas Dentro" con su tabla o lista<br>- Integrar los datos reactivos desde los stores de Pinia |
| **Duración Estimada** | 3 días |
| **Recursos** | - Gerente de Proyecto (Desarrollador) |
| **Riesgos/Supuestos** | **Riesgo:** El cálculo de estadísticas en tiempo real podría impactar el rendimiento en la tablet si el volumen de datos crece mucho |

#### d) Módulo de Supervisión

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Funcionalidad para generar reportes en formato PDF por rango de fechas<br>- Dashboard con gráficas de ingresos (por día/semana)<br>- Funcionalidades accesibles solo para los roles de Supervisor y Administrador |
| **Criterios de Aceptación** | - El PDF se genera correctamente y contiene los datos del rango de fechas seleccionado<br>- Las gráficas reflejan los datos de los registros de forma visualmente clara y precisa |
| **Actividades** | - Implementar librería jsPDF para la generación de reportes<br>- Implementar Chart.js para las visualizaciones<br>- Proteger las rutas y componentes de supervisión por rol |
| **Duración Estimada** | 2 días |
| **Recursos** | - Gerente de Proyecto (Desarrollador) |
| **Riesgos/Supuestos** | **Supuesto:** El formato de reporte estándar definido es suficiente para las necesidades de auditoría |

#### e) Módulo de Feedback de Usuario

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Implementar una encuesta mensual simple y anónima dentro de la PWA<br>- La encuesta debe medir usabilidad y satisfacción (ej. escala de 1 a 5)<br>- Debe permitir un campo de texto abierto para sugerencias |
| **Criterios de Aceptación** | - La encuesta se presenta automáticamente una vez al mes por operador<br>- Los resultados se almacenan de forma anónima y son accesibles para el rol de Administrador |
| **Actividades** | - Diseñar las preguntas de la encuesta<br>- Desarrollar el componente de la encuesta en Vue<br>- Implementar la lógica de almacenamiento anónimo en IndexedDB |
| **Duración Estimada** | 1 día |
| **Recursos** | - Gerente de Proyecto (Desarrollador) |
| **Riesgos/Supuestos** | **Riesgo:** La lógica para asegurar el anonimato y la presentación única mensual podría añadir complejidad |

---

### 2.3 Infraestructura y Despliegue

#### a) Adquisición de Hardware (Tablet)

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Encargado de Seguridad del IRCCA |
| **Requisitos** | - Tablet con Sistema Operativo Android<br>- Mínimo 4GB de RAM y 64GB de almacenamiento<br>- Debe incluir un estuche protector de alto impacto |
| **Criterios de Aceptación** | - La tablet es adquirida y entregada al Gerente de Proyecto antes del inicio de la semana 4 del cronograma |
| **Actividades** | - Comunicar especificaciones técnicas al responsable<br>- Proceso de compra y adquisición por parte del IRCCA<br>- Recepción y verificación del equipo por el Gerente de Proyecto |
| **Duración Estimada** | En paralelo durante las Semanas 1-3 |
| **Recursos** | - Encargado de Seguridad del IRCCA |
| **Riesgos/Supuestos** | **Riesgo (Alto):** La adquisición de la tablet se retrasa, impidiendo realizar las pruebas de usuario y el despliegue final en la fecha planificada |

#### b) Configuración de Tablet

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Configuración inicial del SO Android<br>- Habilitación del Modo Kiosco para fijar la PWA en primer plano<br>- Desactivación de gestos, notificaciones y botones del sistema que permitan salir de la app |
| **Criterios de Aceptación** | - Al encender, la tablet inicia y muestra únicamente la PWA<br>- No es posible salir de la aplicación o acceder a otras funciones del sistema sin las credenciales de administrador |
| **Actividades** | - Instalar y configurar software de gestión si es necesario<br>- Aplicar políticas de seguridad y restricciones<br>- Realizar pruebas exhaustivas de los bloqueos de sistema |
| **Duración Estimada** | 1 día |
| **Recursos** | - Gerente de Proyecto (Desarrollador)<br>- Tablet |
| **Riesgos/Supuestos** | **Supuesto:** El Modo Kiosco nativo o mediante una app de terceros es compatible con el modelo de tablet adquirido |

---

### 2.4 Documentación y Aceptación

#### a) Pruebas de Aceptación de Usuario (UAT)

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Operadores (Personal DNGR) |
| **Requisitos** | - Fase de pruebas formales con el sistema terminado, utilizando la tablet oficial en el Puesto de control<br>- Participación de al menos 4 operadores en sus turnos habituales |
| **Criterios de Aceptación** | - Los flujos de registro de ingreso y salida son completados exitosamente por los 4 operadores durante un período de 2 días de servicio<br>- El feedback cualitativo recolectado es mayoritariamente positivo<br>- No se reportan errores que impidan la operativa (errores críticos) |
| **Actividades** | - Planificar y coordinar las jornadas de prueba<br>- Brindar soporte inicial y acompañar a los operadores<br>- Registrar sistemáticamente todo el feedback y los posibles bugs |
| **Duración Estimada** | 2 días |
| **Recursos** | - 4 Operadores (durante su servicio)<br>- Gerente de Proyecto (como facilitador) |
| **Riesgos/Supuestos** | **Riesgo:** Se descubren problemas de usabilidad no detectados previamente que requieren rediseños importantes y retrasan la entrega |

#### b) Manual de Usuario

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto |
| **Requisitos** | - Documento en formato PDF, listo para imprimir<br>- Incluye instrucciones claras y concisas con capturas de pantalla de la versión final de la PWA<br>- Cubre las funcionalidades para los roles de Operador y Supervisor |
| **Criterios de Aceptación** | - El manual es aprobado formalmente por el Tte. 1° Rodrigo López, quien lo valida como "claro y suficiente para la operativa"<br>- Se entrega una copia impresa en el Puesto N°1 |
| **Actividades** | - Redactar el contenido para cada funcionalidad<br>- Tomar capturas de pantalla de la aplicación final<br>- Diseñar, formatear e imprimir el documento PDF |
| **Duración Estimada** | 3 días (realizado en paralelo con el desarrollo) |
| **Recursos** | - Gerente de Proyecto (Desarrollador)<br>- 1 hora del Tte. 1° R. López para revisión y aprobación final |
| **Riesgos/Supuestos** | **Supuesto:** Las funcionalidades no sufrirán cambios mayores después de la redacción del manual |

#### c) Política de Uso y Privacidad

| **Atributo** | **Descripción** |
|--------------|-----------------|
| **Responsable** | Gerente de Proyecto (Redacción) y Patrocinador (Validación) |
| **Requisitos** | - Documento que incluye Términos y Condiciones de uso para operadores<br>- Define formalmente la Política de Retención de Datos (12 meses en tablet, 5 años en archivo)<br>- Establece el procedimiento para el ejercicio de derechos ARCO por parte de los visitantes |
| **Criterios de Aceptación** | - Documento aprobado formalmente por el Patrocinador (Tte. R. López)<br>- El documento es comunicado a todos los operadores antes de la puesta en producción |
| **Actividades** | - Redactar la política basada en la Ley N° 18.331 y las definiciones del proyecto<br>- Realizar sesión de validación con el Patrocinador<br>- Distribuir y comunicar la política a los usuarios finales |
| **Duración Estimada** | 2 días |
| **Recursos** | - Gerente de Proyecto<br>- 1 hora del Patrocinador para la validación |
| **Riesgos/Supuestos** | **Supuesto:** La política es aceptada sin requerir consultas legales extensas, dado que se basa en la normativa vigente y las mejores prácticas |

---

*gr-depto.infoygc@minterior.gub.uy*
