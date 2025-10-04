import { ref, onMounted, onUnmounted, readonly } from 'vue'
import { useAppStore } from '@/stores/app'

export interface StorageInfo {
  usage: number
  quota: number
  available: number
  usagePercentage: number
  isPersistent: boolean
}

export const useStorageMonitor = () => {
  const appStore = useAppStore()
  const storageInfo = ref<StorageInfo>({
    usage: 0,
    quota: 0,
    available: 0,
    usagePercentage: 0,
    isPersistent: false
  })

  let monitorInterval: number | null = null

  // Verificar si el almacenamiento es persistente
  const checkPersistentStatus = async (): Promise<boolean> => {
    try {
      if ('storage' in navigator && 'persisted' in navigator.storage) {
        return await navigator.storage.persisted()
      }
    } catch {
      // Error silencioso
    }
    return false
  }

  // Obtener información detallada del almacenamiento
  const updateStorageInfo = async (): Promise<StorageInfo> => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const available = quota - usage
        const usagePercentage = quota > 0 ? (usage / quota) * 100 : 0
        const isPersistent = await checkPersistentStatus()

        const info: StorageInfo = {
          usage,
          quota,
          available,
          usagePercentage,
          isPersistent
        }

        storageInfo.value = info

        // Alertas basadas en el uso
        if (usagePercentage > 90) {
          appStore.addNotification(
            'Almacenamiento crítico: Más del 90% usado. Considere realizar respaldo y limpieza.',
            'error'
          )
        } else if (usagePercentage > 75) {
          appStore.addNotification(
            'Almacenamiento alto: Más del 75% usado. Recuerde realizar respaldos periódicos.',
            'warning'
          )
        }

        return info
      }
    } catch {
      // Error silencioso
    }

    return storageInfo.value
  }

  // Iniciar monitoreo automático
  const startMonitoring = (intervalMinutes: number = 30) => {
    // Actualizar inmediatamente
    updateStorageInfo()
    
    // Configurar intervalo para actualizaciones periódicas
    monitorInterval = window.setInterval(() => {
      updateStorageInfo()
    }, intervalMinutes * 60 * 1000) // Convertir minutos a milisegundos
  }

  // Detener monitoreo
  const stopMonitoring = () => {
    if (monitorInterval) {
      clearInterval(monitorInterval)
      monitorInterval = null
    }
  }

  // Obtener resumen legible del almacenamiento
  const getStorageSummary = (): string => {
    const info = storageInfo.value
    const usageMB = (info.usage / 1024 / 1024).toFixed(2)
    const quotaMB = (info.quota / 1024 / 1024).toFixed(2)
    
    return `${usageMB} MB de ${quotaMB} MB utilizados (${info.usagePercentage.toFixed(1)}%) - ${info.isPersistent ? 'Persistente' : 'No persistente'}`
  }

  // Solicitar persistencia si no está activada
  const ensurePersistence = async (): Promise<boolean> => {
    try {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        // 1. Verificar estado actual ANTES de solicitar
        const wasPersistent = await navigator.storage.persisted()
        
        // ✅ Si ya es persistente, no solicitar de nuevo
        if (wasPersistent) {
          await updateStorageInfo()
          appStore.addNotification('Almacenamiento persistente confirmado', 'info')
          return true
        }
        
        // 2. Solo solicitar si NO es persistente
        const isPersistent = await navigator.storage.persist()
        
        // 3. Actualizar información después de solicitar persistencia
        await updateStorageInfo()
        
        // 4. Notificar resultado
        if (isPersistent) {
          if (wasPersistent) {
            appStore.addNotification('Almacenamiento persistente confirmado', 'info')
          } else {
            appStore.addNotification('Almacenamiento persistente activado exitosamente', 'info')
          }
        } else {
          appStore.addNotification(
            'No se pudo activar almacenamiento persistente. Los datos podrían eliminarse automáticamente. Instale la PWA para garantizar persistencia.',
            'warning'
          )
        }
        
        return isPersistent
      }
    } catch {
      appStore.addNotification('Error al configurar persistencia de almacenamiento', 'error')
    }
    
    return false
  }

  // Lifecycle hooks para modo composable
  onMounted(() => {
    // Iniciar monitoreo automático cuando se monta el componente
    startMonitoring(30) // Cada 30 minutos
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    // State
    storageInfo: readonly(storageInfo),
    // Methods
    updateStorageInfo,
    startMonitoring,
    stopMonitoring,
    getStorageSummary,
    ensurePersistence,
    checkPersistentStatus
  }
}
