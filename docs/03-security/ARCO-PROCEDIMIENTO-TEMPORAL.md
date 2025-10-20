# 📋 Procedimiento Temporal - Gestión Manual de Solicitudes ARCO

**Estado:** Procedimiento vigente hasta implementación de Fase 2  
**Válido desde:** 19-Oct-2025  
**Responsable:** Custodio Técnico del Sistema

---

## ⚠️ Contexto

Este procedimiento define cómo gestionar solicitudes ARCO **manualmente** mientras el sistema automatizado de tracking (Fase 2) no está implementado.

**Sistema actual:**
- ✅ Exportación de datos (Derecho de Acceso): **AUTOMATIZADO**
- ⏳ Gestión de solicitudes: **MANUAL** (este procedimiento)
- ⏳ Rectificación/Cancelación: **MANUAL**

---

## 🎯 Objetivo

Asegurar que todas las solicitudes ARCO se procesen correctamente, cumpliendo:
- Plazo legal: **10 días hábiles**
- Trazabilidad completa
- Respuesta formal documentada
- Cumplimiento Ley 18.331

---

## 📥 Recepción de Solicitudes

### **Canales Autorizados**

1. **Email institucional**
   - `datospersonales@ircca.gub.uy`
   - Revisar DIARIAMENTE

2. **Presencial**
   - Recepción de IRCCA
   - Entregar formulario impreso
   - Verificar documentación in situ

### **Documentación Requerida**

✅ **Obligatorio:**
- Solicitud por escrito (email o formulario)
- Copia de cédula de identidad
- Tipo de derecho solicitado (Acceso/Rectificación/Cancelación/Oposición)

⚠️ **Opcional:**
- Número de teléfono para contacto
- Email alternativo

---

## 📁 Sistema de Numeración

### **Formato de Número de Caso:**

```
ARCO-[AÑO]-[NÚMERO SECUENCIAL]

Ejemplos:
- ARCO-2025-001
- ARCO-2025-002
- ARCO-2025-015
```

### **Registro en Excel**

Mantener archivo: `ARCO_Solicitudes_2025.xlsx`

| # | Número Caso | Fecha Recepción | Cédula (4 últimos) | Tipo Derecho | Estado | Fecha Límite | Fecha Respuesta | Notas |
|---|-------------|-----------------|-------------------|--------------|--------|--------------|-----------------|-------|
| 1 | ARCO-2025-001 | 15/10/2025 | **3846 | Acceso | Respondida | 29/10/2025 | 16/10/2025 | - |
| 2 | ARCO-2025-002 | 18/10/2025 | **7654 | Rectificación | En proceso | 01/11/2025 | - | Espera validación |

**Columnas obligatorias:**
- Número Caso (único)
- Fecha Recepción
- Cédula (solo 4 últimos dígitos - privacidad)
- Tipo Derecho
- Estado (Recibida / En proceso / Respondida / Rechazada)
- Fecha Límite (Recepción + 10 días hábiles)
- Fecha Respuesta

---

## 📂 Organización de Archivos

### **Estructura de Carpetas**

```
ARCO_Solicitudes/
├── 2025/
│   ├── ARCO-2025-001/
│   │   ├── 01_solicitud_original.pdf
│   │   ├── 02_cedula_adjunta.pdf
│   │   ├── 03_reporte_generado.txt
│   │   ├── 04_respuesta_enviada.pdf
│   │   └── metadata.txt
│   ├── ARCO-2025-002/
│   │   └── ...
│   └── ARCO-2025-XXX/
└── templates/
    ├── respuesta_acceso.txt
    ├── respuesta_rectificacion.txt
    └── formulario_presencial.pdf
```

### **Metadata del Caso**

Archivo `metadata.txt` en cada carpeta:

```
NÚMERO CASO: ARCO-2025-001
FECHA RECEPCIÓN: 15/10/2025 10:30 AM
CANAL: Email
SOLICITANTE: Juan Pérez (C.I: ****3846)
TIPO DERECHO: Acceso
ESTADO: Respondida
PLAZO LEGAL: 29/10/2025
FECHA RESPUESTA: 16/10/2025
PROCESADO POR: Mario Berni
NOTAS: Proceso estándar, sin complicaciones
```

