import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useDatabase } from '@/composables/useDatabase'

export interface AppConfig {
  kioskMode: boolean
  autoBackup: boolean
  backupInterval: number // minutos
  maxRegistrosMemoria: number
  theme: 'light' | 'dark'
  destinos: string[] // ⭐ NUEVO: Lista dinámica de destinos
}

export const useAppStore = defineStore('app', () => {
  // State
  const config = ref<AppConfig>({
    kioskMode: true,
    autoBackup: true,
    backupInterval: 120, // Intervalo en minutos para backups automáticos (2 horas)
    maxRegistrosMemoria: 1000,
    theme: 'light',
    destinos: ['IRCCA', 'Ligeral', 'Simbiosys', 'Jabelor', 'Otra'], // ⭐ Valores por defecto
  })

  const isOnline = ref(navigator.onLine)
  const lastBackup = ref<Date | null>(null)
  const notifications = ref<
    Array<{ id: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; timestamp: Date }>
  >([])

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
    notifications.value.filter((n) => n.type === 'warning' || n.type === 'error'),
  )

  // Actions
  function updateConfig(newConfig: Partial<AppConfig>) {
    config.value = { ...config.value, ...newConfig }
    // TODO: Guardar en localStorage cifrado
  }

  function setOnlineStatus(status: boolean) {
    isOnline.value = status
  }

  function addNotification(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') {
    const notification = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: new Date(),
    }
    notifications.value.unshift(notification)

    // Mantener solo las últimas 50 notificaciones
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
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

  // ⭐ NUEVO: Actualizar destinos y guardar en IndexedDB
  async function updateDestinos(nuevosDestinos: string[]) {
    // ✅ Convertir a array plano para evitar DataCloneError
    const destinosPlanos = [...nuevosDestinos]
    config.value.destinos = destinosPlanos
    
    const { saveRecord, initDatabase } = useDatabase()
    
    try {
      // Asegurar que la base de datos esté inicializada
      await initDatabase()
      
      // Guardar en IndexedDB (datos planos, no reactivos)
      await saveRecord('configuracion', {
        key: 'destinos',
        value: destinosPlanos,  // ✅ Array plano, no Proxy
        updatedAt: new Date().toISOString()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error al guardar destinos:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
  }

  // ⭐ NUEVO: Cargar destinos desde IndexedDB
  async function loadConfigFromDB() {
    const { getRecord, initDatabase } = useDatabase()
    
    try {
      // Asegurar que la base de datos esté inicializada
      await initDatabase()
      
      // Intentar cargar destinos desde IndexedDB
      const destinosConfig = await getRecord('configuracion', 'destinos') as { key: string; value: string[] } | undefined
      
      if (destinosConfig && Array.isArray(destinosConfig.value) && destinosConfig.value.length > 0) {
        // ✅ Convertir a array plano al cargar
        config.value.destinos = [...destinosConfig.value]
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
    }
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
    markBackupCompleted,
    updateDestinos,
    loadConfigFromDB,
  }
})
