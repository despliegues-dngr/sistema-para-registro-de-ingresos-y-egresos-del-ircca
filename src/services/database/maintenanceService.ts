/**
 * Maintenance Service - Gestión de mantenimiento de la base de datos
 * Responsable de limpieza de datos antiguos y optimización
 */

import type { RegistroEntry } from '@/stores/registro'

/**
 * ✅ LIMPIAR DATOS ANTIGUOS
 */
export async function cleanOldData(
  registros: RegistroEntry[],
  daysToKeep: number = 365
): Promise<{ success: boolean; cleaned: number }> {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const oldRegistros = registros.filter((r) => new Date(r.timestamp) < cutoffDate)

    // TODO v1.1: Implementar eliminación selectiva por ID
    // Pendiente: Validar política de retención con IRCCA/AGESIC
    // Por ahora solo cuenta (útil para reportes de mantenimiento)
    // Implementar cuando: (1) Se valide período de retención correcto
    //                     (2) Se defina si requiere aprobación manual
    //                     (3) Se agregue UI de confirmación en panel admin

    return { success: true, cleaned: oldRegistros.length }
  } catch {
    return { success: false, cleaned: 0 }
  }
}

/**
 * Calcula estadísticas de uso de la base de datos
 */
export function calculateDatabaseStats(registros: RegistroEntry[]): {
  total: number
  ingresos: number
  salidas: number
  oldestRecord: Date | null
  newestRecord: Date | null
} {
  const ingresos = registros.filter(r => r.tipo === 'ingreso').length
  const salidas = registros.filter(r => r.tipo === 'salida').length
  
  const timestamps = registros.map(r => new Date(r.timestamp).getTime())
  const oldestRecord = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null
  const newestRecord = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null

  return {
    total: registros.length,
    ingresos,
    salidas,
    oldestRecord,
    newestRecord
  }
}
