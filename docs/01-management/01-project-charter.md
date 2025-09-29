# ACTA DE CONSTITUCIÓN

**PROYECTO:** Sistema de Control de Accesos del IRCCA  
**FECHA DE APROBACIÓN:** 08 de Septiembre de 2025  
**VERSIÓN:** 1.0

Montevideo, 28 de Agosto de 2025  
Página 1 de 6

## 1. PROPÓSITO Y JUSTIFICACIÓN DEL PROYECTO

### Situación Actual

El control de acceso al predio del Instituto de Regulación y Control del Cannabis (IRCCA) es gestionado por personal de la Guardia Republicana (Servicio Art. 222). El proceso actual es enteramente manual y consiste en el llenado de dos planillas de papel para registrar el ingreso de personas y vehículos.

### Problemática

Este método manual es ineficiente y presenta múltiples desventajas:

• **Retención de Documentación Personal:** Actualmente se le solicita al personal que ingresa su documento de identidad, el cual permanece en una caja hasta su egreso. Esta práctica, además de ser lenta al momento de la devolución, es éticamente cuestionable y riesgosa, ya que un funcionario podría negarse a entregar su documento personal y queda en responsabilidad y cuidado de los efectivos apostados.

• **Consume Tiempo Excesivo:** El llenado de los formularios y la búsqueda de documentos retrasan el ingreso y egreso consumiendo valioso tiempo del personal tanto policial como los perteneciente al IRCCA.

• **Propenso a Errores:** La escritura manual es susceptible a errores de transcripción, falta de ortografía y caligrafía poco legible, afectando la calidad y fiabilidad de los datos.

• **Inseguridad de la Información:** Los registros en papel pueden extraviarse, dañarse o ser accedidos por personal no autorizado.

• **Dificultad de Consulta:** Acceder a información de un día o persona específica es una tarea compleja y lenta, que obstaculiza las auditorías y el control efectivo.

### Justificación

El desarrollo de una Progressive Web App (PWA) busca modernizar y automatizar este proceso crítico. La solución propuesta eliminará las ineficiencias del sistema actual, proporcionando una herramienta tecnológica robusta, segura y a medida que mejorará drásticamente la operativa de control de acceso.

gr-depto.infoygc@minterior.gub.uy

---

## 2. OBJETIVO ESPECÍFICO Y CRITERIOS DE ÉXITO (SMART)

### Objetivo General

Desarrollar e implementar una Progressive Web App (PWA) para automatizar el registro, control y consulta de ingresos y egresos de personas y vehículos en el puesto de vigilancia del IRCCA.

### Criterios de Éxito Medibles

#### 2.1. (Específico)

Reemplazar el sistema de planillas manuales por una aplicación digital funcional en una tablet.

#### a) (Medible)

• Reducir el tiempo promedio de registro para un nuevo visitante a menos de 1 minuto.
• Reducir el tiempo de registro para visitantes recurrentes a menos de 15 segundos (gracias al autocompletado de datos).
• Eliminar el 100% de los errores asociados a la caligrafía y transcripción manual.

#### b) (Alcanzable)

El proyecto es factible dentro del plazo y con los recursos definidos (1 desarrollador a tiempo completo, hardware provisto por la institución).

#### c) (Relevante)

La solución optimiza un proceso de seguridad fundamental y mejora drásticamente la calidad y disponibilidad de los datos para fines de auditoría y control.

#### d) (con Plazo definido)

El desarrollo y la implementación del proyecto se completarán en un plazo de 1 mes.

---

## 3. DESCRIPCIÓN DE ALTO NIVEL Y ENTREGABLES PRINCIPALES

La solución consiste en una PWA instalada en una tablet que permitirá al personal de seguridad registrar digitalmente todos los movimientos. El sistema funcionará offline, sincronizando datos cuando haya conexión, y almacenará toda la información de forma local y segura mediante cifrado AES-256, garantizando la integridad y confidencialidad de los datos.

### Entregables Principales

#### 3.1. PWA de Registro IRCCA (Versión 1.0)

Aplicación completamente funcional con módulos de registro de ingreso/salida, consulta de personas en el predio y gestión de usuarios.

#### 3.2. Manual de Usuario

Documento impreso, claro y conciso, que se dejará en el puesto de control. Incluirá instrucciones de uso, solución a problemas comunes y datos de contacto para soporte.

#### 3.3. Configuración Inicial del Sistema

Creación manual del usuario con rol "Administrador". Este usuario tendrá los permisos para crear los perfiles de "Supervisor" y "Operador". Todos los usuarios creados a través de la PWA por defecto tendrán el rol de "Operador".

#### 3.4. Política de Uso y Privacidad

Documento que define las reglas de uso, la gestión de datos personales y los procedimientos asociados.

---

## 4. PRINCIPALES INTERESADOS (STAKEHOLDERS)

| Interesado / Rol                          | Interés en el Proyecto / Rol Específico                                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Encargado de Seguridad del IRCCA**      | Principal interesado institucional. Recibirá reportes de alta calidad y se beneficia de la mejora en la seguridad. Recibirá comunicaciones de alto nivel (inicio y fin del proyecto).     |
| **Gerente del Proyecto / Desarrollador**  | Patrocinador del proyecto. Responsable del servicio, interesado en mejorar la operativa y modernización de su personal. Responsable de la entrega exitosa del proyecto en tiempo y forma. |
| **Operadores del Puesto (personal DNGR)** | Usuarios finales del sistema. Se beneficiarán de un proceso de registro más rápido, sencillo y sin errores.                                                                               |
| **Jefe del Servicio 222 (DNGR)**          | -                                                                                                                                                                                         |

