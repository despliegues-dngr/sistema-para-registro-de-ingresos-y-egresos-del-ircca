# Guía para el Registro de Base de Datos ante la URCDP

**Proyecto:** Sistema para Registro de Ingresos y Egresos del IRCCA  
**Versión:** 2.0 (Corregida según implementación real)  
**Fecha:** 03-Oct-2025

**Propósito:** Este documento sirve como una guía paso a paso para que el Sr. Carlos Torres, en su rol de representante del IRCCA, complete el formulario de inscripción de la base de datos del nuevo sistema ante la Unidad Reguladora y de Control de Datos Personales (URCDP).

---

## Paso Previo: Acceso al Sistema

1. Ingresar a la siguiente dirección web con su usuario gub.uy:  
   https://www.datospersonales.gub.uy/SRCiudadanoWeb/registro/condiciones
2. Aceptar las políticas de uso y presionar el botón **"+ Nuevo trámite"**.

---

## 1. Tipo de trámite

- **Tipo de trámite:** Seleccionar **Registro de bases de datos**.
- **Titular del trámite:** Seleccionar **Organismo**.
- **Nombre del trámite:** Ingresar `Sistema de Registro de Ingresos y Egresos del IRCCA`.
- **Descripción:** Ingresar `Base de datos para la gestión y control de acceso a las instalaciones del IRCCA por razones de seguridad institucional.`

---

## 2. Datos del titular

- **Organismo:** Seleccionar **INSTITUCIONES SIN FINES DE LUCRO PUBLICAS**.
- **Unidad ejecutora:** Escribir `Instituto de Regulación y Control del Cannabis`.
- **Correo electrónico:** [Completar con el correo electrónico institucional principal del IRCCA].
- **Marcar la casilla:** ☑ Soy representante del Titular.
- **Datos del representante:** Estos datos se precargarán automáticamente con su usuario gub.uy.
- **Correo electrónico (del representante):** [Completar con su correo electrónico institucional, Sr. Torres].
- **Agregar representante:** No es necesario agregar a nadie más. Usted es el único representante requerido para este trámite.

---

## 3. Domicilio constituido

Este es el domicilio legal del IRCCA para recibir notificaciones oficiales.

- **Departamento:** [Completar con el Departamento del IRCCA].
- **Localidad:** [Completar con la Localidad del IRCCA].
- **Dirección:** [Completar con la Dirección legal del IRCCA].
- **Teléfono:** [Completar con el Teléfono principal del IRCCA].
- **Correo electrónico:** [Completar con el correo para notificaciones legales del IRCCA].

---

## 4. Datos del trámite

### 4.1 Ubicación física de la base de datos

Esta es la dirección física donde estará operando la tablet.

- **País:** Uruguay.
- **Departamento:** [Completar con el Departamento del puesto de vigilancia].
- **Localidad:** [Completar con la Localidad del puesto de vigilancia].
- **Dirección:** [Completar con la Dirección del puesto de vigilancia del IRCCA].
- **Teléfono:** [Completar con el teléfono del puesto de vigilancia o del IRCCA].
- **Correo electrónico:** [Completar con un correo de contacto del IRCCA].
- **¿La ubicación corresponde a un tercero?** Seleccionar **No**.
- **¿Existen ubicaciones alternativas o secundarias?** Seleccionar **No**.

### 4.2 Encargado o tercero que realiza tratamiento

Aquí se declara a la Guardia Republicana, que opera el sistema.

- Hacer clic en **"Agregar nuevo encargado"**.
- Completar los datos de la **Dirección Nacional de la Guardia Republicana**.  
  _[Sr. Torres, por favor, solicitar los datos formales (RUT, dirección, etc.) a la DNGR para completar esta sección]._

### 4.3 Datos del contacto técnico de la base de datos

Estos son los datos del responsable técnico del sistema.

