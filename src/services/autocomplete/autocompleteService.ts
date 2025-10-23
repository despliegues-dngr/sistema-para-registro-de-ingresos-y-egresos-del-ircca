/**
 * Autocomplete Service - Servicio principal de autocompletado
 * Orquestador de búsqueda, caché y gestión de personas conocidas
 * 
 * ✅ REFACTORIZADO: Módulos especializados para búsqueda, caché y gestión
 */

import type { PersonaConocida, ActualizarPersonaData, EstadisticasPersonas } from './types'
import { buscarPorCedulaParcial, buscarPorMatriculaParcial } from './searchEngine'
import { personaManager } from './personaManager'

export class AutocompleteService {
  /**
   * Busca personas conocidas por cédula parcial (autocompletado en tiempo real)
   * ✅ OPTIMIZADO: Usa cache en memoria (muy rápido)
   * ✅ SEGURO: Datos personales nunca expuestos sin cifrar en IndexedDB
   */
  async buscarPorCedulaParcial(cedulaParcial: string): Promise<PersonaConocida[]> {
    return buscarPorCedulaParcial(cedulaParcial)
  }

  /**
   * Busca vehículos conocidos por matrícula parcial
   * ✅ OPTIMIZADO: Usa cache en memoria
   */
  async buscarPorMatriculaParcial(matriculaParcial: string): Promise<PersonaConocida[]> {
    return buscarPorMatriculaParcial(matriculaParcial)
  }

  /**
   * Actualiza o crea persona conocida después de un registro exitoso
   */
  async actualizarPersonaConocida(datos: ActualizarPersonaData): Promise<void> {
    return personaManager.actualizarPersonaConocida(datos)
  }

  /**
   * Obtiene persona conocida por cédula exacta
   */
  async obtenerPorCedula(cedula: string): Promise<PersonaConocida | null> {
    return personaManager.obtenerPorCedula(cedula)
  }

  /**
   * Obtiene estadísticas de personas conocidas
   */
  async obtenerEstadisticas(): Promise<EstadisticasPersonas> {
    return personaManager.obtenerEstadisticas()
  }

  /**
   * ✅ MIGRACIÓN: Sincroniza registros existentes con personasConocidas
   * Debe ejecutarse una vez al iniciar el sistema si personasConocidas está vacío
   */
  async sincronizarDesdeRegistros(registrosDescifrados: Array<{
    tipo: string
    datosPersonales?: { cedula: string; nombre: string; apellido: string }
    datosVisita?: { destino: string }
    datosVehiculo?: { tipo: string; matricula: string }
    acompanantes?: Array<{ cedula: string; nombre: string; apellido: string; destino: string }>
    timestamp: Date
  }>): Promise<{ sincronizados: number; errores: number }> {
    let sincronizados = 0
    let errores = 0

    try {
      // Verificar si ya hay personas conocidas
      const stats = await this.obtenerEstadisticas()
      if (stats.total > 0) {
        return { sincronizados: 0, errores: 0 }
      }

      // Procesar solo registros de ingreso
      const registrosIngreso = registrosDescifrados.filter(r => r.tipo === 'ingreso')

      for (const registro of registrosIngreso) {
        try {
          // Sincronizar titular
          if (registro.datosPersonales && registro.datosVisita) {
            await this.actualizarPersonaConocida({
              cedula: registro.datosPersonales.cedula,
              nombre: registro.datosPersonales.nombre,
              apellido: registro.datosPersonales.apellido,
              destino: registro.datosVisita.destino,
              vehiculo: registro.datosVehiculo
            })
            sincronizados++
          }

          // Sincronizar acompañantes
          if (registro.acompanantes && registro.acompanantes.length > 0) {
            for (const acomp of registro.acompanantes) {
              await this.actualizarPersonaConocida({
                cedula: acomp.cedula,
                nombre: acomp.nombre,
                apellido: acomp.apellido,
                destino: acomp.destino
              })
              sincronizados++
            }
          }
        } catch {
          errores++
        }
      }

      return { sincronizados, errores }
      
    } catch {
      return { sincronizados, errores }
    }
  }
}

// Instancia singleton
export const autocompleteService = new AutocompleteService()