---

## 🔄 Flujo de Trabajo

### **PASO 1: Recepción (Día 0)**

1. **Al recibir email/formulario:**
   ```
   ✓ Verificar documentación completa
   ✓ Asignar número: ARCO-2025-XXX
   ✓ Crear carpeta en sistema de archivos
   ✓ Registrar en Excel
   ✓ Calcular fecha límite (Recepción + 10 días hábiles)
   ✓ Enviar acuse de recibo al solicitante
   ```

2. **Template de Acuse de Recibo:**

```
De: datospersonales@ircca.gub.uy
Para: [email del solicitante]
Asunto: Acuse de Recibo - Solicitud ARCO-2025-XXX

Estimado/a [Nombre],

Acusamos recibo de su solicitud de ejercicio del derecho de [ACCESO/RECTIFICACIÓN/...]
conforme a la Ley N° 18.331 de Protección de Datos Personales.

DATOS DE SU SOLICITUD:
- Número de caso: ARCO-2025-XXX
- Fecha de recepción: [Fecha]
- Plazo máximo de respuesta: [Fecha límite]

Procesaremos su solicitud y le responderemos dentro del plazo legal establecido
(10 días hábiles).

Atentamente,
Custodio Técnico - Sistema de Datos Personales IRCCA
```

---

### **PASO 2: Procesamiento (Días 1-8)**

#### **Para DERECHO DE ACCESO:**

1. **Abrir Dashboard Administrador**
2. **Ir a sección "Derechos ARCO - Exportación de Datos"**
3. **Buscar por cédula** (usar autocomplete)
4. **Generar reporte completo**
5. **Exportar en formato TXT** (para email) y **JSON** (respaldo técnico)
6. **Guardar archivos en carpeta del caso**

#### **Para DERECHO DE RECTIFICACIÓN:**

1. **Identificar dato a corregir**
2. **Verificar evidencia presentada** (ej. nueva copia de cédula)
3. **Buscar registro en sistema**
4. **Corregir manualmente** (función de edición en dashboard)
5. **Validar cambio**
6. **Documentar corrección**

⚠️ **Importante:** Registrar en logs de auditoría manualmente si es necesario.

#### **Para DERECHO DE CANCELACIÓN:**

1. **Evaluar si hay obligación legal de conservar**
   - Auditoría en curso → NO se puede eliminar
   - Orden judicial → NO se puede eliminar
   - Registro histórico sin impedimento → SÍ se puede eliminar

2. **Si procede eliminación:**
   - Eliminar registros de persona en sistema
   - Mantener metadata enmascarada (solo ID + fecha) para auditoría
   - Documentar eliminación

3. **Si NO procede:**
   - Explicar motivo legal al solicitante
   - Ofrecer alternativa (ej. enmascaramiento)

---

### **PASO 3: Respuesta (Día 9-10)**

1. **Preparar respuesta formal**
2. **Adjuntar reporte/evidencia**
3. **Enviar por email**
4. **Actualizar Excel:** Estado = "Respondida", Fecha Respuesta
5. **Archivar todo en carpeta del caso**

#### **Template de Respuesta - Derecho de Acceso:**

```
De: datospersonales@ircca.gub.uy
Para: [email del solicitante]
Asunto: Respuesta Solicitud ARCO-2025-XXX

Estimado/a [Nombre],

En respuesta a su solicitud ARCO-2025-XXX del [fecha], adjuntamos reporte
completo con todos los datos personales que el IRCCA almacena sobre usted.

RESUMEN:
- Total de registros: [N]
- Período: [Fecha inicial - Fecha final]
- Formato adjunto: TXT (legible)

Como se indica en el reporte, estos datos se conservan conforme a:
- Finalidad: Control de acceso físico a instalaciones del IRCCA
- Base legal: Ley Orgánica del IRCCA
- Plazo: 12 meses en sistema activo, 5 años en respaldos

EJERCICIO DE OTROS DERECHOS:
Si desea:
• Corregir algún dato (Rectificación)
• Solicitar eliminación (Cancelación)
• Oponerse al tratamiento (Oposición)

Puede solicitarlo respondiendo este correo.

Si no está conforme con esta respuesta, tiene derecho a reclamar ante la
Unidad Reguladora de Control de Datos Personales (URCDP):
Email: datospersonales@agesic.gub.uy

Atentamente,
[Nombre del Custodio Técnico]
Custodio Técnico - Sistema de Datos Personales IRCCA
datospersonales@ircca.gub.uy
```

