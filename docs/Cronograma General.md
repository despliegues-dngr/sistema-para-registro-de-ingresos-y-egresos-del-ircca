# CRONOGRAMA DETALLADO DEL PROYECTO

**PROYECTO:** Sistema PWA para Registro de Ingresos y Egresos en IRCCA  
**VERSIÓN:** 1.0  
**FECHA DE CREACIÓN:** 08 de Septiembre de 2025  

**FECHA DE INICIO:** 09-Sep-2025  
**FECHA DE FIN:** 06-Oct-2025  

---

## Tabla de Actividades y Plazos

### Calendario del Proyecto

| Septiembre | | | | | | | | | | | | | | | | | | | | | | Octubre | | | | | |
|------------|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|---------|--|--|--|--|--|
| **Día**    | **9** | **10** | **11** | **12** | **13** | **14** | **15** | **16** | **17** | **18** | **19** | **20** | **21** | **22** | **23** | **24** | **25** | **26** | **27** | **28** | **29** | **30** | **1** | **2** | **3** | **4** | **5** | **6** |

---

## SEMANA 1: DISEÑO Y PLANIFICACIÓN

| ID EDT | Actividad | Responsable | Duración | Inicio | Fin | Depende de |
|--------|-----------|-------------|----------|--------|-----|------------|
| **1.1.4** | Cronograma Detallado (Este Doc.) | Gerente de Proyecto | 1 día | 09-Sep | 09-Sep | - |
| **1.2.3** | Diseño de UI/UX (Maquetas y Flujo) | Gerente de Proyecto | 2 días | 10-Sep | 11-Sep | 1.1.4 |
| **1.2.1** | Diseño de Arquitectura Técnica | Gerente de Proyecto | 2 días | 10-Sep | 11-Sep | 1.1.4 |
| **1.2.2** | Diseño de Base de Datos (IndexedDB) | Gerente de Proyecto | 1 día | 12-Sep | 12-Sep | 1.2.1 |

### Hitos Semana 1
| Hito | Responsable | Fecha | Depende de |
|------|-------------|-------|------------|
| 🎯 **HITO: Diseño UI/UX Aprobado** | Enc. de Seguridad | 12-Sep | 1.2.3 |
| 📊 **HITO: Informe de Avance Semana 1** | Gerente de Proyecto | 15-Sep | - |

---

## SEMANA 2: DESARROLLO FRONTEND Y DOCUMENTACIÓN

| ID EDT | Actividad | Responsable | Duración | Inicio | Fin | Depende de |
|--------|-----------|-------------|----------|--------|-----|------------|
| **1.3.1-FE** | Desarrollo FE: Autenticación y Layout | Gerente de Proyecto | 2 días | 16-Sep | 17-Sep | 1.2.3 |
| **1.3.2-FE** | Desarrollo FE: Módulo de Registro | Gerente de Proyecto | 2 días | 18-Sep | 19-Sep | 1.3.1-FE |
| **1.3.3-FE** | Desarrollo FE: Módulo de Consulta | Gerente de Proyecto | 1 día | 18-Sep | 18-Sep | 1.3.1-FE |
| **1.5.2** | Inicio Manual de Usuario | Gerente de Proyecto | 5 días | 18-Sep | 22-Sep | 1.2.3 |
| **1.5.3** | Redacción Política de Uso y Privacidad | Gerente de Proyecto | 2 días | 20-Sep | 22-Sep | 1.2.3 |

### Hitos Semana 2
| Hito | Responsable | Fecha | Depende de |
|------|-------------|-------|------------|
| 📊 **HITO: Informe de Avance Semana 2** | Gerente de Proyecto | 22-Sep | 1.3.2-FE |

---

## SEMANA 3: DESARROLLO LÓGICA E INTEGRACIÓN

