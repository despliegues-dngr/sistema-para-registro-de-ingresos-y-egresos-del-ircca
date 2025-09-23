import { useDatabase } from '@/composables/useDatabase'
import { encryptionService } from './encryptionService'
import type { RegistroEntry, RegistroIngreso, RegistroSalida } from '@/stores/registro'

// Tipos para registros con datos cifrados
type RegistroWithEncryptedData = RegistroEntry & {
  encrypted?: boolean
  persona?: {
    encrypted: string
    salt: string
    iv: string
  }
  vehiculo?: {
    encrypted: string
    salt: string
    iv: string
  }
}

export interface BackupData {
  id: string
  timestamp: Date
  data: unknown
  encrypted: boolean
  size: number
}

export class DatabaseService {
  private db = useDatabase()
  private sessionKey?: string
  private isInitialized = false

  /**
   * Inicializa la base de datos
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    return await this.db.initDatabase()
  }

  /**
   * Inicializa el servicio con una clave de sesión derivada de las credenciales del usuario
   */
  async initializeWithSessionKey(userCredentials: string): Promise<void> {
    // Derivar clave de sesión usando PBKDF2 con salt fijo para esta sesión
    const encoder = new TextEncoder()
    const credentialsBuffer = encoder.encode(userCredentials)
    const salt = encoder.encode('IRCCA_SESSION_SALT_2024') // Salt fijo para derivación de sesión

    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      credentialsBuffer,
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
  }

  /**
   * Verifica que el servicio esté inicializado con una clave de sesión
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
  }

  /**
   * Guarda registro con cifrado
   */
  async saveRegistro(registro: RegistroEntry): Promise<{ success: boolean; error?: string }> {
    this.ensureInitialized()
    try {
      // Cifrar datos sensibles - usar estructura correcta según tipo
      let encryptedPersona: { encrypted: string; salt: string; iv: string } | null = null
      let encryptedVehiculo: { encrypted: string; salt: string; iv: string } | null = null
      
      if (registro.tipo === 'ingreso') {
        const registroIngreso = registro as RegistroIngreso
        encryptedPersona = await encryptionService.encrypt(
          JSON.stringify(registroIngreso.datosPersonales), 
          this.sessionKey!
        )
        if (registroIngreso.datosVehiculo) {
          encryptedVehiculo = await encryptionService.encrypt(
            JSON.stringify(registroIngreso.datosVehiculo), 
            this.sessionKey!
          )
        }
      } else {
        // Para registros de salida, cifrar la cédula buscada
        const registroSalida = registro as RegistroSalida
        encryptedPersona = await encryptionService.encrypt(
          registroSalida.cedulaBuscada, 
          this.sessionKey!
        )
      }

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
    this.ensureInitialized()
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
          const registroWithEncryption = registro as RegistroWithEncryptedData
          if (!registroWithEncryption.encrypted) return registro

          let persona: unknown = null
          let vehiculo: unknown = null

          // Descifrar datos según tipo de registro
          if (registro.tipo === 'ingreso') {
            if (registroWithEncryption.persona) {
              try {
                const encryptedPersona = registroWithEncryption.persona
                const decryptedPersona = await encryptionService.decrypt(
                  encryptedPersona.encrypted,
                  this.sessionKey!,
                  encryptedPersona.salt,
                  encryptedPersona.iv,
                )
                persona = JSON.parse(decryptedPersona)
              } catch (error) {
                console.error('Error descifrando datosPersonales:', error)
              }
            }
          } else {
            // Para registros de salida, descifrar cedulaBuscada
            if (registroWithEncryption.persona) {
              try {
                const encryptedCedula = registroWithEncryption.persona
                const decryptedCedula = await encryptionService.decrypt(
                  encryptedCedula.encrypted,
                  this.sessionKey!,
                  encryptedCedula.salt,
                  encryptedCedula.iv,
                )
                persona = decryptedCedula
              } catch (error) {
                console.error('Error descifrando cedulaBuscada:', error)
              }
            }
          }

          if (registroWithEncryption.vehiculo) {
            try {
              const encryptedVehiculo = registroWithEncryption.vehiculo
              const decryptedVehiculo = await encryptionService.decrypt(
                encryptedVehiculo.encrypted,
                this.sessionKey!,
                encryptedVehiculo.salt,
                encryptedVehiculo.iv,
              )
              vehiculo = JSON.parse(decryptedVehiculo)
            } catch (error) {
              console.error('Error descifrando vehículo:', error)
            }
          }

          // Return the original structure without mixing incompatible properties
          if (registro.tipo === 'ingreso') {
            const registroIngreso = registro as RegistroIngreso
            return {
              ...registroIngreso,
              // Mantener datos descifrados en su estructura original
              datosPersonales: persona || registroIngreso.datosPersonales,
              datosVehiculo: vehiculo || registroIngreso.datosVehiculo,
            } as RegistroIngreso
          } else {
            const registroSalida = registro as RegistroSalida
            return {
              ...registroSalida,
              cedulaBuscada: persona || registroSalida.cedulaBuscada,
            } as RegistroSalida
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
    return registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        const registroIngreso = r as RegistroIngreso
        return registroIngreso.datosPersonales?.cedula === documento
      } else {
        const registroSalida = r as RegistroSalida
        return registroSalida.cedulaBuscada === documento
      }
    })
  }

  /**
   * Buscar por matrícula
   */
  async searchByMatricula(matricula: string): Promise<RegistroEntry[]> {
    const registros = await this.getRegistros()
    return registros.filter((r) => {
      if (r.tipo === 'ingreso') {
        const registroIngreso = r as RegistroIngreso
        return registroIngreso.datosVehiculo?.matricula === matricula
      }
      return false
    })
  }

  /**
   * Crear backup cifrado
   */
  async createBackup(): Promise<{ success: boolean; error?: string; backupId?: string }> {
    this.ensureInitialized()
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
      const encrypted = await encryptionService.encrypt(JSON.stringify(backupData), this.sessionKey!)

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
    this.ensureInitialized()
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
        this.sessionKey!,
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