---

## ⏱️ Control de Plazos

### **Sistema de Recordatorios**

**Método 1: Calendario Outlook/Google**
- Crear evento al asignar caso
- Fecha: Día 7 (3 días antes del límite)
- Alerta: "Procesar ARCO-2025-XXX"

**Método 2: Excel con Formato Condicional**
- Columna "Días Restantes": `=Fecha_Límite - HOY()`
- Formato:
  - Verde: > 5 días
  - Amarillo: 3-5 días
  - Rojo: < 3 días

**Método 3: Revisión Diaria**
- 9:00 AM: Revisar email institucional
- 10:00 AM: Actualizar Excel
- 11:00 AM: Procesar casos pendientes

---

## 📊 Reportes Mensuales

Al final de cada mes, generar reporte:

```
REPORTE MENSUAL ARCO - [MES/AÑO]

ESTADÍSTICAS:
- Solicitudes recibidas: [N]
- Solicitudes respondidas: [N]
- Solicitudes pendientes: [N]
- Promedio días de respuesta: [X.X]

DESGLOSE POR TIPO:
- Acceso: [N] ([%])
- Rectificación: [N] ([%])
- Cancelación: [N] ([%])
- Oposición: [N] ([%])

CUMPLIMIENTO DE PLAZOS:
- Dentro de plazo: [N] ([%])
- Fuera de plazo: [N] ([%])

OBSERVACIONES:
[Comentarios relevantes]
```

---

## 🚨 Casos Especiales

### **Solicitud Rechazada**

Motivos válidos de rechazo:
- Documentación insuficiente (falta cédula)
- Identidad no verificable
- Solicitud duplicada
- Datos solicitados no existen en sistema

**Procedimiento:**
1. Notificar al solicitante
2. Explicar motivo específico
3. Indicar cómo subsanar (si aplica)
4. Registrar como "Rechazada" en Excel

### **Solicitud Urgente**

Si hay orden judicial o situación especial:
1. Marcar como PRIORITARIA en Excel
2. Procesar dentro de 24-48 horas
3. Notificar inmediatamente

### **Solicitud Incompleta**

1. Enviar email solicitando información faltante
2. Estado: "En espera de documentación"
3. Plazo de 10 días se suspende hasta recibir datos
4. Al recibir datos completos, reinicia plazo

---

## ✅ Checklist de Calidad

Antes de enviar respuesta, verificar:

- [ ] Número de caso correcto
- [ ] Reporte generado contiene todos los registros
- [ ] Información legal incluida
- [ ] Cédula del solicitante verificada
- [ ] Email de respuesta profesional y claro
- [ ] Archivos guardados en carpeta del caso
- [ ] Excel actualizado
- [ ] Plazo cumplido (< 10 días hábiles)
- [ ] Acción registrada en logs de auditoría (si exportó datos)

---

## 🔄 Transición a Fase 2 (Futuro)

Cuando se implemente el sistema automatizado:

1. **Migrar casos activos** al nuevo sistema
2. **Mantener archivos históricos** en estructura actual
3. **Actualizar procedimiento** para usar workflow automatizado
4. **Capacitación** en nueva interfaz

**Criterio para implementar Fase 2:**
- ✅ > 5 solicitudes/mes durante 3 meses consecutivos
- ✅ Errores en proceso manual > 1/mes
- ✅ Tiempo promedio de respuesta > 2 horas

---

## 📞 Contactos de Escalamiento

**Dudas legales sobre datos personales:**
- URCDP: datospersonales@agesic.gub.uy
- Tel: [Número URCDP]

**Emergencias técnicas:**
- Custodio Técnico: [email]
- Backup: [email alternativo]

---

## 📝 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 19-Oct-2025 | Versión inicial - Procedimiento temporal |

---

**Vigencia:** Hasta implementación de Fase 2 (Sistema automatizado)  
**Próxima revisión:** Cada 3 meses o al alcanzar 15 solicitudes procesadas