- **Documento de Identidad:** [Completar con C.I. de Mario BERNI].
- **País:** Uruguay.
- **Nombre completo:** Mario BERNI.
- **Correo electrónico:** [Completar con el correo de Mario BERNI].
- **Teléfono:** [Completar con el teléfono de Mario BERNI].
- **El técnico es dependiente de:** Seleccionar **Encargado** (pertenece a la DNGR, que es el Encargado del tratamiento).

### 4.4 Servicio o unidad donde se pueden ejercer los derechos

Este es el punto de contacto para que los ciudadanos consulten sobre sus datos.

- **Contacto:** Oficina de Atención - IRCCA.
- **Departamento:** [Completar con el Departamento del IRCCA].
- **Localidad:** [Completar con la Localidad del IRCCA].
- **Dirección:** [Completar con la Dirección del IRCCA].
- **Teléfono:** [Completar con el Teléfono del IRCCA].
- **Correo electrónico:** [Completar con un correo de atención del IRCCA].
- **Página web:** [Completar con la página web del IRCCA, si aplica].

### 4.5 Ejercicio de los derechos de los titulares de los datos

Marcar las siguientes casillas:

- ☑ Personalmente
- ☑ Nota escrita
- ☑ Correo electrónico

### 4.6 Datos sometidos al tratamiento

- **Cantidad de personas físicas:** Ingresar `50000` (estimación anual).
- **Cantidad de personas jurídicas:** Ingresar `0`.

#### Tipos de información incorporada:

**¿La base incluye datos de carácter identificatorio?** Seleccionar **Sí**.

**Detalle:**

```
- Datos personales: Cédula de Identidad, Nombre completo, Apellido
- Datos de visita: Destino dentro del predio
- Datos de vehículo (opcionales): Tipo de vehículo (Auto/Moto/Camión/Bus), Matrícula
- Datos de acompañantes (opcionales): Cédula, Nombre completo, Apellido, Destino
- Metadatos operacionales: Fecha/hora de ingreso-salida, Identificación del operador responsable del registro
- Observaciones operacionales (opcionales): Notas breves sobre el ingreso o salida (máximo 100 caracteres)
```

**¿La base incluye datos de características personales?** Seleccionar **Sí**.

**Detalle:**

```
Grado o rango del personal autorizado del sistema (únicamente para usuarios operadores del sistema de registro, no para visitantes)
```

Para el resto de las categorías **(información comercial, económico-financieros, especialmente protegidos, sensibles, otros datos)**, seleccionar **No**.

### 4.7 Procedimiento de obtención y tratamiento de datos

#### 4.7.1 Procedencia de los datos

Marcar:  
☑ Proporcionado por el interesado o su Representante Legal.

#### 4.7.2 Procedimientos de obtención

Marcar:  
☑ Formularios.

#### 4.7.3 Tiempo de conservación

Escribir:  
`12 meses en el dispositivo (retención activa) y 5 años en archivo de respaldo cifrado.`

#### 4.7.4 Tratamiento de los datos (Finalidad)

Marcar:  
☑ Otros

En el campo de texto que aparece, escribir:  
`Gestión y control de acceso a las instalaciones por razones de seguridad institucional.`

#### 4.7.5 Cesiones o comunicaciones de datos

Seleccionar **No**.

#### 4.7.6 Transferencias internacionales

Seleccionar **No**.

### 4.8 Medidas de seguridad

**¿Adopta medidas de seguridad?** Seleccionar **Sí**.

#### ¿Adopta medidas de seguridad físicas?

Seleccionar **Sí**.

**Descripción de las medidas físicas:**

```
La tablet será utilizada en el Puesto N° 1, donde es custodiada 24 horas los 365 días del año por personal policial de la Guardia Republicana. Existe además la supervisión de un Superior designado como control del Servicio 222, a quien se le comunican las novedades del servicio, incluyendo las del dispositivo o sistema. El acceso físico al dispositivo está restringido únicamente a personal autorizado.
```

#### ¿Adopta medidas de seguridad lógicas?

Seleccionar **Sí**.

**Descripción de las medidas lógicas:**

