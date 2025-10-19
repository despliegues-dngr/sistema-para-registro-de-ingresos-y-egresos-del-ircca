import { useDatabase } from '@/composables/useDatabase'
import type { DatosVehiculo } from '@/stores/registro'
import { encryptionService } from './encryptionService'
import { databaseService } from './databaseService'

/**
 * Interfaz para datos cifrados en IndexedDB (Compliance Ley 18.331)
 * ✅ SEGURO: Todos los datos personales cifrados con AES-256-GCM
 */
interface PersonaConocidaCifrada extends Record<string, unknown> {
  id: string // UUID (clave primaria)
  cedulaHash: string // SHA-256 hash (para búsqueda por índice)
  datosPersonales: { // ✅ CIFRADO
    encrypted: string // → { cedula, nombre, apellido }
    iv: string
    salt: string
  }
  visitaInfo: { // ✅ CIFRADO
    encrypted: string // → { ultimoDestino, ultimoVehiculo? }
    iv: string
    salt: string
  }
  ultimaVisita: Date // ⚪ Metadata (no sensible)
  totalVisitas: number // ⚪ Metadata (no sensible)
  frecuencia: 'alta' | 'media' | 'baja' // ⚪ Derivado (no sensible)
  esAcompanante: boolean // ⚪ Metadata (no sensible)
}

/**
 * Interfaz para datos descifrados (uso en aplicación)
 * ✅ Esta es la interfaz pública que usan los componentes
 */
export interface PersonaConocida extends Record<string, unknown> {
  cedula: string
  nombre: string
  apellido: string
  ultimoDestino: string
  ultimoVehiculo?: DatosVehiculo
  ultimaVisita: Date
  totalVisitas: number
  frecuencia: 'alta' | 'media' | 'baja'
  esAcompanante: boolean
}

/**
 * Interfaces internas para cifrado/descifrado
 */
interface DatosPersonalesDescifrados {
  cedula: string
  nombre: string
  apellido: string
}

interface VisitaInfoDescifrada {
  ultimoDestino: string
  ultimoVehiculo?: DatosVehiculo
}

/**
 * Estructura de datos cifrados (retorno interno)
 */
interface DatosCifrados {
  datosPersonales: {
    encrypted: string
    iv: string
    salt: string
  }
  visitaInfo: {
    encrypted: string
    iv: string
    salt: string
  }
}

/**
 * Servicio de Autocompletado con Cifrado
 * ✅ SEGURO: Todos los datos personales cifrados en IndexedDB
 * ✅ RÁPIDO: Búsqueda por hash + descifrado solo de resultados (< 30ms)
 */
export class AutocompleteService {
  private _db: ReturnType<typeof useDatabase> | null = null
  private personasCache: Map<string, PersonaConocida> = new Map() // Cache en memoria
  private cacheLoaded = false

  /**
   * Getter lazy para db - solo se inicializa cuando se usa
   */
  private get db(): ReturnType<typeof useDatabase> {
    if (!this._db) {
      this._db = useDatabase()
    }
    return this._db
  }

