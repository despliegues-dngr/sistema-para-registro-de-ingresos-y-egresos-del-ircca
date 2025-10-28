/**
 * Composable para importar y restaurar backups desde archivos externos
 * Permite recuperar datos desde archivos .ircca guardados en pendrive/nube
 */

import { ref } from 'vue'
import { useDatabase } from '@/composables/useDatabase'
import { encryptionService } from '@/services/encryptionService'
import { useAppStore } from '@/stores/app'

interface BackupFileData {
  id: string
  timestamp: string | Date
  data: string | { encrypted: string; salt: string; iv: string } // Datos cifrados (string o objeto)
  encrypted: boolean
  size: number
  exportedAt?: string
  appVersion?: string
  format?: string
}

interface BackupContent {
  registros: unknown[]
  usuarios: unknown[]
  config: unknown[]
  personasConocidas: unknown[]
  auditLogs: unknown[]
  feedbackUsuarios: unknown[]
  timestamp: string | Date
  version: string
  dbVersion: number
}

export function useBackupImport() {
  const appStore = useAppStore()
  const db = useDatabase()
  const isImporting = ref(false)
  const importProgress = ref(0)

  /**
   * Valida la estructura del archivo de backup
   */
  const validateBackupFile = (data: unknown): data is BackupFileData => {
    if (!data || typeof data !== 'object') {
      return false
    }
    
    const backup = data as Partial<BackupFileData>
    
    // backup.data puede ser string (formato antiguo) u objeto con {encrypted, salt, iv}
    const hasValidData = backup.data && (
      typeof backup.data === 'string' ||
      (typeof backup.data === 'object' && 'encrypted' in backup.data)
    )
    
    return !!(
      backup.id &&
      backup.timestamp &&
      hasValidData &&
      backup.encrypted === true
    )
  }

  /**
   * Valida el contenido descifrado del backup
   */
  const validateBackupContent = (data: unknown): data is BackupContent => {
    if (!data || typeof data !== 'object') return false
    
    const content = data as Partial<BackupContent>
    
    return !!(
      Array.isArray(content.registros) &&
      Array.isArray(content.usuarios) &&
      Array.isArray(content.config) &&
      Array.isArray(content.personasConocidas) &&
      content.version &&
      content.dbVersion
    )
  }

  /**
   * Lee y valida un archivo de backup
   */
  const readBackupFile = (file: File): Promise<BackupFileData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const data = JSON.parse(content)

          if (!validateBackupFile(data)) {
            reject(new Error('Archivo de backup inválido o corrupto'))
            return
          }

          resolve(data)
        } catch {
          reject(new Error('No se pudo leer el archivo. Formato inválido.'))
        }
      }

      reader.onerror = (error) => {
        console.error('❌ [BACKUP IMPORT] FileReader error:', error)
        reject(new Error(`Error al leer el archivo: ${error}`))
      }

      reader.readAsText(file)
    })
  }

  /**
   * Limpia todos los stores antes de restaurar
   */
  const clearAllStores = async (): Promise<void> => {
    console.log('🗑️ [BACKUP IMPORT] Limpiando todos los stores...')
    const stores = ['registros', 'usuarios', 'configuracion', 'personasConocidas', 'audit_logs', 'feedback_usuarios']
    
    for (const storeName of stores) {
      const records = await db.getRecords(storeName)
      console.log(`🗑️ [BACKUP IMPORT] Limpiando store: ${storeName}, registros: ${records.length}`)
      for (const record of records as Array<{ id: string }>) {
        await db.deleteRecord(storeName, record.id)
      }
    }
    console.log('✅ [BACKUP IMPORT] Todos los stores limpiados')
  }

  /**
   * Función helper para insertar o actualizar (upsert)
   * Útil para evitar errores de duplicados
   */
  const upsertRecord = async (
    storeName: string, 
    record: Record<string, unknown>, 
    keyField: string = 'id'
  ): Promise<{ success: boolean; error?: string; updated?: boolean }> => {
    try {
      // eslint-disable-next-line security/detect-object-injection
      const keyValue = String(record[keyField])
      const existingRecord = await db.getRecord(storeName, keyValue)
      
      if (existingRecord) {
        const result = await db.updateRecord(storeName, keyValue, record)
        return { ...result, updated: true }
      } else {
        const result = await db.addRecord(storeName, record)
        return { ...result, updated: false }
      }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : String(err) 
      }
    }
  }

  /**
   * Type guard para validar que un elemento es Record<string, unknown>
   */
  const isValidRecord = (item: unknown): item is Record<string, unknown> => {
    return typeof item === 'object' && item !== null && !Array.isArray(item)
  }

  /**
   * Restaura datos en los stores
   */
  const restoreData = async (content: BackupContent): Promise<void> => {
    // Inicializar base de datos antes de restaurar
    await db.initDatabase()
    
    importProgress.value = 10
    
    // Restaurar registros
    for (const registro of content.registros) {
      try {
        if (isValidRecord(registro)) {
          await db.addRecord('registros', registro)
        }
      } catch {
        // Ignorar errores individuales
      }
    }
    importProgress.value = 30

    // Restaurar usuarios (usando UPSERT para evitar duplicados)
    for (const usuario of content.usuarios) {
      try {
        if (isValidRecord(usuario)) {
          await upsertRecord('usuarios', usuario, 'username')
        }
      } catch {
        // Ignorar errores individuales
      }
    }
    importProgress.value = 50

    // Restaurar configuración
    for (const config of content.config) {
      try {
        if (isValidRecord(config)) {
          await db.addRecord('configuracion', config)
        }
      } catch {
        // Ignorar errores individuales
      }
    }
    importProgress.value = 60

    // Restaurar personas conocidas
    for (const persona of content.personasConocidas) {
      try {
        if (isValidRecord(persona)) {
          await db.addRecord('personasConocidas', persona)
        }
      } catch {
        // Ignorar errores individuales
      }
    }
    importProgress.value = 75

    // Restaurar audit logs (si existen)
    if (content.auditLogs && Array.isArray(content.auditLogs)) {
      for (const log of content.auditLogs) {
        try {
          if (isValidRecord(log)) {
            await db.addRecord('audit_logs', log)
          }
        } catch {
          // Ignorar errores individuales
        }
      }
    }
    importProgress.value = 85

    // Restaurar feedback (si existe)
    if (content.feedbackUsuarios && Array.isArray(content.feedbackUsuarios)) {
      for (const feedback of content.feedbackUsuarios) {
        try {
          if (isValidRecord(feedback)) {
            await db.addRecord('feedback_usuarios', feedback)
          }
        } catch {
          // Ignorar errores individuales
        }
      }
    }
    importProgress.value = 100
  }

  /**
   * Importa y restaura un backup desde archivo
   */
  const importBackup = async (
    file: File,
    sessionKey: string,
    options: { clearExisting?: boolean } = {}
  ): Promise<{ success: boolean; error?: string }> => {
    if (isImporting.value) {
      return { success: false, error: 'Importación en progreso' }
    }

    isImporting.value = true
    importProgress.value = 0

    try {
      // 1. Leer archivo
      appStore.addNotification('Leyendo archivo de backup...', 'info')
      const backupFile = await readBackupFile(file)
      importProgress.value = 5

      // 2. Descifrar datos
      appStore.addNotification('Descifrando backup...', 'info')
      let decryptedData: string
      try {
        // Manejar ambos formatos: string directo u objeto {encrypted, salt, iv}
        if (typeof backupFile.data === 'object' && 'encrypted' in backupFile.data) {
          const { encrypted, salt, iv } = backupFile.data
          // ✅ Pasar todos los parámetros requeridos por decrypt()
          decryptedData = await encryptionService.decrypt(encrypted, sessionKey, salt, iv)
        } else {
          return {
            success: false,
            error: 'Formato de backup no soportado. Use un backup exportado con la versión actual.'
          }
        }
      } catch {
        return { 
          success: false, 
          error: 'No se pudo descifrar el backup. Verifica que la clave sea correcta.' 
        }
      }

      // 3. Parsear contenido
      const content = JSON.parse(decryptedData) as unknown
      
      if (!validateBackupContent(content)) {
        return { 
          success: false, 
          error: 'El contenido del backup es inválido o está corrupto' 
        }
      }

      // 4. Validar versión de BD
      if (content.dbVersion && content.dbVersion > 5) {
        return {
          success: false,
          error: `Este backup requiere una versión más reciente de la aplicación (DB v${content.dbVersion})`
        }
      }

      // 5. Limpiar stores existentes si se solicita
      if (options.clearExisting) {
        console.log('🗑️ [BACKUP IMPORT] Limpiando stores existentes...')
        appStore.addNotification('Limpiando datos existentes...', 'info')
        await clearAllStores()
      }

      // 6. Restaurar datos
      console.log('🔄 [BACKUP IMPORT] Paso 4: Iniciando restauración...')
      appStore.addNotification('Restaurando datos...', 'info')
      await restoreData(content)
      console.log('✅ [BACKUP IMPORT] Restauración completada exitosamente')

      appStore.addNotification(
        '¡Backup restaurado exitosamente! La aplicación se recargará.',
        'success'
      )

      // 7. Recargar aplicación después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)

      return { success: true }
    } catch (error) {
      // Extraer mensaje de error correctamente
      const errorMsg = error instanceof Error 
        ? `Error importando backup: ${error.message}` 
        : `Error importando backup: ${String(error)}`
      
      console.error('❌ [BACKUP IMPORT] Error capturado:', error)
      console.error('❌ [BACKUP IMPORT] Stack trace:', error instanceof Error ? error.stack : 'N/A')
      
      appStore.addNotification('No se pudo importar el backup', 'error')
      return { success: false, error: errorMsg }
    } finally {
      isImporting.value = false
    }
  }

  /**
   * Valida un archivo sin importarlo (preview)
   */
  const validateBackupFileOnly = async (
    file: File,
    sessionKey: string
  ): Promise<{ 
    valid: boolean
    error?: string
    info?: {
      timestamp: Date
      version: string
      recordCount: number
    }
  }> => {
    try {
      const backupFile = await readBackupFile(file)
      
      // Intentar descifrar
      let decryptedData: string
      if (typeof backupFile.data === 'object' && 'encrypted' in backupFile.data) {
        const { encrypted, salt, iv } = backupFile.data
        decryptedData = await encryptionService.decrypt(encrypted, sessionKey, salt, iv)
      } else {
        return { valid: false, error: 'Formato de backup no soportado' }
      }
      const content = JSON.parse(decryptedData) as BackupContent

      if (!validateBackupContent(content)) {
        return { valid: false, error: 'Contenido inválido' }
      }

      const recordCount = 
        content.registros.length +
        content.usuarios.length +
        content.personasConocidas.length

      return {
        valid: true,
        info: {
          timestamp: new Date(content.timestamp),
          version: content.version,
          recordCount
        }
      }
    } catch (error) {
      return { valid: false, error: String(error) }
    }
  }

  return {
    // Estado
    isImporting,
    importProgress,

    // Métodos
    importBackup,
    validateBackupFileOnly
  }
}
