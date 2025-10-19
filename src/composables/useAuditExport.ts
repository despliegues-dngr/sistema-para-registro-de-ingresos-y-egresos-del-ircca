import type { AuditEvent } from '@/stores/audit'
import { useAuditFilters } from './useAuditFilters'

/**
 * Composable para exportación de datos de auditoría
 * Maneja exportación a CSV y PDF con datos enmascarados
 */
export function useAuditExport() {
  const {
    maskCedula,
    getTipoEventoTexto,
    getEventoTexto,
    getRoleName,
    formatTimestamp
  } = useAuditFilters()

  /**
   * Exporta eventos de auditoría a CSV con datos enmascarados
   */
  function exportarCSV(eventos: AuditEvent[], filename: string = 'auditoria'): void {
    if (!eventos || eventos.length === 0) {
      alert('No hay eventos para exportar')
      return
    }

    // Headers del CSV
    const headers = [
      'ID Evento',
      'Fecha/Hora',
      'Usuario (Enmascarado)',
      'Rol',
      'Tipo de Evento',
      'Acción',
      'Session ID'
    ]

    // Convertir eventos a filas CSV
    const rows = eventos.map(evento => {
      return [
        evento.id,
        formatTimestamp(evento.timestamp),
        maskCedula(evento.username),
        getRoleName(evento.details.role as string),
        getTipoEventoTexto(evento.eventType),
        getEventoTexto(evento.action),
        evento.sessionId
      ]
    })

    // Construir CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Agregar BOM para UTF-8
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Descargar archivo
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Exporta un único evento a JSON (con advertencia de trazabilidad)
   */
  function exportarEventoJSON(evento: AuditEvent): void {
    const jsonString = JSON.stringify(evento, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `evento_${evento.id}_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // TODO: Registrar en auditoría que se exportó este evento
  }

  return {
    exportarCSV,
    exportarEventoJSON
  }
}
