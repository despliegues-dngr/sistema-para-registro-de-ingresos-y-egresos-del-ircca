/**
 * Database Service - Servicio principal de base de datos
 * Orquestador de operaciones CRUD con cifrado
 * 
 * ✅ REFACTORIZADO: Módulos especializados para cifrado, backups y mantenimiento
 */

import { useDatabase } from '@/composables/useDatabase'
import type { RegistroEntry, RegistroIngreso, RegistroSalida } from '@/stores/registro'
import type { RegistroIngresoCifrado, RegistroSalidaCifrado } from './types'
import {
  cifrarRegistroIngreso,
  cifrarRegistroSalida,
  descifrarRegistroIngreso,
  descifrarRegistroSalida
} from './encryptionManager'
import { backupService } from './backupService'
import { cleanOldData } from './maintenanceService'

export class DatabaseService {
  private _db: ReturnType<typeof useDatabase> | null = null
  private sessionKey?: string
  private isInitialized = false

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
   * Inicializa la base de datos
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    const result = await this.db.initDatabase()
    return result
  }

  /**
   * Inicializa el servicio con una clave maestra del sistema para cifrado compartido
   * ✅ NUEVO DISEÑO: Todos los operadores pueden ver todos los registros
   * 🔍 AUDITORÍA: Se mantiene operadorId en claro para trazabilidad
   */
  async initializeWithSessionKey(): Promise<void> {
    if (this.isInitialized && this.sessionKey) {
      return
    }
    
    // ✅ PRIMERO: Inicializar IndexedDB interno
    const dbResult = await this.initialize()
    if (!dbResult.success) {
      throw new Error(`Error inicializando IndexedDB interno: ${dbResult.error}`)
    }
    
    // 🔄 NUEVO: Generar clave maestra determinística
    const systemMasterKey = 'IRCCA_PROD_2024_' + btoa('sistema_accesos_mario_berni_55226350').slice(0, 32)
    
    const encoder = new TextEncoder()
    const masterKeyBuffer = encoder.encode(systemMasterKey)
    const salt = encoder.encode('IRCCA_SYSTEM_SALT_2024')

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      masterKeyBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )

    const sessionKeyMaterial = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )

    const sessionKeyBuffer = await window.crypto.subtle.exportKey('raw', sessionKeyMaterial)
    this.sessionKey = btoa(String.fromCharCode(...new Uint8Array(sessionKeyBuffer)))
    this.isInitialized = true

    // Inicializar servicio de backups con la misma clave
    await backupService.initialize(this.sessionKey)
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.sessionKey) {
      throw new Error('DatabaseService debe ser inicializado con initializeWithSessionKey() antes de usar')
    }
  }

  /**
   * Limpia la clave de sesión (logout)
   */
  clearSession(): void {
    this.sessionKey = undefined
    this.isInitialized = false
    backupService.clearSession()
  }

  /**
   * Guarda registro con cifrado
   */
  async saveRegistro(registro: RegistroEntry): Promise<{ success: boolean; error?: string }> {
    this.ensureInitialized()
    try {
      let encryptedRegistro: Record<string, unknown>

      if (registro.tipo === 'ingreso') {
        encryptedRegistro = await cifrarRegistroIngreso(
          registro as RegistroIngreso,
          this.sessionKey!
        )
      } else {
        encryptedRegistro = await cifrarRegistroSalida(
          registro as RegistroSalida,
          this.sessionKey!
        )
      }

      return await this.db.addRecord('registros', encryptedRegistro)
    } catch (error) {
      return { success: false, error: `Error guardando registro: ${error}` }
    }
  }

  /**
   * ✅ NUEVO: Obtiene registros con descifrado completo
   */
  async getRegistrosDescifrados(filters?: { tipo?: string; fecha?: Date }): Promise<RegistroEntry[]> {
    this.ensureInitialized()
    try {
      // Obtener registros cifrados de IndexedDB
      let registrosCifrados = (await this.db.getRecords('registros')) as (RegistroIngresoCifrado | RegistroSalidaCifrado)[]

      // Aplicar filtros si se especifica
      if (filters?.tipo) {
        registrosCifrados = registrosCifrados.filter((r) => r.tipo === filters.tipo)
      }

      if (filters?.fecha) {
        const fechaStr = filters.fecha.toDateString()
        registrosCifrados = registrosCifrados.filter((r) => 
          new Date(r.timestamp).toDateString() === fechaStr
        )
      }

      // ✅ DESCIFRAR CADA REGISTRO COMPLETAMENTE
      const registrosDescifrados = await Promise.all(
        registrosCifrados.map(async (registroCifrado) => {
          try {
            if (!registroCifrado.encrypted) {
              return null
            }
            
            if (registroCifrado.tipo === 'ingreso') {
              return await descifrarRegistroIngreso(
                registroCifrado as RegistroIngresoCifrado,
                this.sessionKey!
              )
            } else if (registroCifrado.tipo === 'salida') {
              return await descifrarRegistroSalida(
                registroCifrado as RegistroSalidaCifrado,
                this.sessionKey!
              )
            } else {
              return null
            }
          } catch {
            return null
          }
        })
      )

      // Filtrar registros nulos
      const registrosValidos = registrosDescifrados.filter((r): r is RegistroEntry => r !== null)
      
      return registrosValidos
    } catch (error) {
      throw new Error(`Error obteniendo registros: ${error}`)
    }
  }

  /**
   * ✅ MÉTODO LEGACY (para compatibilidad)
   */
  async getRegistros(filters?: { tipo?: string; fecha?: Date }): Promise<RegistroEntry[]> {
    return this.getRegistrosDescifrados(filters)
  }

  /**
   * ✅ BÚSQUEDA POR CÉDULA (con descifrado)
   */
  async searchByDocumento(documento: string): Promise<RegistroEntry[]> {
    const registros = await this.getRegistrosDescifrados()
    
    return registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        const registroIngreso = r as RegistroIngreso
        return registroIngreso.datosPersonales?.cedula?.includes(documento)
      } else {
        const registroSalida = r as RegistroSalida
        return registroSalida.cedulaBuscada?.includes(documento)
      }
    })
  }

  /**
   * ✅ BÚSQUEDA POR MATRÍCULA (con descifrado)
   */
  async searchByMatricula(matricula: string): Promise<RegistroEntry[]> {
    const registros = await this.getRegistrosDescifrados()
    
    return registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        const registroIngreso = r as RegistroIngreso
        return registroIngreso.datosVehiculo?.matricula?.toUpperCase().includes(matricula.toUpperCase())
      }
      return false
    })
  }

  /**
   * ✅ CREAR BACKUP CIFRADO (delegado a backupService)
   */
  async createBackup(): Promise<{ success: boolean; error?: string; backupId?: string }> {
    this.ensureInitialized()
    return backupService.createBackup()
  }

  /**
   * ✅ OBTENER LISTA DE BACKUPS (delegado a backupService)
   */
  async getBackups() {
    this.ensureInitialized()
    return backupService.getBackups()
  }

  /**
   * ✅ LIMPIAR BACKUPS ANTIGUOS (delegado a backupService)
   */
  async cleanOldBackups(keepCount: number = 5) {
    this.ensureInitialized()
    return backupService.cleanOldBackups(keepCount)
  }

  /**
   * ✅ LIMPIAR DATOS ANTIGUOS (delegado a maintenanceService)
   */
  async cleanOldData(daysToKeep: number = 365) {
    this.ensureInitialized()
    const registros = await this.getRegistrosDescifrados()
    return cleanOldData(registros, daysToKeep)
  }

  /**
   * Obtiene usuarios de la base de datos (no cifrados)
   */
  async getUsuarios(): Promise<Array<{ id: string; nombre: string; apellido: string; grado: string }>> {
    this.ensureInitialized()
    try {
      return await this.db.getRecords('usuarios') as Array<{ id: string; nombre: string; apellido: string; grado: string }>
    } catch {
      return []
    }
  }
}

export const databaseService = new DatabaseService()