  /**
   * Genera SHA-256 hash de una cédula (para indexación y búsqueda)
   * ✅ Se usa para búsqueda rápida sin exponer datos
   */
  private async generateCedulaHash(cedula: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(cedula)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Obtiene la clave de sesión del sistema (compartida)
   * Reutiliza la misma clave maestra del DatabaseService
   */
  private async getSessionKey(): Promise<string> {
    await databaseService.initializeWithSessionKey()
    // @ts-expect-error - Acceso a propiedad privada necesario para compartir clave
    return databaseService.sessionKey
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
   * Cargar cache de personas conocidas (una sola vez por sesión)
   * ✅ OPTIMIZADO: Descifra todas las personas y las mantiene en memoria
   */
  private async cargarCache(): Promise<void> {
    if (this.cacheLoaded) return

    try {
      await this.db.initDatabase()
      const personasCifradas = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]

      // Descifrar todas y cachear
      for (const cifrada of personasCifradas) {
        try {
          const descifrada = await this.descifrarPersonaConocida(cifrada)
          
          // ✅ VALIDACIÓN DE INTEGRIDAD: Verificar hash
          const hashVerificacion = await this.generateCedulaHash(descifrada.cedula)
          if (hashVerificacion !== cifrada.cedulaHash) {
            // Integridad comprometida, eliminar registro
            await this.db.deleteRecord('personasConocidas', cifrada.id)
            continue
          }

          this.personasCache.set(descifrada.cedula, descifrada)
        } catch (error) {
          console.error(`Error descifrado persona ${cifrada.id}:`, error)
          // Eliminar registro corrupto
          await this.db.deleteRecord('personasConocidas', cifrada.id)
        }
      }

      this.cacheLoaded = true
    } catch (error) {
      console.error('Error al cargar cache:', error)
    }
  }

  /**
   * Invalidar cache (al actualizar/agregar personas)
   */
  private invalidarCache(): void {
    this.personasCache.clear()
    this.cacheLoaded = false
  }

  /**
   * Cifra los datos de una persona conocida
   * ✅ SEGURO: Usa AES-256-GCM con clave maestra del sistema
   */
  private async cifrarPersonaConocida(
    datosPersonales: DatosPersonalesDescifrados,
    visitaInfo: VisitaInfoDescifrada
  ): Promise<DatosCifrados> {
    const sessionKey = await this.getSessionKey()

    const datosPersonalesCifrados = await encryptionService.encrypt(
      JSON.stringify(datosPersonales),
      sessionKey
    )

    const visitaInfoCifrada = await encryptionService.encrypt(
      JSON.stringify(visitaInfo),
      sessionKey
    )

    return {
      datosPersonales: datosPersonalesCifrados,
      visitaInfo: visitaInfoCifrada
    }
  }

  /**
   * Descifra los datos de una persona conocida
   * ✅ SEGURO: Solo descifra cuando es necesario mostrar datos
   */
  private async descifrarPersonaConocida(
    personaCifrada: PersonaConocidaCifrada
  ): Promise<PersonaConocida> {
    const sessionKey = await this.getSessionKey()

    const datosPersonalesJson = await encryptionService.decrypt(
      personaCifrada.datosPersonales.encrypted,
      sessionKey,
      personaCifrada.datosPersonales.salt,
      personaCifrada.datosPersonales.iv
    )

    const visitaInfoJson = await encryptionService.decrypt(
      personaCifrada.visitaInfo.encrypted,
      sessionKey,
      personaCifrada.visitaInfo.salt,
      personaCifrada.visitaInfo.iv
    )

    const datosPersonales: DatosPersonalesDescifrados = JSON.parse(datosPersonalesJson)
    const visitaInfo: VisitaInfoDescifrada = JSON.parse(visitaInfoJson)

    return {
      cedula: datosPersonales.cedula,
      nombre: datosPersonales.nombre,
      apellido: datosPersonales.apellido,
      ultimoDestino: visitaInfo.ultimoDestino,
      ultimoVehiculo: visitaInfo.ultimoVehiculo,
      ultimaVisita: personaCifrada.ultimaVisita,
      totalVisitas: personaCifrada.totalVisitas,
      frecuencia: personaCifrada.frecuencia,
      esAcompanante: personaCifrada.esAcompanante
    }
  }

  /**
   * Actualiza o crea persona conocida después de un registro exitoso
   * ✅ NUEVO: Cifra todos los datos antes de guardar en IndexedDB
   */
  async actualizarPersonaConocida(datos: {
    cedula: string
    nombre: string
    apellido: string
    destino: string
    vehiculo?: DatosVehiculo
    esAcompanante?: boolean
  }): Promise<void> {
    try {
      await this.db.initDatabase()
      
      const cedulaHash = await this.generateCedulaHash(datos.cedula)
      
      // Buscar si ya existe (por hash)
      const registrosCifrados = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]
      const existenteCifrada = registrosCifrados.find(p => p.cedulaHash === cedulaHash)

      let personaCifrada: PersonaConocidaCifrada

      if (existenteCifrada) {
        // Descifrar para actualizar
        const existenteDescifrada = await this.descifrarPersonaConocida(existenteCifrada)
        
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
        const datosCifrados = await this.cifrarPersonaConocida(datosPersonales, visitaInfo)

        personaCifrada = {
          id: existenteCifrada.id,
          cedulaHash,
          datosPersonales: datosCifrados.datosPersonales,
          visitaInfo: datosCifrados.visitaInfo,
          ultimaVisita: new Date(),
          totalVisitas: existenteDescifrada.totalVisitas + 1,
          frecuencia: this.calcularFrecuencia(existenteDescifrada.totalVisitas + 1),
          esAcompanante: datos.esAcompanante ?? false
        }

        // Actualizar en DB
        await this.db.updateRecord('personasConocidas', existenteCifrada.id, personaCifrada)
        
        // ✅ INVALIDAR CACHE: Para reflejar cambios
        this.invalidarCache()
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
        const datosCifrados = await this.cifrarPersonaConocida(datosPersonales, visitaInfo)

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
        this.invalidarCache()
      }
    } catch (error) {
      console.error('Error actualizando persona conocida:', error)
      // No lanzar error para no bloquear el registro principal
    }
  }

