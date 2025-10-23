/**
 * Cache Manager - Gestión de caché en memoria para autocompletado
 * Responsable de cargar, invalidar y acceder al caché de personas conocidas
 */

import { useDatabase } from '@/composables/useDatabase'
import type { PersonaConocida, PersonaConocidaCifrada } from './types'
import { generateCedulaHash, descifrarPersonaConocida } from './encryptionHelper'

export class CacheManager {
  private _db: ReturnType<typeof useDatabase> | null = null
  private personasCache: Map<string, PersonaConocida> = new Map()
  private cacheLoaded = false

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
   * Cargar cache de personas conocidas (una sola vez por sesión)
   * ✅ OPTIMIZADO: Descifra todas las personas y las mantiene en memoria
   */
  async cargarCache(): Promise<void> {
    if (this.cacheLoaded) return

    try {
      await this.db.initDatabase()
      const personasCifradas = (await this.db.getRecords('personasConocidas')) as PersonaConocidaCifrada[]

      // Descifrar todas y cachear
      for (const cifrada of personasCifradas) {
        try {
          const descifrada = await descifrarPersonaConocida(cifrada)
          
          // ✅ VALIDACIÓN DE INTEGRIDAD: Verificar hash
          const hashVerificacion = await generateCedulaHash(descifrada.cedula)
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
  invalidarCache(): void {
    this.personasCache.clear()
    this.cacheLoaded = false
  }

  /**
   * Obtiene todas las personas del caché
   */
  getPersonas(): PersonaConocida[] {
    return Array.from(this.personasCache.values())
  }

  /**
   * Verifica si el caché está cargado
   */
  isCacheLoaded(): boolean {
    return this.cacheLoaded
  }
}

// Instancia singleton
export const cacheManager = new CacheManager()
