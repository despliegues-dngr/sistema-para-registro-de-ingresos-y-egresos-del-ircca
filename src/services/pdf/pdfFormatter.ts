/**
 * PDF Formatter - Módulo de formateo de datos para PDFs
 * Responsable de formatear fechas, horas, valores vacíos y observaciones
 */

/**
 * Formatea fecha en formato DD/MM/YYYY
 * ✅ FIX: Usa getters locales para evitar problemas de timezone
 */
export function formatDate(date: Date): string {
  // ✅ Usar getters locales (no UTC) para evitar desfase
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Formatea fecha para período en formato DD-MM-YYYY (más profesional)
 */
export function formatDateForPeriod(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}

/**
 * Formatea hora en formato HH:MM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Formatea valores vacíos con guion medio centrado
 * @param value Valor a formatear
 * @param isObservaciones Si es campo de observaciones (no se formatea)
 */
export function formatValue(value: string, isObservaciones = false): string {
  if (isObservaciones) {
    return value // Observaciones se mantienen vacías si no hay valor
  }
  return value && value.trim() ? value : '-'
}

/**
 * Formatea observaciones de ingreso y salida en una sola celda
 * @param observacionesIngreso Observaciones del registro de ingreso
 * @param observacionesSalida Observaciones del registro de salida
 * @returns String formateado con ambas observaciones o vacío
 */
export function formatObservaciones(
  observacionesIngreso?: string,
  observacionesSalida?: string
): string {
  const partes: string[] = []

  if (observacionesIngreso && observacionesIngreso.trim()) {
    partes.push(`Ingreso: ${observacionesIngreso.trim()}`)
  }

  if (observacionesSalida && observacionesSalida.trim()) {
    partes.push(`Salida: ${observacionesSalida.trim()}`)
  }

  return partes.join('\n')
}

/**
 * Genera nombre de archivo descriptivo basado en el período de datos
 * @param dateRange Rango de fechas del reporte (ej: "01-10-2025" o "01-10-2025 al 05-10-2025")
 * @returns Nombre de archivo formateado
 */
export function generateFilename(dateRange: string): string {
  // Sanitizar el dateRange para usar en nombre de archivo
  // Reemplazar espacios y caracteres especiales por guiones bajos
  const periodoSanitizado = dateRange
    .replace(/ al /g, '_al_')
    .replace(/\s+/g, '_')
    .replace(/[/\\:*?"<>|]/g, '-')

  return `Registros_de_accesos_del_IRCCA_${periodoSanitizado}.pdf`
}
