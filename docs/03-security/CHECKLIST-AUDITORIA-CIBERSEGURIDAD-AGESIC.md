# Checklist de Auditoría de Ciberseguridad (AGESIC) - Proyecto PWA IRCCA

**Versión:** 1.0  
**Fecha:** 07 de Octubre de 2025  
**Propósito:** Este documento sirve como una guía de autoevaluación para verificar el cumplimiento del proyecto "Sistema para Registro de Ingresos y Egresos del IRCCA" con los requisitos clave del Marco de Ciberseguridad de AGESIC.

---

## Sección 1: Adquisición y Desarrollo de Sistemas (AD.1)

Esta es la sección más crítica para cualquier proyecto de software. Se enfoca en cómo se construye la aplicación, integrando la seguridad desde el inicio y no como un parche final.

| Requisito | Descripción de lo que se espera | Estado | Notas / Evidencia |
|-----------|----------------------------------|--------|-------------------|
| **AD.1-A: Guía de Codificación Segura** | El proyecto debe seguir un estándar reconocido para evitar vulnerabilidades comunes. Se espera que el desarrollador conozca y aplique prácticas como las del OWASP Top 10 (ej. evitar inyección SQL, XSS, etc.). | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **AD.1-B: Proceso de Revisión de Código** | Antes de que el código nuevo pase a producción, debe ser revisado por otra persona (o mediante herramientas automáticas). Evidencia clave: Historial de Pull/Merge Requests en Git con comentarios y aprobaciones. | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **AD.1-C: Pruebas de Seguridad** | El plan de pruebas debe incluir casos específicos para validar la seguridad, no solo la funcionalidad. Evidencia clave: Un plan de pruebas que mencione la validación de roles, intentos de inyección de datos, etc. Para sistemas críticos, se espera un informe de ethical hacking (CN.3). | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |

---

## Sección 2: Seguridad de las Operaciones (SO)

Esta sección se centra en las prácticas que mantienen el sistema seguro una vez que está en producción.

| Requisito | Descripción de lo que se espera | Estado | Notas / Evidencia |
|-----------|----------------------------------|--------|-------------------|
| **SO.1: Gestión de Vulnerabilidades (Dependencias)** | El proyecto debe tener un proceso para identificar y actualizar librerías de terceros (ej. Vue.js, componentes NPM) que tengan vulnerabilidades conocidas. Evidencia clave: Un procedimiento documentado y registros de ejecución (ej. npm audit). | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **SO.7: Registro y Monitoreo (Logs)** | La aplicación debe generar registros (logs) de eventos de seguridad importantes para poder investigar un incidente. **Qué registrar:** Inicios de sesión (exitosos y fallidos), acciones de administradores, errores críticos. Evidencia clave: Muestra de los archivos de log o configuración del sistema de logging. | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **SO.4: Separación de Entornos** | Debe existir una separación estricta entre los ambientes de Desarrollo, Pruebas y Producción. **Regla de oro:** Nunca usar datos personales reales en los entornos de desarrollo o pruebas. | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |

---

## Sección 3: Gestión de Incidentes de Seguridad (GI)

Se enfoca en la preparación de la organización para responder a un ataque o brecha de seguridad de manera ordenada.

| Requisito | Descripción de lo que se espera | Estado | Notas / Evidencia |
|-----------|----------------------------------|--------|-------------------|
| **GI.1: Plan de Respuesta a Incidentes** | Debe existir un documento que defina los pasos a seguir si ocurre un incidente de seguridad (ej. se detecta un acceso no autorizado). **Qué incluir:** Roles (quién hace qué), pasos de contención y erradicación, y a quién contactar. | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **GI.3: Notificación a Autoridades** | El Plan de Respuesta debe especificar cuándo y cómo notificar a las autoridades correspondientes. **A quiénes:** CERTuy (obligatorio para incidentes), URCDP (si se afectan datos personales) y Unidad de Cibercrimen (si es un delito). | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |

---

## Sección 4: Protección de Datos Personales (PD)

Se centra en el cumplimiento de la Ley N° 18.331 y las mejores prácticas de privacidad.

| Requisito | Descripción de lo que se espera | Estado | Notas / Evidencia |
|-----------|----------------------------------|--------|-------------------|
| **PD.1: Registro de Base de Datos** | La base de datos que almacena los registros de acceso debe estar formalmente inscrita en la URCDP. Evidencia clave: Constancia de inscripción emitida por la URCDP (como se define en la Solicitud de Cambio SC-001). | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **PD.8: Procedimiento para Derechos ARCO** | Debe existir un procedimiento documentado que explique cómo un ciudadano puede solicitar el Acceso, Rectificación, Supresión u Oposición de sus datos, y quién es el responsable de gestionar esa solicitud. | ☐ Cumple<br>☐ En Proceso<br>☐ Pendiente | |
| **PD.3: Política de Retención y Purga de Datos** | Debe estar formalmente definido por cuánto tiempo se guardarán los datos y cómo se eliminarán de forma segura una vez que ese plazo se cumpla. Evidencia clave: La política de retención definida en el Acta de Constitución (12 meses en tablet, 5 años en respaldos). | ✅ Cumple<br>☐ En Proceso<br>☐ Pendiente | Política definida en Acta de Constitución del Proyecto. |
| **PD.5: Medidas de Seguridad de Datos** | Se deben implementar controles técnicos para proteger los datos. Evidencia clave: Uso de cifrado (AES-256) para datos en reposo y hashing (bcrypt) para credenciales. | ✅ Cumple<br>☐ En Proceso<br>☐ Pendiente | - Cifrado AES-256 en IndexedDB<br>- Bcrypt para contraseñas<br>- HTTPS en producción |

---

## Resumen de Cumplimiento

| Estado | Total |
|--------|-------|
| ✅ Cumple | 2 |
| ☐ En Proceso | 0 |
| ☐ Pendiente | 9 |
| **Total de Requisitos** | **11** |

---

## Próximos Pasos

1. **Completar documentación técnica** para requisitos AD.1 (guías de codificación, proceso de revisión, plan de pruebas)
2. **Establecer proceso de gestión de dependencias** con npm audit automatizado
3. **Implementar sistema de logging** para eventos de seguridad
4. **Crear Plan de Respuesta a Incidentes** formal
5. **Tramitar inscripción** de base de datos ante URCDP
6. **Documentar procedimiento ARCO** para derechos de los ciudadanos

---

## Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 07-10-2025 | Sistema IRCCA | Versión inicial del checklist |

---

## Referencias

- **Marco de Ciberseguridad AGESIC:** [https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/](https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/)
- **Ley N° 18.331:** Protección de Datos Personales
- **OWASP Top 10:** [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **CERTuy:** [https://www.gub.uy/certificacion-electronica/](https://www.gub.uy/certificacion-electronica/)
- **URCDP:** Unidad Reguladora y de Control de Datos Personales
