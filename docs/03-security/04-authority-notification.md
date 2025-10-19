# 📞 NOTIFICACIÓN A AUTORIDADES - Sistema IRCCA

**Versión:** 1.0  
**Fecha:** 08-Oct-2025  
**Propósito:** Definir cuándo y cómo notificar a las autoridades uruguayas en caso de incidentes de seguridad informática o violaciones de datos personales.

**Cumplimiento:** Requisito GI.3 - Marco de Ciberseguridad AGESIC

---

## 📋 Resumen Ejecutivo

### 🎯 Objetivo

Establecer el procedimiento claro y obligatorio para notificar a las autoridades competentes cuando ocurre un incidente de seguridad informática o una violación de datos personales.

**Autoridades de notificación obligatoria:**
- ✅ **CERTuy** - Centro Nacional de Respuesta a Incidentes de Seguridad Informática
- ✅ **URCDP** - Unidad Reguladora y de Control de Datos Personales
- ✅ **Unidad de Cibercrimen** - Ministerio del Interior

---

## 🏛️ AUTORIDADES COMPETENTES

### **1. CERTuy - Incidentes de Seguridad Informática**

**Centro Nacional de Respuesta a Incidentes de Seguridad Informática**

#### **¿Quiénes son?**
Organismo técnico dependiente de AGESIC encargado de coordinar la respuesta nacional a incidentes de ciberseguridad.

#### **¿Cuándo notificar?**
✅ **OBLIGATORIO** notificar en caso de:
- Acceso no autorizado al sistema
- Ataque de denegación de servicio (DoS/DDoS)
- Malware o ransomware detectado
- Intrusión confirmada
- Exfiltración de datos
- Defacement del sitio web
- Cualquier incidente que afecte la seguridad del sistema

#### **Contactos:**

```
📧 Email: incidentes@cert.uy
📞 Teléfono: +598 2901 2929 (24/7)
🌐 Web: https://www.cert.uy/
📍 Dirección: Torre Ejecutiva Sur, Plaza Independencia 710, Montevideo

Portal de reporte: https://www.cert.uy/incidentes/reportar
```

#### **Plazo de notificación:**
- ⚠️ **Inmediato:** Dentro de las **24 horas** de detectado el incidente
- 📄 **Reporte formal:** Dentro de las **72 horas**

---

### **2. URCDP - Violación de Datos Personales**

**Unidad Reguladora y de Control de Datos Personales**

#### **¿Quiénes son?**
Autoridad de control de protección de datos personales, responsable de velar por el cumplimiento de la Ley 18.331.

#### **¿Cuándo notificar?**
✅ **OBLIGATORIO** notificar en caso de:
- Fuga o pérdida de datos personales
- Acceso no autorizado a bases de datos con información personal
- Exposición pública de datos personales
- Robo de respaldos con información personal
- Cifrado de datos por ransomware
- Pérdida de tablet con datos del sistema

⚠️ **IMPORTANTE:** El Sistema IRCCA maneja datos personales (cédulas, nombres, matrículas), por lo que cualquier violación de seguridad probablemente requiera notificación.

#### **Contactos:**

```
📧 Email: datospersonales@agesic.gub.uy
📞 Teléfono: +598 2901 2929
🌐 Web: https://www.gub.uy/unidad-reguladora-control-datos-personales/
📍 Dirección: Torre Ejecutiva Sur, Plaza Independencia 710, Piso 7, Montevideo

Formulario de reporte: https://www.gub.uy/unidad-reguladora-control-datos-personales/tramites-y-servicios/servicios/denuncias
```

#### **Plazo de notificación:**
- ⚠️ **Urgente:** Dentro de las **72 horas** de detectado
- 📄 **Notificación a afectados:** Plazo determinado por URCDP según gravedad

---

### **3. Unidad de Cibercrimen - Ministerio del Interior**

**División de Delitos Informáticos**

#### **¿Quiénes son?**
Unidad especializada de la Policía Nacional en investigación de delitos informáticos.

#### **¿Cuándo notificar?**
✅ **OBLIGATORIO** notificar en caso de:
- Delito informático confirmado o presunto
- Hackeo malicioso intencional
- Robo de información
- Sabotaje del sistema
- Extorsión (ransomware)
- Suplantación de identidad
- Fraude informático

