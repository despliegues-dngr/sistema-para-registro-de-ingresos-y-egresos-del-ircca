/**
 * Persona Manager - Gestión de personas conocidas
 * Responsable de CRUD de personas conocidas en IndexedDB
 */

import { useDatabase } from '@/composables/useDatabase'
import type {
  PersonaConocida,
  PersonaConocidaCifrada,
  ActualizarPersonaData,
  DatosPersonalesDescifrados,
  VisitaInfoDescifrada,
  EstadisticasPersonas
} from './types'
import {
  generateCedulaHash,
  cifrarPersonaConocida,
  descifrarPersonaConocida
} from './encryptionHelper'
import { calcularFrecuencia } from './searchEngine'
import { cacheManager } from './cacheManager'

export class PersonaManager {
  private _db: ReturnType<typeof useDatabase> | null = null

  /**
   * Getter lazy para db
   */
  private get db(): ReturnType<typeof useDatabase> {
    if (!this._db) {
      this._db = useDatabase()
    }
    return this._db
  }

  /**
   * Actualiza o crea persona conocida después de un registro exitoso
   * ✅ NUEVO: Cifra todos los datos antes de guardar en IndexedDB
   */
  async actualizarPersonaConocida(datos: ActualizarPersonaData): Promise<void> {
    try {
      await this.db.initDatabase()
      
      const cedulaHash = await generateCedulaHash(datos.cedula)
      
      // Buscar si ya existe (por hash)
      const registrosCifrados = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]
      const existenteCifrada = registrosCifrados.find(p => p.cedulaHash === cedulaHash)

      let personaCifrada: PersonaConocidaCifrada

      if (existenteCifrada) {
        // Descifrar para actualizar
        const existenteDescifrada = await descifrarPersonaConocida(existenteCifrada)
        
        // Preparar datos actualizados
        const datosPersonales: DatosPersonalesDescifrados = {
          cedula: datos.cedula,
          nombre: datos.nombre,
          apellido: datos.apellido
        }

        const visitaInfo: VisitaInfoDescifrada = {
          ultimoDestino: datos.destino,
          ultimoVehiculo: datos.vehiculo
        }

        // Cifrar datos actualizados
        const datosCifrados = await cifrarPersonaConocida(datosPersonales, visitaInfo)

        personaCifrada = {
          id: existenteCifrada.id,
          cedulaHash,
          datosPersonales: datosCifrados.datosPersonales,
          visitaInfo: datosCifrados.visitaInfo,
          ultimaVisita: new Date(),
          totalVisitas: existenteDescifrada.totalVisitas + 1,
          frecuencia: calcularFrecuencia(existenteDescifrada.totalVisitas + 1),
          esAcompanante: datos.esAcompanante ?? false
        }

        // Actualizar en DB
        await this.db.updateRecord('personasConocidas', existenteCifrada.id, personaCifrada)
        
        // ✅ INVALIDAR CACHE: Para reflejar cambios
        cacheManager.invalidarCache()
      } else {
        // Crear nueva persona conocida cifrada
        const datosPersonales: DatosPersonalesDescifrados = {
          cedula: datos.cedula,
          nombre: datos.nombre,
          apellido: datos.apellido
        }

        const visitaInfo: VisitaInfoDescifrada = {
          ultimoDestino: datos.destino,
          ultimoVehiculo: datos.vehiculo
        }

        // Cifrar todos los datos
        const datosCifrados = await cifrarPersonaConocida(datosPersonales, visitaInfo)

        personaCifrada = {
          id: crypto.randomUUID(),
          cedulaHash,
          datosPersonales: datosCifrados.datosPersonales,
          visitaInfo: datosCifrados.visitaInfo,
          ultimaVisita: new Date(),
          totalVisitas: 1,
          frecuencia: 'baja',
          esAcompanante: datos.esAcompanante ?? false
        }

        // Agregar a DB
        await this.db.addRecord('personasConocidas', personaCifrada)
        
        // ✅ INVALIDAR CACHE: Para incluir nueva persona
        cacheManager.invalidarCache()
      }
    } catch (error) {
      console.error('Error actualizando persona conocida:', error)
      // No lanzar error para no bloquear el registro principal
    }
  }

  /**
   * Obtiene persona conocida por cédula exacta
   * ✅ NUEVO: Busca por hash + descifra solo el resultado encontrado
   */
  async obtenerPorCedula(cedula: string): Promise<PersonaConocida | null> {
    try {
      await this.db.initDatabase()
      
      const cedulaHash = await generateCedulaHash(cedula)
      const personasCifradas = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]
      
      const personaCifrada = personasCifradas.find(p => p.cedulaHash === cedulaHash)
      
      if (!personaCifrada) {
        return null
      }

      // Descifrar solo si se encontró
      const personaDescifrada = await descifrarPersonaConocida(personaCifrada)
      
      // Verificación adicional: asegurar que la cédula coincida exactamente
      if (personaDescifrada.cedula === cedula) {
        return personaDescifrada
      }
      
      return null
    } catch (error) {
      console.error('Error obteniendo persona por cédula:', error)
      return null
    }
  }

  /**
   * Obtiene estadísticas de personas conocidas
   * ✅ NO necesita descifrar: usa solo metadata no sensible
   */
  async obtenerEstadisticas(): Promise<EstadisticasPersonas> {
    try {
      await this.db.initDatabase()
      const personasCifradas = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]
      
      const anoActual = new Date().getFullYear()
      
      // ✅ RÁPIDO: Solo usa campos no cifrados
      return {
        total: personasCifradas.length,
        frecuentesAlta: personasCifradas.filter(p => p.frecuencia === 'alta').length,
        frecuentesMedia: personasCifradas.filter(p => p.frecuencia === 'media').length,
        visitasEsteAno: personasCifradas.filter(p => 
          new Date(p.ultimaVisita).getFullYear() === anoActual
        ).length
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return { total: 0, frecuentesAlta: 0, frecuentesMedia: 0, visitasEsteAno: 0 }
    }
  }
}

// Instancia singleton
export const personaManager = new PersonaManager()
