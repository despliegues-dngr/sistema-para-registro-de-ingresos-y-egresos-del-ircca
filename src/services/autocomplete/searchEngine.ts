/**
 * Search Engine - Motor de búsqueda para autocompletado
 * Responsable de filtrar y ordenar resultados de búsqueda
 */

import type { PersonaConocida } from './types'
import { cacheManager } from './cacheManager'

/**
 * Calcula frecuencia de visita según total
 */
export function calcularFrecuencia(totalVisitas: number): 'alta' | 'media' | 'baja' {
  if (totalVisitas >= 10) return 'alta'
  if (totalVisitas >= 4) return 'media'
  return 'baja'
}

/**
 * Busca personas conocidas por cédula parcial (autocompletado en tiempo real)
 * ✅ OPTIMIZADO: Usa cache en memoria (muy rápido)
 */
export async function buscarPorCedulaParcial(cedulaParcial: string): Promise<PersonaConocida[]> {
  try {
    if (!cedulaParcial || cedulaParcial.length < 1) {
      return []
    }

    // Cargar cache si no está cargado (solo primera vez)
    await cacheManager.cargarCache()

    // Filtrar del cache (muy rápido)
    const resultados = cacheManager.getPersonas()
      .filter(p => p.cedula.startsWith(cedulaParcial))
      .sort((a, b) => {
        // Ordenar por: 1) frecuencia, 2) última visita
        if (a.frecuencia !== b.frecuencia) {
          const frecuenciaOrder = { alta: 3, media: 2, baja: 1 }
          return frecuenciaOrder[b.frecuencia] - frecuenciaOrder[a.frecuencia]
        }
        return new Date(b.ultimaVisita).getTime() - new Date(a.ultimaVisita).getTime()
      })
      .slice(0, 5) // Máximo 5 resultados

    return resultados
  } catch (error) {
    console.error('Error buscando por documento:', error)
    return []
  }
}

/**
 * Busca vehículos conocidos por matrícula parcial
 * ✅ OPTIMIZADO: Usa cache en memoria
 */
export async function buscarPorMatriculaParcial(matriculaParcial: string): Promise<PersonaConocida[]> {
  try {
    if (!matriculaParcial || matriculaParcial.length < 2) {
      return []
    }

    // Cargar cache si no está cargado (solo primera vez)
    await cacheManager.cargarCache()

    const matriculaNormalizada = matriculaParcial.toUpperCase()

    // Filtrar del cache
    const resultados = cacheManager.getPersonas()
      .filter(p => p.ultimoVehiculo?.matricula?.toUpperCase().startsWith(matriculaNormalizada))
      .sort((a, b) => new Date(b.ultimaVisita).getTime() - new Date(a.ultimaVisita).getTime())
      .slice(0, 5)

    return resultados
  } catch (error) {
    console.error('Error buscando por matrícula:', error)
    return []
  }
}