---

## 5. GOBERNANZA DEL PROYECTO, DATOS Y SEGURIDAD

Esta sección define los roles, responsabilidades y políticas que rigen la gestión de los activos de información del proyecto.

### 5.1. CUSTODIA Y RESPONSABILIDADES

#### a) Custodio Técnico (Gerente de Proyecto/Desarrollador - Mario BERNI)

Responsable de la integridad, seguridad, mantenimiento y documentación técnica del software.

#### b) Custodio Operativo (Patrocinador - Tte. Rodrigo LOPEZ)

Responsable del uso adecuado del sistema, la custodia física del hardware (tablet) y de asegurar la ejecución de los procedimientos de respaldo manual.

#### c) Usuarios Finales (Operadores DNGR)

Responsables de la correcta introducción de los datos en el sistema y del cuidado del dispositivo durante su turno de servicio.

### 5.2. GESTIÓN DE DATOS PERSONALES (LEY N° 18.331)

El sistema se desarrollará en estricto cumplimiento de la Ley N° 18.331 de Protección de Datos Personales.

#### a) Consentimiento Informado

Se colocará señalética visible en el puesto de control informando a los visitantes sobre la recolección de sus datos personales con fines de seguridad y control de acceso.

#### b) Derechos ARCO

Se establecerá un procedimiento formal para que los titulares de los datos (visitantes) puedan ejercer sus derechos de Acceso, Rectificación, Supresión y Oposición. Las solicitudes serán gestionadas por el Custodio Operativo.

### 5.3. POLÍTICA DE RETENCIÓN DE DATOS

#### a) Retención Activa (Tablet)

Los registros se mantendrán en el dispositivo por un período de 12 meses.

#### b) Retención en Archivo (Respaldos Externos)

Los respaldos mensuales se conservarán por un período de 5 años.

#### c) Purga Automática

El sistema implementará una rutina para eliminar de la tablet los registros con una antigüedad mayor a 12 meses.

---

## 6. RIESGOS PRINCIPALES Y PLAN DE MITIGACIÓN

| Riesgo                                      | Probabilidad | Impacto | Plan de Mitigación                                                                                                                                                                                                                                                                                        |
| ------------------------------------------- | ------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Baja adopción por parte de los usuarios** | Media        | Alto    | La PWA se diseñará con una interfaz extremadamente simple e intuitiva. Se proveerá un manual de usuario claro y se implementará un módulo de feedback mensual.                                                                                                                                            |
| **Pérdida o rotura del hardware (Tablet)**  | Baja         | Alto    | Se implementará una estrategia de respaldos 3-2-1: 1. Automáticos diarios y semanales dentro del dispositivo. 2. Manual mensual a un pendrive externo cifrado, bajo custodia del Estado Mayor de la DNGR. 3. Se autoriza al Jefe de Seguridad del IRCCA a mantener una segunda copia de respaldo cifrada. |

---

## 7. HITOS PRINCIPALES Y PLAZOS GENERALES

| Semana         | Hitos Principales                                                                    |
| -------------- | ------------------------------------------------------------------------------------ |
| **Semana 1**   | Kick-off, validación final de requerimientos y diseño de la UI/UX.                   |
| **Semana 2-3** | Desarrollo del core de la PWA (frontend, lógica de negocio y base de datos).         |
| **Semana 4**   | Pruebas funcionales, implementación de seguridad, redacción del manual y despliegue. |
| **Fin Mes 1**  | Entrega final del proyecto, capacitación y puesta en producción.                     |

---

## 8. PRESUPUESTO RESUMIDO

• **Costos de Desarrollo:** 400 horas de trabajo (1 mes a tiempo completo). Asumido por el desarrollador.
• **Costos de Hardware (Tablet):** A ser proporcionado por el IRCCA. No se imputa al presupuesto de este proyecto.
• **Costos de Mantenimiento y Soporte:** Incluidos en el rol del Gerente de Proyecto.

---

## 9. ASIGNACIÓN DEL GERENTE DEL PROYECTO Y NIVEL DE AUTORIDAD

• **Gerente del Proyecto:** Mario BERNI, Desarrollador, programador.
• **Nivel de Autoridad:** El Gerente del Proyecto tiene plena autoridad para tomar las decisiones técnicas y de desarrollo necesarias para cumplir con los objetivos y el alcance definidos. Reportará los avances semanalmente al Patrocinador del Proyecto.

---

## 10. CONTINUIDAD OPERATIVA

Se reconoce el riesgo asociado a la dependencia de un único recurso técnico (Rol Dual: Gerente/Desarrollador). Para mitigar este riesgo:

a) Se generará documentación técnica exhaustiva de la arquitectura, el código y los procedimientos de despliegue.

b) Se incluirá en la planificación a largo plazo la necesidad de capacitar a un segundo funcionario para asegurar la continuidad del mantenimiento y futuras evoluciones del sistema.

---

## 11. PATROCINADOR (SUPERVISOR) QUE AUTORIZA EL PROYECTO

• **Nombre:** Tte. ° Rodrigo LOPEZ
• **Rol:** Jefe del Servicio 222 (Guardia Republicana)
• **Firma de Aprobación:** ************\_************

---

*gr-depto.infoygc@minterior.gub.uy*
