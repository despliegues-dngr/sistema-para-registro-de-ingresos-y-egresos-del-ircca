import { useDatabase } from '@/composables/useDatabase'
import { encryptionService } from './encryptionService'
import type { RegistroEntry } from '@/stores/registro'

export interface BackupData {
  id: string
  timestamp: Date
  data: unknown
  encrypted: boolean
  size: number
}

export class DatabaseService {
  private db = useDatabase()
  private masterKey = 'IRCCA_SISTEMA_2024' // TODO: Obtener de configuración segura

  /**
   * Inicializa la base de datos
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    return await this.db.initDatabase()
  }

  /**
   * Guarda registro con cifrado
   */
  async saveRegistro(registro: RegistroEntry): Promise<{ success: boolean; error?: string }> {
    try {
      // Cifrar datos sensibles
      const encryptedPersona = registro.persona
        ? await encryptionService.encrypt(JSON.stringify(registro.persona), this.masterKey)
        : null

      const encryptedVehiculo = registro.vehiculo
        ? await encryptionService.encrypt(JSON.stringify(registro.vehiculo), this.masterKey)
        : null

      const encryptedRegistro = {
        ...registro,
        persona: encryptedPersona,
        vehiculo: encryptedVehiculo,
        encrypted: true,
      }

      return await this.db.addRecord('registros', encryptedRegistro)
    } catch (error) {
      return { success: false, error: `Error guardando registro: ${error}` }
    }
  }

  /**
   * Obtiene registros con descifrado
   */
  async getRegistros(filters?: { tipo?: string; fecha?: Date }): Promise<RegistroEntry[]> {
    try {
      let registros = (await this.db.getRecords('registros')) as RegistroEntry[]

      // Filtrar si se especifica
      if (filters?.tipo) {
        registros = registros.filter((r) => r.tipo === filters.tipo)
      }

      if (filters?.fecha) {
        const fechaStr = filters.fecha.toDateString()
        registros = registros.filter((r) => new Date(r.timestamp).toDateString() === fechaStr)
      }

      // Descifrar datos
      const decryptedRegistros = await Promise.all(
        registros.map(async (registro) => {
          const registroWithEncryption = registro as RegistroEntry & { encrypted?: boolean }
          if (!registroWithEncryption.encrypted) return registro

          let persona = null
          let vehiculo = null

          if (registro.persona) {
            try {
              const encryptedPersona = registro.persona as unknown as {
                encrypted: string
                salt: string
                iv: string
              }
              const decryptedPersona = await encryptionService.decrypt(
                encryptedPersona.encrypted,
                this.masterKey,
                encryptedPersona.salt,
                encryptedPersona.iv,
              )
              persona = JSON.parse(decryptedPersona)
            } catch (error) {
              console.error('Error descifrando persona:', error)
            }
          }

          if (registro.vehiculo) {
            try {
              const encryptedVehiculo = registro.vehiculo as unknown as {
                encrypted: string
                salt: string
                iv: string
              }
              const decryptedVehiculo = await encryptionService.decrypt(
                encryptedVehiculo.encrypted,
                this.masterKey,
                encryptedVehiculo.salt,
                encryptedVehiculo.iv,
              )
              vehiculo = JSON.parse(decryptedVehiculo)
            } catch (error) {
              console.error('Error descifrando vehículo:', error)
            }
          }

          return {
            ...registro,
            persona,
            vehiculo,
          }
        }),
      )

      return decryptedRegistros
    } catch (error) {
      console.error('Error obteniendo registros:', error)
      return []
    }
  }

  /**
   * Buscar por documento
   */
  async searchByDocumento(documento: string): Promise<RegistroEntry[]> {
    const registros = await this.getRegistros()
    return registros.filter((r) => r.persona?.documento === documento)
  }

  /**
   * Buscar por matrícula
   */
  async searchByMatricula(matricula: string): Promise<RegistroEntry[]> {
    const registros = await this.getRegistros()
    return registros.filter((r) => r.vehiculo?.matricula === matricula)
  }

  /**
   * Crear backup cifrado
   */
  async createBackup(): Promise<{ success: boolean; error?: string; backupId?: string }> {
    try {
      // Obtener todos los datos
      const registros = (await this.db.getRecords('registros')) as unknown[]
      const usuarios = (await this.db.getRecords('usuarios')) as unknown[]
      const config = (await this.db.getRecords('configuracion')) as unknown[]

      const backupData = {
        registros,
        usuarios,
        config,
        timestamp: new Date(),
        version: '1.0',
      }

      // Cifrar backup completo
      const encrypted = await encryptionService.encrypt(JSON.stringify(backupData), this.masterKey)

      const backup: BackupData = {
        id: encryptionService.generateSecureId(),
        timestamp: new Date(),
        data: encrypted,
        encrypted: true,
        size: JSON.stringify(backupData).length,
      }

      const result = await this.db.addRecord(
        'backups',
        backup as unknown as Record<string, unknown>,
      )

      return result.success ? { success: true, backupId: backup.id } : result
    } catch (error) {
      return { success: false, error: `Error creando backup: ${error}` }
    }
  }

  /**
   * Restaurar desde backup
   */
  async restoreBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const backups = (await this.db.getRecords('backups')) as BackupData[]
      const backup = backups.find((b) => b.id === backupId)

      if (!backup) {
        return { success: false, error: 'Backup no encontrado' }
      }

      // Descifrar backup
      const encryptedBackup = backup.data as { encrypted: string; salt: string; iv: string }
      const decryptedData = await encryptionService.decrypt(
        encryptedBackup.encrypted,
        this.masterKey,
        encryptedBackup.salt,
        encryptedBackup.iv,
      )

      const backupData = JSON.parse(decryptedData)

      // Limpiar stores existentes
      await this.db.clearStore('registros')
      await this.db.clearStore('usuarios')
      await this.db.clearStore('configuracion')

      // Restaurar datos
      for (const registro of backupData.registros) {
        await this.db.addRecord('registros', registro)
      }

      for (const usuario of backupData.usuarios) {
        await this.db.addRecord('usuarios', usuario)
      }

      for (const config of backupData.config) {
        await this.db.addRecord('configuracion', config)
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: `Error restaurando backup: ${error}` }
    }
  }

  /**
   * Limpiar datos antiguos (cumplimiento legal)
   */
  async cleanOldData(daysToKeep: number = 365): Promise<{ success: boolean; cleaned: number }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const registros = (await this.db.getRecords('registros')) as RegistroEntry[]
      const oldRegistros = registros.filter((r) => new Date(r.timestamp) < cutoffDate)

      // TODO: Implementar eliminación selectiva por ID
      // Por ahora solo contamos

      return { success: true, cleaned: oldRegistros.length }
    } catch {
      return { success: false, cleaned: 0 }
    }
  }
}

export const databaseService = new DatabaseService()