⚠️ **NOTA:** Si el incidente constituye un **delito**, la denuncia es obligatoria por ley.

#### **Contactos:**

```
📧 Email: cibercrimen@minterior.gub.uy
📞 Teléfono: 0800 8888 (Línea azul - 24/7)
📞 Emergencias: 911
🌐 Web: https://www.gub.uy/ministerio-interior/
📍 Dirección: Jefatura de Policía de Montevideo - Mercedes esq. Yi, Montevideo

Para denuncias presenciales:
- Cualquier Seccional Policial
- Fiscalía de Delitos Informáticos
```

#### **Plazo de notificación:**
- ⚠️ **Inmediato** si hay delito en curso
- 📄 **Denuncia formal:** Lo antes posible (no hay plazo legal específico)

---

## 📊 MATRIZ DE DECISIÓN

### **¿A quién notificar según el tipo de incidente?**

| Tipo de Incidente | CERTuy | URCDP | Cibercrimen |
|-------------------|--------|-------|-------------|
| **Acceso no autorizado** | ✅ Sí | ⚠️ Si hay datos personales | ✅ Sí (posible delito) |
| **Fuga de datos personales** | ✅ Sí | ✅ SÍ OBLIGATORIO | ✅ Sí (robo de datos) |
| **Ransomware** | ✅ Sí | ✅ Sí (datos cifrados) | ✅ Sí (extorsión) |
| **Malware detectado** | ✅ Sí | ⚠️ Si compromete datos | ⚠️ Según caso |
| **DoS/DDoS** | ✅ Sí | ❌ No | ⚠️ Si es ataque dirigido |
| **Pérdida de tablet** | ✅ Sí | ✅ SÍ (datos personales) | ✅ Sí (robo) |
| **Vulnerabilidad crítica** | ✅ Sí (reporte proactivo) | ❌ No | ❌ No |
| **Intento fallido de login masivo** | ⚠️ Si es ataque | ❌ No | ⚠️ Si es ataque dirigido |
| **Error de configuración que expuso datos** | ✅ Sí | ✅ Sí | ⚠️ Según responsabilidad |

**Leyenda:**
- ✅ **Notificación obligatoria**
- ⚠️ **Evaluar caso a caso**
- ❌ **No requerido** (pero puede ser recomendable)

---

## 📝 PROCEDIMIENTO DE NOTIFICACIÓN

### **Paso 1: Evaluación Inmediata (< 1 hora)**

```markdown
## Checklist de Evaluación:

[ ] ¿Hubo acceso no autorizado?
[ ] ¿Se comprometieron datos personales?
[ ] ¿Hay evidencia de delito informático?
[ ] ¿Sistemas críticos afectados?
[ ] ¿Datos expuestos públicamente?
[ ] ¿Información confidencial filtrada?
[ ] ¿Servicios interrumpidos?

Si respondiste SÍ a alguna pregunta → NOTIFICAR
```

**Responsable:** Custodio Técnico (Mario BERNI) o Administrador del Sistema

---

### **Paso 2: Notificación a CERTuy (< 24 horas)**

#### **Información a preparar:**

```markdown
# Reporte de Incidente a CERTuy

**Datos de la Organización:**
- Organismo: Instituto de Regulación y Control del Cannabis (IRCCA)
- Sistema afectado: Sistema de Control de Accesos
- Contacto técnico: Mario BERNI
- Email: [email_contacto]
- Teléfono: [teléfono_contacto]

**Detalles del Incidente:**
- Fecha y hora de detección: [YYYY-MM-DD HH:MM]
- Tipo de incidente: [acceso no autorizado / malware / etc.]
- Descripción breve: [150-200 palabras]
- Sistemas afectados: [tablet / servidor / base de datos]
- Datos comprometidos: [tipo y cantidad]
- Estado actual: [contenido / en investigación / resuelto]

**Acciones Tomadas:**
- [Medida 1]
- [Medida 2]
- [Medida 3]

**Evidencia Recopilada:**
- Logs del sistema
- Capturas de pantalla
- Análisis de tráfico
- Timestamps
```

#### **Vías de notificación:**

**Opción A: Formulario Web (Recomendado)**
```
1. Ir a: https://www.cert.uy/incidentes/reportar
2. Completar formulario en línea
3. Adjuntar evidencia
4. Guardar número de ticket
```

