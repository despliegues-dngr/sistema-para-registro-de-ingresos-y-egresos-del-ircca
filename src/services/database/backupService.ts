/**
 * Backup Service - Gestión de backups de la base de datos
 * Responsable de crear, listar y limpiar backups
 */

import { useDatabase } from '@/composables/useDatabase'
import { encryptionService } from '../encryptionService'
import type { BackupData } from './types'

export class BackupService {
  private _db: ReturnType<typeof useDatabase> | null = null
  private sessionKey?: string
  private masterKey: string

  constructor() {
    // 🔐 Usar clave maestra desde variable de entorno
    // Fallback a clave por defecto si no está definida
    this.masterKey = import.meta.env.VITE_BACKUP_MASTER_KEY || 'IRCCA_Sistema_MasterKey_2025_Secure'
  }

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
   * Inicializa el servicio con la clave de sesión
   * NOTA: sessionKey ya no se usa para cifrado, solo para compatibilidad
   */
  async initialize(sessionKey: string): Promise<void> {
    this.sessionKey = sessionKey
    await this.db.initDatabase()
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.sessionKey) {
      throw new Error('BackupService debe ser inicializado antes de usar')
    }
  }

  /**
   * ✅ CREAR BACKUP CIFRADO COMPLETO
   * Incluye TODOS los stores críticos para restauración total
   */
  async createBackup(): Promise<{ success: boolean; error?: string; backupId?: string }> {
    this.ensureInitialized()
    try {
      // Obtener todos los datos de stores críticos
      const registros = (await this.db.getRecords('registros')) as unknown[]
      const usuarios = (await this.db.getRecords('usuarios')) as unknown[]
      const config = (await this.db.getRecords('configuracion')) as unknown[]
      const personasConocidas = (await this.db.getRecords('personasConocidas')) as unknown[]
      const auditLogs = (await this.db.getRecords('audit_logs')) as unknown[]
      const feedbackUsuarios = (await this.db.getRecords('feedback_usuarios')) as unknown[]

      const backupData = {
        registros,
        usuarios,
        config,
        personasConocidas,
        auditLogs,
        feedbackUsuarios,
        timestamp: new Date(),
        version: '3.0', // ✅ v3.0: Backup completo con audit_logs + feedback_usuarios
        dbVersion: 5, // Versión de la BD para validación
      }

      // Cifrar backup completo con CLAVE MAESTRA
      const encrypted = await encryptionService.encrypt(
        JSON.stringify(backupData), 
        this.masterKey  // ✅ Usar clave maestra en lugar de sessionKey
      )

      const backup = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        data: encrypted,
        encrypted: true,
        size: JSON.stringify(backupData).length,
      }

      const result = await this.db.addRecord('backups', backup)

      return result.success ? { success: true, backupId: backup.id } : result
    } catch (error) {
      return { success: false, error: `Error creando backup: ${error}` }
    }
  }

  /**
   * ✅ OBTENER LISTA DE BACKUPS
   */
  async getBackups(): Promise<BackupData[]> {
    this.ensureInitialized()
    try {
      const backups = (await this.db.getRecords('backups')) as BackupData[]
      // Ordenar por timestamp (más reciente primero)
      return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch {
      return []
    }
  }

  /**
   * ✅ LIMPIAR BACKUPS ANTIGUOS (mantener solo los últimos N)
   */
  async cleanOldBackups(keepCount: number = 5): Promise<{ success: boolean; deleted: number }> {
    this.ensureInitialized()
    try {
      const backups = await this.getBackups()
      
      if (backups.length <= keepCount) {
        return { success: true, deleted: 0 }
      }

      // Backups a eliminar (los más antiguos)
      const backupsToDelete = backups.slice(keepCount)
      let deletedCount = 0

      for (const backup of backupsToDelete) {
        const result = await this.db.deleteRecord('backups', backup.id)
        if (result.success) {
          deletedCount++
        }
      }

      return { success: true, deleted: deletedCount }
    } catch {
      return { success: false, deleted: 0 }
    }
  }

  /**
   * Limpia la sesión
   */
  clearSession(): void {
    this.sessionKey = undefined
  }
}

// Instancia singleton
export const backupService = new BackupService()