```
El sistema implementa las siguientes medidas de seguridad lógicas:

1. CIFRADO DE DATOS:
   - Algoritmo: AES-256-GCM (Galois/Counter Mode) para todos los datos sensibles
   - Derivación de claves: PBKDF2 con 100,000 iteraciones y SHA-256
   - Vector de inicialización único por operación de cifrado
   - Salt criptográfico único por sesión de usuario

2. CONTROL DE ACCESO:
   - Sistema RBAC (Control de Acceso Basado en Roles) con 3 niveles: 
     Administrador, Supervisor y Operador
   - Autenticación mediante usuario (cédula) y PIN numérico
   - Hashing seguro de credenciales con PBKDF2 (sin almacenamiento en texto plano)
   - Bloqueo automático tras 3 intentos fallidos de autenticación
   - Sesiones con timeout automático por inactividad (3 horas)

3. AUDITORÍA Y TRAZABILIDAD:
   - Sistema de auditoría inmutable que registra todas las operaciones críticas
   - Logs cifrados con timestamp, usuario responsable y acción realizada
   - Trazabilidad completa de accesos, modificaciones y consultas de datos

4. MODO KIOSCO:
   - Tablet configurada en modo kiosco para impedir acceso no autorizado 
     al sistema operativo Android
   - Bloqueo de gestos del sistema, notificaciones y teclas de función
   - Pantalla completa forzada permanente sin posibilidad de salir de la aplicación

5. RESPALDOS SEGUROS:
   - Estrategia de backup 3-2-1 con respaldos cifrados
   - Automáticos: diarios (últimos 7 días) y semanales (últimas 4 semanas)
   - Manuales: mensuales exportables en formato cifrado para archivo externo
   - Retención de datos: 12 meses en dispositivo, posterior exportación manual 
     a archivo externo para cumplimiento de retención legal de 5 años

6. INTEGRIDAD:
   - Validaciones de entrada en todos los formularios para prevenir datos inválidos
   - Protección contra inyección de código
   - Verificación de integridad mediante autenticación GCM integrada en el cifrado
```

### 4.9 Descripción técnica de la base de datos

**Indique soporte utilizado:** Marcar ☑ Electrónico / Informatizado.

**Descripción general del sistema de información:**

```
El sistema es una Progressive Web App (PWA) desarrollada con Vue.js 3 y TypeScript, 
diseñada para operar en una tablet Android de forma completamente offline.

ARQUITECTURA:
- Frontend: Vue.js 3 con Composition API + Vuetify 3 (Material Design)
- Gestión de estado: Pinia (4 stores modulares para autenticación, registros, 
  auditoría y configuración)
- Base de datos local: IndexedDB con 5 object stores (registros, usuarios, 
  configuración, backups, auditoría)
- PWA: Service Worker gestionado con Workbox para funcionamiento offline completo

SEGURIDAD:
- Cifrado en reposo: AES-256-GCM para todos los datos personales y sensibles 
  (cédulas, nombres, apellidos, destinos, matrículas de vehículos)
- Autenticación: PBKDF2 (100,000 iteraciones) con salt único por usuario
- Control de acceso: Sistema RBAC con 3 roles jerárquicos (Administrador, 
  Supervisor, Operador)
- Auditoría: Registro inmutable cifrado de todos los eventos críticos del sistema
- Sesiones: Timeout automático por inactividad y limpieza segura de claves en memoria

FUNCIONALIDAD:
- Módulos: Autenticación multiusuario, Registro de ingreso/salida con datos 
  personales y vehículos, Consultas de personas dentro del predio, Generación de 
  reportes en formato PDF, Administración de usuarios, Sistema de feedback*
- Capacidades especiales: Autocompletado inteligente de visitantes recurrentes por 
  búsqueda de cédula, Registro de acompañantes múltiples (hasta 20 por ingreso), 
  Cálculo automático de tiempo de estadía
- Modo kiosco: Tablet bloqueada en aplicación única sin acceso al sistema operativo
- Respaldos: Automáticos diarios y semanales internos, Manuales mensuales en formato 
  cifrado para extracción a medio externo

DATOS CAPTURADOS POR REGISTRO DE INGRESO:
- Persona principal: Cédula (7-8 dígitos), Nombre, Apellido, Destino
- Vehículo (opcional): Tipo (Auto/Moto/Camión/Bus), Matrícula
- Acompañantes (opcional, hasta 20): Cédula, Nombre, Apellido, Destino por cada uno
- Observaciones (opcional): Texto libre hasta 100 caracteres
- Metadatos: Fecha/hora, Operador responsable del registro

RETENCIÓN Y COMPLIANCE:
- Datos activos: 12 meses en tablet con acceso inmediato para consultas operativas
- Archivo histórico: 5 años en respaldo externo cifrado para auditorías y cumplimiento legal
- Proceso de purga: Manual y supervisado por administrador autorizado, posterior a 
  verificación de exportación exitosa del archivo histórico
- Cumplimiento: Ley N° 18.331 de Protección de Datos Personales (Uruguay)
- Procedimientos ARCO: Implementados para ejercicio de derechos de acceso, 
  rectificación, cancelación y oposición
- Consentimiento informado: Señalética visible en puesto de control informando sobre 
  la recolección de datos

* Sistema de feedback: Implementado mediante canales institucionales formales 
  (teléfono, correo electrónico institucional y cadena de mando jerárquica de la DNGR). 
  No requiere módulo digital en la aplicación.
```