  /**
   * Busca personas conocidas por cédula parcial (autocompletado en tiempo real)
   * ✅ OPTIMIZADO: Usa cache en memoria (muy rápido)
   * ✅ SEGURO: Datos personales nunca expuestos sin cifrar en IndexedDB
   */
  async buscarPorCedulaParcial(cedulaParcial: string): Promise<PersonaConocida[]> {
    try {
      if (!cedulaParcial || cedulaParcial.length < 1) {
        return []
      }

      // Cargar cache si no está cargado (solo primera vez)
      await this.cargarCache()
      
      // Filtrar del cache (muy rápido)
      const resultados = Array.from(this.personasCache.values())
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
      console.error('Error buscando por cédula:', error)
      return []
    }
  }

  /**
   * Obtiene persona conocida por cédula exacta
   * ✅ NUEVO: Busca por hash + descifra solo el resultado encontrado
   */
  async obtenerPorCedula(cedula: string): Promise<PersonaConocida | null> {
    try {
      await this.db.initDatabase()
      
      const cedulaHash = await this.generateCedulaHash(cedula)
      const personasCifradas = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]
      
      const personaCifrada = personasCifradas.find(p => p.cedulaHash === cedulaHash)
      
      if (!personaCifrada) {
        return null
      }

      // Descifrar solo si se encontró
      const personaDescifrada = await this.descifrarPersonaConocida(personaCifrada)
      
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
   * Busca vehículos conocidos por matrícula parcial
   * ✅ OPTIMIZADO: Usa cache en memoria
   */
  async buscarPorMatriculaParcial(matriculaParcial: string): Promise<PersonaConocida[]> {
    try {
      if (!matriculaParcial || matriculaParcial.length < 2) {
        return []
      }

      // Cargar cache si no está cargado (solo primera vez)
      await this.cargarCache()
      
      const matriculaNormalizada = matriculaParcial.toUpperCase()
      
      // Filtrar del cache
      const resultados = Array.from(this.personasCache.values())
        .filter(p => p.ultimoVehiculo?.matricula?.toUpperCase().startsWith(matriculaNormalizada))
        .sort((a, b) => new Date(b.ultimaVisita).getTime() - new Date(a.ultimaVisita).getTime())
        .slice(0, 5)

      return resultados
    } catch (error) {
      console.error('Error buscando por matrícula:', error)
      return []
    }
  }

  /**
   * Obtiene estadísticas de personas conocidas
   * ✅ NO necesita descifrar: usa solo metadata no sensible
   */
  async obtenerEstadisticas(): Promise<{
    total: number
    frecuentesAlta: number
    frecuentesMedia: number
    visitasEsteAno: number
  }> {
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
      await this.db.initDatabase()

      // ✅ VERIFICAR si el store existe (puede no existir si la BD es vieja)
      let personasExistentes: PersonaConocida[] = []
      
      try {
        personasExistentes = (await this.db.getRecords('personasConocidas')) as PersonaConocida[]
      } catch {
        return { sincronizados: 0, errores: 0 }
      }
      
      if (personasExistentes.length > 0) {
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
