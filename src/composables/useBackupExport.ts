/**
 * Composable para exportar backups a archivos externos
 * Permite descargar backups cifrados para almacenamiento en pendrive/nube
 */

import { ref } from 'vue'
import { databaseService } from '@/services/databaseService'
import { useAppStore } from '@/stores/app'
import type { BackupData } from '@/services/database/types'

export function useBackupExport() {
  const appStore = useAppStore()
  const isExporting = ref(false)

  /**
   * Formatea el nombre del archivo de backup
   * Formato: ircca-backup-DD-MM-YYYY-HHMM.ircca
   * Ejemplo: ircca-backup-28-10-2025-1601.ircca
   */
  const getBackupFileName = (timestamp: Date): string => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `ircca-backup-${day}-${month}-${year}-${hours}${minutes}.ircca`
  }

  /**
   * Exporta un backup específico a archivo
   */
  const exportBackup = async (backupId: string): Promise<{ success: boolean; error?: string }> => {
    if (isExporting.value) {
      return { success: false, error: 'Exportación en progreso' }
    }

    isExporting.value = true

    try {
      // Obtener el backup de IndexedDB
      const backups = await databaseService.getBackups()
      const backup = backups.find((b: BackupData) => b.id === backupId)

      if (!backup) {
        return { success: false, error: 'Backup no encontrado' }
      }

      // Crear estructura de archivo con metadata
      console.log('📤 [BACKUP EXPORT] Preparando exportación:', {
        backupId: backup.id,
        dataType: typeof backup.data,
        dataKeys: typeof backup.data === 'object' && backup.data ? Object.keys(backup.data) : 'N/A',
        encrypted: backup.encrypted
      })
      
      const exportData = {
        id: backup.id,
        timestamp: backup.timestamp,
        data: backup.data, // Ya está cifrado
        encrypted: backup.encrypted,
        size: backup.size,
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0', // TODO: Obtener de package.json
        format: 'ircca-backup-v3.0'
      }
      
      console.log('📤 [BACKUP EXPORT] Datos a exportar:', {
        keys: Object.keys(exportData),
        dataType: typeof exportData.data,
        dataIsObject: typeof exportData.data === 'object',
        dataHasEncrypted: typeof exportData.data === 'object' && exportData.data !== null && 'encrypted' in exportData.data
      })

      // Convertir a JSON
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })

      // Crear link de descarga
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getBackupFileName(backup.timestamp)
      
      // Trigger descarga
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      appStore.addNotification(
        'Backup exportado exitosamente. Guárdalo en un lugar seguro.',
        'success'
      )

      return { success: true }
    } catch (error) {
      const errorMsg = `Error exportando backup: ${error}`
      appStore.addNotification('No se pudo exportar el backup', 'error')
      return { success: false, error: errorMsg }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Exporta el último backup disponible
   * Si el último backup tiene menos de 5 minutos, lo reutiliza
   * Si no, crea uno nuevo para evitar duplicados
   */
  const exportLatestBackup = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const backups = await databaseService.getBackups()
      
      if (backups.length > 0) {
        const latest = backups[0]
        const now = new Date().getTime()
        const lastBackupTime = new Date(latest.timestamp).getTime()
        const diffMinutes = (now - lastBackupTime) / 1000 / 60
        
        // Si el último backup tiene menos de 5 minutos, reutilizarlo
        if (diffMinutes < 5) {
          console.log('📦 [BACKUP] Reutilizando backup reciente (< 5 min)')
          return await exportBackup(latest.id)
        }
      }

      // Si no hay backups o el último es muy antiguo, crear uno nuevo
      console.log('📦 [BACKUP] Creando nuevo backup')
      return await createAndExportBackup()
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Crea un nuevo backup y lo exporta inmediatamente
   */
  const createAndExportBackup = async (): Promise<{ success: boolean; error?: string }> => {
    if (isExporting.value) {
      return { success: false, error: 'Exportación en progreso' }
    }

    isExporting.value = true

    try {
      // Crear nuevo backup
      appStore.addNotification('Creando backup...', 'info')
      const result = await databaseService.createBackup()

      if (!result.success || !result.backupId) {
        return { success: false, error: result.error || 'Error creando backup' }
      }

      // Exportar el backup recién creado
      appStore.addNotification('Exportando backup...', 'info')
      return await exportBackup(result.backupId)
    } catch (error) {
      const errorMsg = `Error en crear y exportar: ${error}`
      appStore.addNotification('No se pudo crear y exportar el backup', 'error')
      return { success: false, error: errorMsg }
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Obtiene información de backups disponibles
   */
  const getBackupsInfo = async () => {
    try {
      const backups = await databaseService.getBackups()
      return backups.map((backup: BackupData) => ({
        id: backup.id,
        timestamp: backup.timestamp,
        size: backup.size,
        encrypted: backup.encrypted,
        fileName: getBackupFileName(backup.timestamp)
      }))
    } catch {
      return []
    }
  }

  return {
    // Estado
    isExporting,

    // Métodos
    exportBackup,
    exportLatestBackup,
    createAndExportBackup,
    getBackupsInfo
  }
}