---

## 5. Enviar Trámite

Una vez completados todos los campos, presionar el botón para **"Enviar Trámite"**.

El sistema generará un **número de seguimiento**. Por favor, guardar este número para futuras consultas.

---

## 📋 NOTAS IMPORTANTES

### Datos a Verificar Antes del Envío

1. ✅ Confirmar relación laboral de Mario BERNI con la DNGR
2. ✅ Obtener datos completos (RUT, dirección formal) de la DNGR como "Encargado"
3. ✅ Verificar todos los correos electrónicos institucionales estén vigentes
4. ✅ Confirmar teléfonos de contacto actualizados
5. ✅ Verificar que la señalética de consentimiento informado está instalada en el puesto

### Documentación de Respaldo Sugerida

Se recomienda tener disponibles para consulta o adjuntar al trámite:

- `docs/02-architecture/02-security-architecture.md` - Arquitectura de seguridad detallada
- `docs/02-architecture/06-database-architecture.md` - Esquema de base de datos
- `docs/01-management/01-project-charter.md` - Políticas de retención y compliance

---

---

## ✅ VERIFICACIÓN TÉCNICA COMPLETADA

Este documento ha sido **auditado contra el código fuente real** del sistema:

### **Datos Verificados:**
- ✅ Interfaces TypeScript (`src/stores/registro.ts`)
- ✅ Componentes de formulario (`src/components/forms/`)
- ✅ Constantes del sistema (`src/config/constants.ts`)
- ✅ Arquitectura de base de datos (IndexedDB)
- ✅ Límites y validaciones implementadas

### **Confirmaciones Técnicas:**
- **Destinos disponibles:** IRCCA, Ligeral, Simbiosys, Jabelor, Otra (hardcoded en componentes)
- **Tipos de vehículo:** Auto, Moto, Camión, Bus (selector único)
- **Límite acompañantes:** 20 (validación en código línea 176 de RegistroIngresoForm.vue)
- **Validación cédula:** 7-8 dígitos (acepta ambos formatos)
- **Observaciones:** Máximo 100 caracteres (counter implementado en formulario)

---

**Documento preparado por:** Mario BERNI (Gerente de Proyecto/Desarrollador)  
**Última actualización:** 03-Oct-2025 01:53 AM  
**Verificado contra código fuente:** ✅ 100% Alineado con implementación real  
**Auditoría completada:** Ver `AUDITORIA-IMPLEMENTACION.md` para detalles técnicos  
**Contacto técnico:** gr-depto.infoygc@minterior.gub.uy
