import { useDatabase } from '@/composables/useDatabase'
import type { DatosVehiculo } from '@/stores/registro'

/**
 * Interfaz para persona conocida (datos mínimos para autocompletado)
 * ✅ Datos NO cifrados para búsqueda rápida
 * ✅ Compliance Ley 18.331: Solo datos operativos necesarios
 */
export interface PersonaConocida extends Record<string, unknown> {
  cedula: string // Clave primaria (en claro para búsqueda)
  cedulaHash: string // SHA-256 hash (para validación adicional)
  nombre: string
  apellido: string
  ultimoDestino: string
  ultimoVehiculo?: DatosVehiculo
  ultimaVisita: Date
  totalVisitas: number
  frecuencia: 'alta' | 'media' | 'baja' // Basado en totalVisitas
}

/**
 * Servicio de Autocompletado con Historial
 * Maneja el store 'personasConocidas' para búsquedas rápidas sin descifrado
 */
export class AutocompleteService {
  private db = useDatabase()

  /**
   * Genera SHA-256 hash de una cédula (para validación)
   */
  private async generateHash(cedula: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(cedula)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Calcula frecuencia de visita según total
   */
  private calcularFrecuencia(totalVisitas: number): 'alta' | 'media' | 'baja' {
    if (totalVisitas >= 10) return 'alta'
    if (totalVisitas >= 4) return 'media'
    return 'baja'
  }

  /**
   * Actualiza o crea persona conocida después de un registro exitoso
   */
  async actualizarPersonaConocida(datos: {
    cedula: string
    nombre: string
    apellido: string
    destino: string
    vehiculo?: DatosVehiculo
  }): Promise<void> {
    try {
      await this.db.initDatabase()
      
      const cedulaHash = await this.generateHash(datos.cedula)
      
      // Buscar si ya existe
      const registros = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      const existente = registros.find(p => p.cedula === datos.cedula)

      let personaConocida: PersonaConocida

      if (existente) {
        // Actualizar persona existente
        personaConocida = {
          ...existente,
          nombre: datos.nombre,
          apellido: datos.apellido,
          ultimoDestino: datos.destino,
          ultimoVehiculo: datos.vehiculo,
          ultimaVisita: new Date(),
          totalVisitas: existente.totalVisitas + 1,
          frecuencia: this.calcularFrecuencia(existente.totalVisitas + 1)
        }

        // Actualizar en DB
        await this.db.updateRecord('personasConocidas', datos.cedula, personaConocida)
        console.log(`✅ Persona conocida actualizada: ${datos.nombre} ${datos.apellido} (Visita #${personaConocida.totalVisitas})`)
      } else {
        // Crear nueva persona conocida
        personaConocida = {
          cedula: datos.cedula,
          cedulaHash,
          nombre: datos.nombre,
          apellido: datos.apellido,
          ultimoDestino: datos.destino,
          ultimoVehiculo: datos.vehiculo,
          ultimaVisita: new Date(),
          totalVisitas: 1,
          frecuencia: 'baja'
        }

        // Agregar a DB
        await this.db.addRecord('personasConocidas', personaConocida)
        console.log(`✅ Nueva persona conocida registrada: ${datos.nombre} ${datos.apellido}`)
      }
    } catch (error) {
      console.error('❌ Error actualizando persona conocida:', error)
      // No lanzar error para no bloquear el registro principal
    }
  }

  /**
   * Busca personas conocidas por cédula parcial (autocompletado en tiempo real)
   * ✅ Busca desde el PRIMER carácter
   */
  async buscarPorCedulaParcial(cedulaParcial: string): Promise<PersonaConocida[]> {
    try {
      if (!cedulaParcial || cedulaParcial.length < 1) {
        return []
      }

      await this.db.initDatabase()
      const personas = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      
      // Filtrar por cédula que empiece con el valor parcial
      const resultados = personas
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

      console.log(`🔍 Búsqueda "${cedulaParcial}": ${resultados.length} resultados`)
      return resultados
    } catch (error) {
      console.error('❌ Error buscando personas conocidas:', error)
      return []
    }
  }

  /**
   * Obtiene persona conocida por cédula exacta
   */
  async obtenerPorCedula(cedula: string): Promise<PersonaConocida | null> {
    try {
      await this.db.initDatabase()
      const personas = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      return personas.find(p => p.cedula === cedula) || null
    } catch (error) {
      console.error('❌ Error obteniendo persona conocida:', error)
      return null
    }
  }

  /**
   * Busca vehículos conocidos por matrícula parcial
   */
  async buscarPorMatriculaParcial(matriculaParcial: string): Promise<PersonaConocida[]> {
    try {
      if (!matriculaParcial || matriculaParcial.length < 2) {
        return []
      }

      await this.db.initDatabase()
      const personas = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      
      const matriculaNormalizada = matriculaParcial.toUpperCase()
      
      const resultados = personas
        .filter(p => p.ultimoVehiculo?.matricula?.toUpperCase().startsWith(matriculaNormalizada))
        .sort((a, b) => new Date(b.ultimaVisita).getTime() - new Date(a.ultimaVisita).getTime())
        .slice(0, 5)

      console.log(`🚗 Búsqueda matrícula "${matriculaParcial}": ${resultados.length} resultados`)
      return resultados
    } catch (error) {
      console.error('❌ Error buscando por matrícula:', error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de personas conocidas
   */
  async obtenerEstadisticas(): Promise<{
    total: number
    frecuentesAlta: number
    frecuentesMedia: number
    visitasEsteAno: number
  }> {
    try {
      await this.db.initDatabase()
      const personas = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      
      const anoActual = new Date().getFullYear()
      
      return {
        total: personas.length,
        frecuentesAlta: personas.filter(p => p.frecuencia === 'alta').length,
        frecuentesMedia: personas.filter(p => p.frecuencia === 'media').length,
        visitasEsteAno: personas.filter(p => 
          new Date(p.ultimaVisita).getFullYear() === anoActual
        ).length
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error)
      return { total: 0, frecuentesAlta: 0, frecuentesMedia: 0, visitasEsteAno: 0 }
    }
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
    console.log('🔄 [AUTOCOMPLETE] Iniciando sincronización desde registros existentes...')
    
    let sincronizados = 0
    let errores = 0

    try {
      await this.db.initDatabase()

      // ✅ VERIFICAR si el store existe (puede no existir si la BD es vieja)
      let personasExistentes: PersonaConocida[] = []
      
      try {
        personasExistentes = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      } catch {
        console.warn('⚠️ [AUTOCOMPLETE] Store "personasConocidas" no existe. Por favor, borre la base de datos y recargue.')
        console.warn('⚠️ [AUTOCOMPLETE] Ejecute en consola: indexedDB.deleteDatabase("IRCCA_Sistema_DB") y luego F5')
        return { sincronizados: 0, errores: 0 }
      }
      
      if (personasExistentes.length > 0) {
        console.log(`ℹ️ [AUTOCOMPLETE] Ya existen ${personasExistentes.length} personas conocidas. Saltando sincronización inicial.`)
        return { sincronizados: 0, errores: 0 }
      }

      // Procesar solo registros de ingreso
      const registrosIngreso = registrosDescifrados.filter(r => r.tipo === 'ingreso')
      console.log(`🔍 [AUTOCOMPLETE] Procesando ${registrosIngreso.length} registros de ingreso...`)

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
        } catch (error) {
          console.error('❌ [AUTOCOMPLETE] Error procesando registro:', error)
          errores++
        }
      }

      console.log(`✅ [AUTOCOMPLETE] Sincronización completada: ${sincronizados} personas, ${errores} errores`)
      return { sincronizados, errores }
      
    } catch (error) {
      console.error('❌ [AUTOCOMPLETE] Error en sincronización:', error)
      return { sincronizados, errores }
    }
  }
}

// Instancia singleton
export const autocompleteService = new AutocompleteService()
