import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore, type AppConfig } from '../app'

describe('useAppStore', () => {
  beforeEach(() => {
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
    // Mock crypto.randomUUID para IDs consistentes
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid-123')
    })
    // Mock navigator.onLine
    vi.stubGlobal('navigator', {
      onLine: true
    })
  })

  describe('Estado inicial', () => {
    it('debe tener configuración inicial correcta', () => {
      const appStore = useAppStore()

      expect(appStore.config).toEqual({
        kioskMode: true,
        autoBackup: true,
        backupInterval: 30,
        maxRegistrosMemoria: 1000,
        theme: 'light'
      })
    })

    it('debe tener valores iniciales correctos', () => {
      const appStore = useAppStore()

      expect(appStore.isOnline).toBe(true) // Basado en navigator.onLine mock
      expect(appStore.lastBackup).toBeNull()
      expect(appStore.notifications).toEqual([])
    })

    it('getters deben reflejar estado inicial', () => {
      const appStore = useAppStore()

      expect(appStore.shouldBackup).toBe(true) // No hay lastBackup
      expect(appStore.pendingNotifications).toEqual([])
    })
  })

  describe('Gestión de configuración', () => {
    it('debe actualizar configuración parcialmente', () => {
      const appStore = useAppStore()
      
      const partialConfig: Partial<AppConfig> = {
        kioskMode: false,
        theme: 'dark'
      }

      appStore.updateConfig(partialConfig)

      expect(appStore.config).toEqual({
        kioskMode: false,
        autoBackup: true,
        backupInterval: 30,
        maxRegistrosMemoria: 1000,
        theme: 'dark'
      })
    })

    it('debe actualizar configuración completa', () => {
      const appStore = useAppStore()
      
      const newConfig: AppConfig = {
        kioskMode: false,
        autoBackup: false,
        backupInterval: 60,
        maxRegistrosMemoria: 500,
        theme: 'dark'
      }

      appStore.updateConfig(newConfig)

      expect(appStore.config).toEqual(newConfig)
    })

    it('debe mantener valores no especificados', () => {
      const appStore = useAppStore()
      
      appStore.updateConfig({ backupInterval: 45 })

      expect(appStore.config.kioskMode).toBe(true) // Valor original
      expect(appStore.config.backupInterval).toBe(45) // Valor actualizado
      expect(appStore.config.theme).toBe('light') // Valor original
    })
  })

  describe('Estado de conexión', () => {
    it('debe actualizar estado online', () => {
      const appStore = useAppStore()
      
      expect(appStore.isOnline).toBe(true)
      
      appStore.setOnlineStatus(false)
      expect(appStore.isOnline).toBe(false)
      
      appStore.setOnlineStatus(true)
      expect(appStore.isOnline).toBe(true)
    })
  })

  describe('Sistema de notificaciones', () => {
    it('debe agregar notificación con tipo por defecto', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Mensaje de prueba')

      expect(appStore.notifications).toHaveLength(1)
      expect(appStore.notifications[0]).toEqual({
        id: 'test-uuid-123',
        message: 'Mensaje de prueba',
        type: 'info',
        timestamp: expect.any(Date)
      })
    })

    it('debe agregar notificación con tipo específico', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Error crítico', 'error')

      expect(appStore.notifications[0]).toEqual({
        id: 'test-uuid-123',
        message: 'Error crítico',
        type: 'error',
        timestamp: expect.any(Date)
      })
    })

    it('debe agregar múltiples notificaciones en orden LIFO', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Primera notificación', 'info')
      appStore.addNotification('Segunda notificación', 'warning')
      appStore.addNotification('Tercera notificación', 'error')

      expect(appStore.notifications).toHaveLength(3)
      expect(appStore.notifications[0].message).toBe('Tercera notificación')
      expect(appStore.notifications[1].message).toBe('Segunda notificación')
      expect(appStore.notifications[2].message).toBe('Primera notificación')
    })

    it('debe limitar notificaciones a 50 máximo', () => {
      const appStore = useAppStore()
      
      // Agregar 55 notificaciones
      for (let i = 1; i <= 55; i++) {
        appStore.addNotification(`Notificación ${i}`)
      }

      expect(appStore.notifications).toHaveLength(50)
      expect(appStore.notifications[0].message).toBe('Notificación 55') // Más reciente
      expect(appStore.notifications[49].message).toBe('Notificación 6') // Más antigua conservada
    })

    it('debe remover notificación por ID', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Primera', 'info')
      appStore.addNotification('Segunda', 'warning') 
      
      // Verificar el orden inicial LIFO (más reciente primero)
      expect(appStore.notifications[0].message).toBe('Segunda')
      expect(appStore.notifications[1].message).toBe('Primera')
      
      // Remover la segunda notificación añadida (que está en posición [0])
      const segundaNotificationId = appStore.notifications[0].id
      appStore.removeNotification(segundaNotificationId)

      expect(appStore.notifications).toHaveLength(1)
      expect(appStore.notifications[0].message).toBe('Primera') // Queda la primera (más antigua)
    })

    it('debe ignorar ID inexistente al remover notificación', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Única notificación')
      const originalLength = appStore.notifications.length
      
      appStore.removeNotification('id-inexistente')

      expect(appStore.notifications).toHaveLength(originalLength)
    })

    it('debe limpiar todas las notificaciones', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Primera', 'info')
      appStore.addNotification('Segunda', 'warning')
      appStore.addNotification('Tercera', 'error')
      
      expect(appStore.notifications).toHaveLength(3)
      
      appStore.clearNotifications()
      
      expect(appStore.notifications).toHaveLength(0)
    })
  })

  describe('Getters computados', () => {
    it('pendingNotifications debe filtrar solo warning y error', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Info message', 'info')
      appStore.addNotification('Warning message', 'warning')
      appStore.addNotification('Error message', 'error')
      appStore.addNotification('Another info', 'info')

      const pending = appStore.pendingNotifications

      expect(pending).toHaveLength(2)
      expect(pending[0].message).toBe('Error message')
      expect(pending[1].message).toBe('Warning message')
      expect(pending.every(n => n.type === 'warning' || n.type === 'error')).toBe(true)
    })

    it('pendingNotifications debe estar vacío sin notificaciones críticas', () => {
      const appStore = useAppStore()
      
      appStore.addNotification('Info 1', 'info')
      appStore.addNotification('Info 2', 'info')

      expect(appStore.pendingNotifications).toHaveLength(0)
    })
  })

  describe('Gestión de backups', () => {
    it('shouldBackup debe ser true sin backup previo', () => {
      const appStore = useAppStore()
      
      expect(appStore.lastBackup).toBeNull()
      expect(appStore.shouldBackup).toBe(true)
    })

    it('shouldBackup debe ser false si autoBackup está deshabilitado', () => {
      const appStore = useAppStore()
      
      appStore.updateConfig({ autoBackup: false })
      
      expect(appStore.shouldBackup).toBe(false)
    })

    it('shouldBackup debe ser false si el backup es reciente', () => {
      const appStore = useAppStore()
      
      // Marcar backup hace 15 minutos (menos que el intervalo de 30)
      const recentBackup = new Date(Date.now() - 15 * 60 * 1000)
      appStore.lastBackup = recentBackup
      
      expect(appStore.shouldBackup).toBe(false)
    })

    it('shouldBackup debe ser true si el backup es antiguo', () => {
      const appStore = useAppStore()
      
      // Marcar backup hace 45 minutos (más que el intervalo de 30)
      const oldBackup = new Date(Date.now() - 45 * 60 * 1000)
      appStore.lastBackup = oldBackup
      
      expect(appStore.shouldBackup).toBe(true)
    })

    it('shouldBackup debe respetar intervalo personalizado', () => {
      const appStore = useAppStore()
      
      // Cambiar intervalo a 60 minutos
      appStore.updateConfig({ backupInterval: 60 })
      
      // Backup hace 45 minutos
      const recentBackup = new Date(Date.now() - 45 * 60 * 1000)
      appStore.lastBackup = recentBackup
      
      expect(appStore.shouldBackup).toBe(false) // Aún es reciente para 60 min
      
      // Backup hace 75 minutos
      const oldBackup = new Date(Date.now() - 75 * 60 * 1000)
      appStore.lastBackup = oldBackup
      
      expect(appStore.shouldBackup).toBe(true) // Ahora es antiguo
    })

    it('debe marcar backup como completado', () => {
      const appStore = useAppStore()
      
      expect(appStore.lastBackup).toBeNull()
      
      appStore.markBackupCompleted()
      
      expect(appStore.lastBackup).toBeInstanceOf(Date)
      expect(appStore.lastBackup!.getTime()).toBeCloseTo(Date.now(), -2) // Dentro de 100ms
    })

    it('debe actualizar shouldBackup después de marcar backup', () => {
      const appStore = useAppStore()
      
      expect(appStore.shouldBackup).toBe(true) // Sin backup previo
      
      appStore.markBackupCompleted()
      
      expect(appStore.shouldBackup).toBe(false) // Backup reciente
    })
  })

  describe('Integración de funcionalidades', () => {
    it('debe manejar ciclo completo de configuración y backup', () => {
      const appStore = useAppStore()
      
      // Configurar intervalo corto para testing
      appStore.updateConfig({ backupInterval: 1 }) // 1 minuto
      
      // Simular backup antiguo
      const oldBackup = new Date(Date.now() - 2 * 60 * 1000) // 2 minutos atrás
      appStore.lastBackup = oldBackup
      
      expect(appStore.shouldBackup).toBe(true)
      
      // Completar backup
      appStore.markBackupCompleted()
      
      expect(appStore.shouldBackup).toBe(false)
    })

    it('debe manejar notificaciones de diferentes tipos junto con configuración', () => {
      const appStore = useAppStore()
      
      // Configurar modo kiosk
      appStore.updateConfig({ kioskMode: true })
      
      // Agregar notificaciones
      appStore.addNotification('Sistema iniciado', 'info')
      appStore.addNotification('Modo kiosk activado', 'warning')
      
      expect(appStore.config.kioskMode).toBe(true)
      expect(appStore.notifications).toHaveLength(2)
      expect(appStore.pendingNotifications).toHaveLength(1) // Solo warning
      
      // Cambiar estado online
      appStore.setOnlineStatus(false)
      appStore.addNotification('Sin conexión a internet', 'error')
      
      expect(appStore.isOnline).toBe(false)
      expect(appStore.pendingNotifications).toHaveLength(2) // warning + error
    })
  })
})
