import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { databaseService } from '@/services/databaseService'

/**
 * Composable para gestión automática de backups
 * ✅ Integrado con configuración de App Store
 * ✅ Respeta intervalo configurable
 * ✅ Notificaciones automáticas
 */
export function useAutoBackup() {
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const isBackingUp = ref(false)
  const lastBackupId = ref<string | null>(null)
  let backupTimer: number | null = null

  /**
   * Ejecuta backup automático si es necesario
   */
  const ejecutarBackupAutomatico = async (): Promise<void> => {
    // ✅ VERIFICAR AUTENTICACIÓN: No hacer backup si no hay usuario logueado
    if (!authStore.isAuthenticated) {
      return
    }
    
    // Verificar si debe hacer backup
    if (!appStore.shouldBackup || isBackingUp.value) {
      return
    }

    isBackingUp.value = true

    try {
      // Crear backup cifrado
      const result = await databaseService.createBackup()

      if (result.success && result.backupId) {
        // Marcar backup completado
        appStore.markBackupCompleted()
        lastBackupId.value = result.backupId

        // Limpiar backups antiguos (mantener últimos 5)
        await databaseService.cleanOldBackups(5)

        // Notificar éxito
        appStore.addNotification(
          'Copia de seguridad realizada con éxito',
          'info'
        )

      } else {
        // Notificar error
        appStore.addNotification(
          'No se pudo realizar la copia de seguridad. Por favor, contacte al administrador.',
          'error'
        )
        console.error('❌ Error en backup automático:', result.error)
      }
    } catch (error) {
      console.error('❌ Error crítico en backup automático:', error)
      appStore.addNotification(
        'Error al guardar la copia de seguridad. Verifique el espacio disponible.',
        'error'
      )
    } finally {
      isBackingUp.value = false
    }
  }

  /**
   * Inicia el timer de verificación de backups
   * Verifica cada 30 minutos si debe hacer backup según configuración
   */
  const iniciarTimer = (): void => {
    if (backupTimer) {
      clearInterval(backupTimer)
    }

    // Verificar cada 30 minutos si debe hacer backup
    // (el intervalo real está en appStore.config.backupInterval = 120 min)
    backupTimer = window.setInterval(() => {
      ejecutarBackupAutomatico()
    }, 30 * 60 * 1000) // 30 minutos

  }

  /**
   * Detiene el timer de backups
   */
  const detenerTimer = (): void => {
    if (backupTimer) {
      clearInterval(backupTimer)
      backupTimer = null
    }
  }

  /**
   * Fuerza un backup manual (sin importar intervalo)
   */
  const ejecutarBackupManual = async (): Promise<{ success: boolean; backupId?: string; error?: string }> => {
    if (isBackingUp.value) {
      return { success: false, error: 'Backup en progreso' }
    }

    isBackingUp.value = true

    try {
      const result = await databaseService.createBackup()

      if (result.success && result.backupId) {
        appStore.markBackupCompleted()
        lastBackupId.value = result.backupId
        
        appStore.addNotification(
          'Copia de seguridad manual realizada con éxito',
          'info'
        )
      }

      return result
    } catch (error) {
      const errorMsg = String(error)
      appStore.addNotification('No se pudo crear la copia de seguridad manual. Intente nuevamente.', 'error')
      return { success: false, error: errorMsg }
    } finally {
      isBackingUp.value = false
    }
  }

  // Watch: reiniciar timer si cambia configuración de autoBackup
  watch(
    () => appStore.config.autoBackup,
    (enabled) => {
      if (enabled) {
        iniciarTimer()
        // Ejecutar uno inmediatamente si es necesario
        ejecutarBackupAutomatico()
      } else {
        detenerTimer()
      }
    }
  )

  // Lifecycle: iniciar en mount
  onMounted(() => {
    if (appStore.config.autoBackup) {
      iniciarTimer()
      
      // ✅ EJECUTAR BACKUP INICIAL SOLO SI ESTÁ AUTENTICADO
      // El timer verificará la autenticación en cada ejecución
      if (!appStore.lastBackup && authStore.isAuthenticated) {
        setTimeout(() => ejecutarBackupAutomatico(), 5000) // 5 segundos después del mount
      }
    }
  })

  // Lifecycle: limpiar en unmount
  onUnmounted(() => {
    detenerTimer()
  })

  return {
    // Estado
    isBackingUp,
    lastBackupId,
    
    // Métodos
    ejecutarBackupAutomatico,
    ejecutarBackupManual,
    iniciarTimer,
    detenerTimer
  }
}
