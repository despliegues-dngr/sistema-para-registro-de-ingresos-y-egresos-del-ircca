# 🔐 Sistema ARCO - Guía Rápida

**Sistema de Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)**  
**Cumplimiento:** Ley 18.331 de Protección de Datos Personales

---

## 📌 Acceso Rápido

- **Documentación completa:** `05-arco-rights-procedure.md`
- **Estado de implementación:** `08-arco-implementation.md`
- **Usar sistema:** Dashboard Admin → Sección "Derechos ARCO"

---

## ✅ ¿Qué está implementado?

### **Derecho de Acceso** (50% completo)

Un ciudadano puede solicitar conocer qué datos tiene el sistema. El administrador puede:

1. **Buscar datos por cédula** en el dashboard
2. **Ver resumen completo:**
   - Registros de ingreso/egreso
   - Datos en personas conocidas
   - Información legal (finalidad, plazo, etc.)
3. **Exportar en 3 formatos:**
   - **TXT** → Para responder por email
   - **CSV** → Para análisis en Excel
   - **JSON** → Formato técnico completo

**Ubicación:** Dashboard Admin → Card "Derechos ARCO - Exportación de Datos"

---

## 🎯 Cómo Usar (Administrador)

### **Paso 1: Acceder al sistema**
1. Iniciar sesión como **Administrador**
2. Ir al **Dashboard Principal**
3. Scroll hacia abajo hasta **"Derechos ARCO - Exportación de Datos"**

### **Paso 2: Buscar datos del ciudadano**
1. Ingresar **cédula** del solicitante (8 dígitos)
2. Clic en **"Buscar Datos"**
3. El sistema mostrará:
   - ✅ Total de registros encontrados
   - ✅ Nombre completo
   - ✅ Cantidad de ingresos/salidas
   - ✅ Si está en personas conocidas

### **Paso 3: Exportar reporte**
Elegir formato según necesidad:

- **Texto (.txt)** → Copiar/pegar en email de respuesta
- **Excel (.csv)** → Abrir en Excel para análisis
- **JSON (.json)** → Respaldo técnico completo

### **Paso 4: Responder al ciudadano**
1. Usar template de respuesta en `05-arco-rights-procedure.md`
2. Adjuntar archivo exportado
3. Enviar a: email del solicitante
4. Plazo legal: **10 días hábiles**

---

## 📋 Procedimiento Completo

### **Cuando llega una solicitud ARCO:**

#### **Por Email (datospersonales@ircca.gub.uy)**
1. Verificar identidad (copia de cédula adjunta)
2. Asignar número: ARCO-2025-XXX
3. Buscar datos en el sistema (usar esta herramienta)
4. Generar respuesta oficial
5. Enviar en plazo (10 días hábiles)

#### **Presencial (Recepción IRCCA)**
1. Entregar formulario al ciudadano
2. Verificar documentación completa
3. Entregar comprobante con número de solicitud
4. Procesar igual que solicitud por email

**Ver procedimiento detallado:** `05-arco-rights-procedure.md`

---

## 🚨 Recordatorios Legales

### **Plazos Obligatorios:**
- ⏰ Respuesta inicial: **10 días hábiles**
- ⏰ Resolución definitiva: **+5 días hábiles**
- ⚠️ Reclamo a URCDP si no se cumple

### **Qué NO incluir en logs:**
- ❌ Cédulas completas
- ❌ Nombres reales
- ❌ Destinos específicos
- ✅ Solo IDs técnicos y metadata

### **Contactos de Emergencia:**
- **URCDP:** datospersonales@agesic.gub.uy
- **CERTuy:** incidentes@cert.uy
- **Custodio Técnico:** [email del custodio]

---

## 🔜 Próximas Funcionalidades

### **En desarrollo:**
- ⏳ Registro de solicitudes con tracking
- ⏳ Panel completo de gestión ARCO
- ⏳ Workflow para Rectificación
- ⏳ Workflow para Cancelación
- ⏳ Templates de respuesta automáticos

**Ver roadmap completo:** `08-arco-implementation.md`

---

## 📞 Contacto y Soporte

**Responsable ARCO:** Custodio Técnico del Sistema  
**Email:** datospersonales@ircca.gub.uy  
**Documentación técnica:** `docs/03-security/`

---

## 🔗 Enlaces Rápidos

| Documento | Propósito |
|-----------|-----------|
| `00-SECURITY-INDEX.md` | Índice maestro de seguridad |
| `05-arco-rights-procedure.md` | Procedimiento completo (629 líneas) |
| `08-arco-implementation.md` | Estado técnico de implementación |

---

**Última actualización:** 19-Oct-2025  
**Versión:** 1.0
