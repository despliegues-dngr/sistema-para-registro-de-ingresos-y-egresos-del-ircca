import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface AppConfig {
  kioskMode: boolean
  autoBackup: boolean
  backupInterval: number // minutos
  maxRegistrosMemoria: number
  theme: 'light' | 'dark'
}

export const useAppStore = defineStore('app', () => {
  // State
  const config = ref<AppConfig>({
    kioskMode: true,
    autoBackup: true,
    backupInterval: 30,
    maxRegistrosMemoria: 1000,
    theme: 'light'
  })
  
  const isOnline = ref(navigator.onLine)
  const lastBackup = ref<Date | null>(null)
  const notifications = ref<Array<{ id: string, message: string, type: 'info' | 'warning' | 'error', timestamp: Date }>>([])
  
  // Getters
  const shouldBackup = computed(() => {
    if (!config.value.autoBackup) return false
    if (!lastBackup.value) return true
    
    const now = new Date()
    const diff = now.getTime() - lastBackup.value.getTime()
    const diffMinutes = diff / (1000 * 60)
    
    return diffMinutes >= config.value.backupInterval
  })
  
  const pendingNotifications = computed(() => 
    notifications.value.filter(n => n.type === 'warning' || n.type === 'error')
  )
  
  // Actions
  function updateConfig(newConfig: Partial<AppConfig>) {
    config.value = { ...config.value, ...newConfig }
    // TODO: Guardar en localStorage cifrado
  }
  
  function setOnlineStatus(status: boolean) {
    isOnline.value = status
  }
  
  function addNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    const notification = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: new Date()
    }
    notifications.value.unshift(notification)
    
    // Mantener solo las últimas 50 notificaciones
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }
  
  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function clearNotifications() {
    notifications.value = []
  }
  
  function markBackupCompleted() {
    lastBackup.value = new Date()
  }

  return {
    // State
    config,
    isOnline,
    lastBackup,
    notifications,
    // Getters
    shouldBackup,
    pendingNotifications,
    // Actions
    updateConfig,
    setOnlineStatus,
    addNotification,
    removeNotification,
    clearNotifications,
    markBackupCompleted
  }
})