**Opción B: Email**
```
Para: incidentes@cert.uy
Asunto: [INCIDENTE] Sistema IRCCA - [Tipo de incidente]
Cuerpo: Usar template anterior
Adjuntos: Evidencia relevante (logs, capturas)
```

**Opción C: Teléfono (Urgente)**
```
Llamar a: +598 2901 2929
Mencionar: "Reporte de incidente de seguridad"
Proporcionar: Datos básicos del incidente
Seguimiento: Email formal dentro de 24h
```

---

### **Paso 3: Notificación a URCDP (< 72 horas)**

**Solo si hay violación de datos personales**

#### **Template de Notificación:**

```markdown
# Notificación de Violación de Datos Personales

Para: datospersonales@agesic.gub.uy
Asunto: [URGENTE] Notificación de Violación de Datos - IRCCA

Estimados,

En cumplimiento de la Ley 18.331 y su Decreto Reglamentario, notificamos
una violación de seguridad que afectó datos personales:

**1. DATOS DEL RESPONSABLE:**
- Organismo: Instituto de Regulación y Control del Cannabis (IRCCA)
- Base de datos: Sistema de Control de Accesos
- Responsable del tratamiento: [Nombre y cargo]
- Contacto: [Email y teléfono]

**2. NATURALEZA DE LA VIOLACIÓN:**
- Fecha del incidente: [YYYY-MM-DD]
- Fecha de detección: [YYYY-MM-DD]
- Tipo de violación: [Acceso no autorizado / Pérdida / Robo / Divulgación]
- Descripción: [Detallar cómo ocurrió]

**3. DATOS PERSONALES AFECTADOS:**
- Categorías de datos: [Cédula / Nombre / Matrícula / etc.]
- Cantidad aproximada de registros: [número]
- Personas afectadas: [empleados / visitantes / ambos]
- Sensibilidad: [alta / media / baja]

**4. CONSECUENCIAS PROBABLES:**
- Riesgo para los afectados: [análisis de impacto]
- Posibles usos indebidos: [especificar]

**5. MEDIDAS ADOPTADAS:**
- Contención: [acciones inmediatas]
- Mitigación: [medidas correctivas]
- Prevención: [mejoras futuras]

**6. NOTIFICACIÓN A AFECTADOS:**
- ¿Se notificó a los afectados? [Sí / No / En proceso]
- Medio de notificación: [Email / Carta / Publicación]
- Fecha de notificación: [YYYY-MM-DD]

**7. MEDIDAS DE SEGURIDAD IMPLEMENTADAS:**
- [Detalle de medidas técnicas y organizativas]

Quedamos a disposición para ampliar información.

Atentamente,
[Nombre]
[Cargo]
[Contacto]
```

#### **Documentos a adjuntar:**

```
- Informe técnico del incidente
- Análisis de impacto
- Plan de acción correctiva
- Evidencia forense (si aplica)
- Políticas de seguridad vigentes
```

---

### **Paso 4: Denuncia a Unidad de Cibercrimen**

**Solo si constituye delito informático**

#### **¿Cómo denunciar?**

**Opción A: Denuncia presencial (Recomendado)**
```
1. Ir a Seccional Policial más cercana
2. Solicitar: "Quiero hacer una denuncia por delito informático"
3. Llevar: Evidencia impresa, pen drive con logs, documentación
4. Explicar: Cronología detallada del incidente
5. Obtener: Número de denuncia y comprobante
```

**Opción B: Email**
```
Para: cibercrimen@minterior.gub.uy
Asunto: Denuncia por Delito Informático - IRCCA
Contenido: Template similar a CERTuy pero enfocado en el delito
```

**Opción C: Línea Azul (Urgente)**
```
Llamar: 0800 8888 (gratuito)
Mencionar: "Delito informático en curso"
Proporcionar: Ubicación y datos básicos
```

#### **Evidencia a preservar:**

```
✅ NO APAGAR el equipo comprometido
✅ Hacer captura de pantalla del estado actual
✅ Exportar logs del sistema
✅ Documentar timeline de eventos
✅ Guardar copias de respaldos anteriores al incidente
✅ Preservar comunicaciones sospechosas (emails, mensajes)
```

---

## ⏱️ TIMELINE DE NOTIFICACIONES

### **Cronograma Típico:**