| ID EDT | Actividad | Responsable | Duración | Inicio | Fin | Depende de |
|--------|-----------|-------------|----------|--------|-----|------------|
| **1.3.1-L** | Lógica: Autenticación y Roles | Gerente de Proyecto | 1 día | 23-Sep | 23-Sep | 1.3.2-FE |
| **1.3.2-L** | Lógica: Módulo de Registro | Gerente de Proyecto | 2 días | 24-Sep | 25-Sep | 1.3.1-L |
| **1.3.3-L** | Lógica: Módulo de Consulta | Gerente de Proyecto | 1 día | 24-Sep | 24-Sep | 1.3.1-L |
| **1.3.4** | Desarrollo Módulo de Supervisión (PDF) | Gerente de Proyecto | 2 días | 25-Sep | 26-Sep | 1.3.1-L |
| **1.3.5** | Desarrollo Módulo de Feedback | Gerente de Proyecto | 1 día | 29-Sep | 29-Sep | 1.3.4 |
| **1.3.6** | Desarrollo Módulo de Administración | Gerente de Proyecto | 1 día | 29-Sep | 29-Sep | 1.3.4 |

### Hitos Semana 3
| Hito | Responsable | Fecha | Depende de |
|------|-------------|-------|------------|
| 📱 **HITO: Recepción de Tablet** | Enc. de Seguridad | 29-Sep | - |
| 📊 **HITO: Informe de Avance Semana 3** | Gerente de Proyecto | 29-Sep | - |

---

## SEMANA 4: PRUEBAS, DESPLIEGUE Y CIERRE

| ID EDT | Actividad | Responsable | Duración | Inicio | Fin | Depende de |
|--------|-----------|-------------|----------|--------|-----|------------|
| **1.4.2** | Configuración de Tablet (Modo Kiosco) | Gerente de Proyecto | 1 día | 30-Sep | 30-Sep | 1.4.1 |
| **1.4.3** | Despliegue de PWA en Tablet (Go-Live) | Gerente de Proyecto | 1 día | 01-Oct | 01-Oct | 1.4.2, 1.3.5 |
| **1.5.1** | Pruebas de Aceptación de Usuario (UAT) | Operadores | 2 días | 02-Oct | 03-Oct | 1.4.3 |
| **1.1.6** | Acta de Cierre y Lecciones Aprendidas | Gerente de Proyecto | 1 día | 06-Oct | 06-Oct | 1.5.1 |

### Hitos Semana 4
| Hito | Responsable | Fecha | Depende de |
|------|-------------|-------|------------|
| 📋 **HITO: Manual de Usuario Aprobado** | Tte. 1° R. López | 03-Oct | 1.5.2, 1.5.1 |
| 🎉 **HITO: PROYECTO FINALIZADO** | Todos | 06-Oct | 1.1.6 |

---

## Resumen de Entregables Principales

### Semana 1
- ✅ Cronograma detallado
- 🎨 Diseño UI/UX completo
- 🏗️ Arquitectura técnica definida
- 🗄️ Diseño de base de datos

### Semana 2
- 🖥️ Frontend: Autenticación y layout
- 📝 Frontend: Módulo de registro
- 🔍 Frontend: Módulo de consulta
- 📖 Manual de usuario (inicio)
- 📋 Política de uso y privacidad

### Semana 3
- 🔐 Lógica de autenticación y roles
- ⚙️ Lógica de módulos principales
- 📄 Módulo de supervisión (PDF)
- 💬 Módulo de feedback
- 👥 Módulo de administración

### Semana 4
- 📱 Configuración de tablet
- 🚀 Despliegue en producción
- ✅ Pruebas de aceptación
- 📊 Cierre del proyecto

---

## Ruta Crítica del Proyecto

**Actividades críticas que no pueden retrasarse:**
1. Diseño UI/UX → Aprobación → Desarrollo Frontend
2. Desarrollo Frontend → Desarrollo Lógica → Integración
3. Recepción de Tablet → Configuración → Despliegue
4. Despliegue → Pruebas UAT → Cierre

**Duración total:** 28 días calendario (4 semanas)  
**Esfuerzo estimado:** 400 horas de desarrollo
