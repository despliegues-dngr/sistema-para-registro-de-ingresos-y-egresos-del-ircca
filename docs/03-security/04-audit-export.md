# Exportación de Registros de Auditoría

## 📋 Descripción General

Sistema de exportación de registros de auditoría con **protección de datos personales** según Ley 18.331 de Uruguay. Permite exportar eventos de auditoría en formato CSV con datos enmascarados, y eventos individuales en formato JSON.

---

## 🎯 Características

### ✅ Protección de Datos
- **Enmascaramiento automático** de datos personales en exportaciones
- Cédulas mostradas como `****6350` (solo últimos 4 dígitos)
- Nombres mostrados como iniciales `M. B.`
- **Trazabilidad** de accesos a datos completos

### 📄 Formatos de Exportación

#### 1. CSV (Comma-Separated Values)

- ✅ Compatible con Excel, Google Sheets, LibreOffice
- ✅ Codificación UTF-8 con BOM
- ✅ Datos enmascarados por defecto
- ✅ Estructura tabular limpia

#### 2. JSON (Individual)

- ✅ Exportación de evento individual
- ⚠️ Contiene datos SIN enmascarar
- ✅ Advertencia de trazabilidad
- ✅ Timestamp en nombre de archivo

---

## 🚀 Uso

### Exportación Completa (Tabla de Auditoría)

```typescript
// En AdminContent.vue o AuditTableSection.vue

// Exportar todos los eventos filtrados a CSV
function exportarCSV() {
  const { exportarCSV } = useAuditExport()
  exportarCSV(eventosFiltrados.value, 'registro-auditoria-ircca')
}
```

**Ubicación en UI:**

- Panel de Auditoría → Botón "Exportar CSV" en header
- El botón está siempre visible en la parte superior derecha

### Exportación Individual (Detalle de Evento)

```typescript
// En EventDetailDialog.vue

function exportarEvento() {
  const { exportarEventoJSON } = useAuditExport()
  exportarEventoJSON(evento.value)
}
```

**Ubicación en UI:**

- Modal de Detalle de Evento → Botón "Exportar Evento"
- Genera archivo JSON con datos completos del evento

---

## 📊 Estructura de Datos Exportados

### CSV - Columnas
```
ID Evento, Fecha/Hora, Usuario (Enmascarado), Rol, Tipo de Evento, Acción, Session ID
```

**Ejemplo de fila:**

```csv
"983d0a22-...","19/10/2025, 01:09:49 a. m.","****6350","Administrador","Autenticación","Login Exitoso","98046ff8-..."
```

### JSON - Estructura Completa

```json
{
  "id": "983d0a22-9312-446e-b9b6-929677f05b91",
  "userId": "8W5v5E19EMg0kGk5g-NahA",
  "username": "55226350",
  "eventType": "auth",
  "action": "login.success",
  "details": {
    "role": "admin",
    "nombre": "Mario Berni",
    "previousLogin": "2025-10-13T13:45:45.164Z"
  },
  "timestamp": "2025-10-19T04:09:49.837Z",
  "sessionId": "98046ff8-a65e-45aa-9683-41201b5ba7cf"
}
```

---

## 🔧 Implementación Técnica

### Composable: `useAuditExport.ts`

```typescript
export function useAuditExport() {
  const {
    maskCedula,
    getTipoEventoTexto,
    getEventoTexto,
    getRoleName,
    formatTimestamp
  } = useAuditFilters()

  // Funciones de exportación
  return {
    exportarCSV,
    exportarEventoJSON
  }
}
```

### Dependencias

No se requieren dependencias externas para la exportación CSV. La funcionalidad utiliza APIs nativas del navegador.

---

## 📝 Nombres de Archivos Generados

### Formato Automático

```text
[nombre-base]_[YYYY-MM-DD].[extension]
```

**Ejemplos:**

- `registro-auditoria-ircca_2025-10-19.csv`
- `evento_983d0a22-9312-446e-b9b6-929677f05b91_2025-10-19.json`

---

## ⚖️ Cumplimiento Legal

### Ley 18.331 - Protección de Datos Personales (Uruguay)

#### ✅ Artículos Cumplidos

**Art. 11 - Datos Sensibles:**

- Cédulas y nombres enmascarados en exportaciones CSV
- Acceso a datos completos solo mediante acción explícita (JSON)

**Art. 15 - Seguridad:**

- Implementación de data masking
- Trazabilidad de exportaciones

**Art. 17 - Derecho de Acceso:**

- Administradores pueden acceder a datos completos
- Advertencias claras sobre uso responsable

**Principio de Minimización:**

- Solo se exportan datos necesarios para auditoría
- Datos enmascarados por defecto en CSV

---

## 🔍 Trazabilidad

### Eventos de Exportación (Implementación Futura)

Cada exportación debe generar un evento de auditoría:

```typescript
{
  eventType: 'data_operation',
  action: 'export.audit_log',
  details: {
    format: 'csv' | 'json',
    recordCount: 150,
    masked: true,
    filename: 'registro-auditoria-ircca_2025-10-19.csv'
  }
}
```

---

## 🧪 Testing

### Escenarios de Prueba

1. **Exportación CSV vacía:**
   - Filtrar eventos sin resultados → Mostrar alerta "No hay eventos"

2. **Exportación CSV con datos:**
   - Verificar UTF-8 BOM
   - Verificar datos enmascarados
   - Abrir en Excel → Caracteres especiales correctos

3. **Exportación JSON individual:**
   - Verificar datos completos sin enmascarar
   - Verificar advertencia de trazabilidad

---

## 🚨 Advertencias

### ⚠️ Exportación JSON

- Contiene datos personales **SIN ENMASCARAR**
- Usar solo cuando sea estrictamente necesario
- El acceso queda registrado en consola (TODO: registrar en auditoría)

---

## 🔮 Mejoras Futuras

- [ ] Registrar exportaciones en sistema de auditoría
- [ ] Agregar filtros específicos antes de exportar
- [ ] Exportación programada (backups automáticos)
- [ ] Compresión ZIP para exportaciones grandes
- [ ] Exportación incremental (solo nuevos eventos)
- [ ] Exportación a Excel (XLSX) con formato avanzado

---

## 📚 Referencias

- [Ley 18.331 - Uruguay](https://www.gub.uy/unidad-reguladora-control-datos-personales/normativa/ley-18331-proteccion-datos-personales)
- [RFC 4180 - CSV Format](https://tools.ietf.org/html/rfc4180)
- [Web APIs - Blob](https://developer.mozilla.org/es/docs/Web/API/Blob)

---

**Última actualización:** 19 de octubre, 2025  
**Versión:** 1.0.0  
**Autor:** Sistema IRCCA - Equipo de Desarrollo