```
HORA 0: Detección del incidente
  ↓
< 1h: Evaluación inicial y contención
  ↓
< 2h: Notificación interna (Dirección IRCCA)
  ↓
< 24h: Notificación a CERTuy
  ↓
< 72h: Notificación a URCDP (si aplica)
  ↓
< 7 días: Denuncia formal a Unidad de Cibercrimen
  ↓
< 15 días: Reporte final a autoridades
```

---

## 📧 TEMPLATES DE COMUNICACIÓN INTERNA

### **Email a Dirección IRCCA:**

```
Para: direccion@ircca.gub.uy
Asunto: [URGENTE] Incidente de Seguridad Informática

Estimada Dirección,

Informo que se ha detectado un incidente de seguridad informática en el Sistema de Control de Accesos:

RESUMEN:
- Fecha: [YYYY-MM-DD HH:MM]
- Tipo: [Breve descripción]
- Impacto: [Alto / Medio / Bajo]
- Estado: [Contenido / En investigación]

ACCIONES INMEDIATAS:
- [Acción 1]
- [Acción 2]

NOTIFICACIONES REQUERIDAS:
- ✅ CERTuy (obligatorio)
- [ ] URCDP (a evaluar)
- [ ] Unidad de Cibercrimen (si es delito)

Se procederá con las notificaciones oficiales según protocolo.
Mantendré informado sobre evolución.

Atentamente,
Mario BERNI
Custodio Técnico del Sistema
```

---

## 📋 CHECKLIST DE CUMPLIMIENTO

**Verificación de notificaciones:**

```markdown
## Post-Incidente:

[ ] ✅ Incidente evaluado y clasificado
[ ] ✅ CERTuy notificado (si aplica)
    [ ] Email enviado
    [ ] Número de ticket recibido
    [ ] Seguimiento activo
[ ] ✅ URCDP notificado (si aplica)
    [ ] Notificación dentro de 72h
    [ ] Evidencia adjuntada
    [ ] Confirmación recibida
[ ] ✅ Unidad de Cibercrimen notificada (si aplica)
    [ ] Denuncia presentada
    [ ] Número de expediente recibido
    [ ] Evidencia preservada
[ ] ✅ Dirección IRCCA informada
[ ] ✅ Afectados notificados (si requiere URCDP)
[ ] ✅ Documentación completa archivada
[ ] ✅ Lecciones aprendidas documentadas
```

---

## 📁 ARCHIVO DE NOTIFICACIONES

### **Registro Obligatorio:**

Mantener registro de TODAS las notificaciones en:
```
docs/03-security/incidents/notifications/
├── 2025-10-08_certuy_acceso_no_autorizado.pdf
├── 2025-10-08_urcdp_violacion_datos.pdf
└── 2025-10-08_cibercrimen_denuncia.pdf
```

**Contenido mínimo del registro:**
- Fecha y hora de notificación
- Autoridad notificada
- Medio utilizado (email/web/presencial)
- Número de ticket/expediente
- Copia de la comunicación enviada
- Respuesta recibida (si aplica)
- Seguimiento realizado

---

## ⚖️ RESPONSABILIDADES

### **Custodio Técnico (Mario BERNI):**
- ✅ Detectar y evaluar incidentes
- ✅ Preparar reportes técnicos
- ✅ Realizar notificaciones a CERTuy
- ✅ Coordinar con URCDP
- ✅ Preservar evidencia para Cibercrimen
- ✅ Mantener registro de notificaciones

### **Dirección IRCCA:**
- ✅ Aprobar notificaciones formales
- ✅ Firma de comunicaciones oficiales
- ✅ Autorizar divulgación pública (si requiere)
- ✅ Coordinar con asesoría legal
- ✅ Gestionar comunicación con afectados

### **Asesoría Legal (si disponible):**
- ✅ Revisar notificaciones a URCDP
- ✅ Asesorar sobre denuncia penal
- ✅ Evaluar responsabilidades
- ✅ Representación en procesos administrativos/judiciales

---

## 📝 Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 08-Oct-2025 | Mario BERNI | Versión inicial - Cumplimiento GI.3 |

---

**NOTA CRÍTICA:** La notificación oportuna a las autoridades es un DEBER LEGAL. El incumplimiento puede resultar en sanciones administrativas, penales y responsabilidad civil. Ante la duda, siempre notificar.

**Custodio Técnico:** Mario BERNI  
**Próxima revisión:** 08-Ene-2026
