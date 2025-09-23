import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useDatabase } from '@/composables/useDatabase'

export interface AuditEvent extends Record<string, unknown> {
  id: string
  userId: string
  username: string
  eventType: 'auth' | 'user_management' | 'data_operation' | 'backup' | 'system_error'
  action: string
  details: Record<string, unknown>
  timestamp: string
  sessionId: string
  ipAddress?: string
  userAgent?: string
}

export interface AuditFilter {
  userId?: string
  eventType?: AuditEvent['eventType']
  action?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}

/**
 * Store para gestionar los registros de auditoría del sistema.
 * Registra eventos críticos de seguridad de forma inmutable y cifrada.
 */
export const useAuditStore = defineStore('audit', () => {
  // State
  const auditLogs = ref<AuditEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Composables
  const { addRecord, getRecords, initDatabase } = useDatabase()

  // Getters
  const recentLogs = computed(() => 
    auditLogs.value.slice(-20).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  )

  const logsByType = computed(() => {
    const grouped: Record<string, AuditEvent[]> = {}
    auditLogs.value.forEach(log => {
      if (!grouped[log.eventType]) {
        grouped[log.eventType] = []
      }
      grouped[log.eventType].push(log)
    })
    return grouped
  })

  const criticalEvents = computed(() =>
    auditLogs.value.filter(log => 
      log.eventType === 'system_error' || 
      log.action.includes('failed') || 
      log.action.includes('blocked')
    )
  )

  const userActivity = computed(() => (userId: string) =>
    auditLogs.value.filter(log => log.userId === userId)
  )

  // Actions
  async function logEvent(eventData: {
    userId: string
    username: string
    eventType: AuditEvent['eventType']
    action: string
    details?: Record<string, unknown>
    sessionId: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      await initDatabase()

      const auditEvent: AuditEvent = {
        id: crypto.randomUUID(),
        userId: eventData.userId,
        username: eventData.username,
        eventType: eventData.eventType,
        action: eventData.action,
        details: eventData.details || {},
        timestamp: new Date().toISOString(),
        sessionId: eventData.sessionId,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent
      }

      // Persistir en IndexedDB cifrado
      const result = await addRecord('audit_logs', auditEvent)
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar evento de auditoría')
      }

      // Agregar al estado local para acceso rápido
      auditLogs.value.push(auditEvent)

      // Mantener solo los últimos 1000 eventos en memoria
      if (auditLogs.value.length > 1000) {
        auditLogs.value = auditLogs.value.slice(-1000)
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error logging audit event:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadAuditLogs(filter?: AuditFilter): Promise<void> {
    try {
      isLoading.value = true
      error.value = null

      await initDatabase()

      // Obtener todos los logs desde IndexedDB
      const result = await getRecords('audit_logs')
      let logs = result as AuditEvent[]

      // Aplicar filtros si se proporcionan
      if (filter) {
        logs = applyFilter(logs, filter)
      }

      // Ordenar por timestamp (más recientes primero)
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Aplicar límite si se especifica
      if (filter?.limit) {
        logs = logs.slice(0, filter.limit)
      }

      auditLogs.value = logs

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error loading audit logs:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function applyFilter(logs: AuditEvent[], filter: AuditFilter): AuditEvent[] {
    return logs.filter(log => {
      if (filter.userId && log.userId !== filter.userId) return false
      if (filter.eventType && log.eventType !== filter.eventType) return false
      if (filter.action && !log.action.includes(filter.action)) return false
      
      if (filter.startDate) {
        const logDate = new Date(log.timestamp)
        if (logDate < filter.startDate) return false
      }
      
      if (filter.endDate) {
        const logDate = new Date(log.timestamp)
        if (logDate > filter.endDate) return false
      }
      
      return true
    })
  }

  async function clearOldLogs(olderThanDays: number = 365): Promise<number> {
    try {
      isLoading.value = true
      error.value = null

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const oldLogs = auditLogs.value.filter(log => 
        new Date(log.timestamp) < cutoffDate
      )

      // En un escenario real, aquí se eliminarían de IndexedDB
      // Por ahora solo los removemos del estado local
      auditLogs.value = auditLogs.value.filter(log => 
        new Date(log.timestamp) >= cutoffDate
      )

      return oldLogs.length

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error clearing old logs:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearState(): void {
    auditLogs.value = []
    error.value = null
    isLoading.value = false
  }

  // Métodos de conveniencia para tipos específicos de eventos
  async function logAuthEvent(
    userId: string, 
    username: string, 
    action: string, 
    sessionId: string, 
    details?: Record<string, unknown>
  ): Promise<void> {
    return logEvent({
      userId,
      username,
      eventType: 'auth',
      action,
      sessionId,
      details
    })
  }

  async function logDataOperation(
    userId: string, 
    username: string, 
    action: string, 
    sessionId: string, 
    details?: Record<string, unknown>
  ): Promise<void> {
    return logEvent({
      userId,
      username,
      eventType: 'data_operation',
      action,
      sessionId,
      details
    })
  }

  async function logSystemError(
    userId: string, 
    username: string, 
    error: string, 
    sessionId: string, 
    details?: Record<string, unknown>
  ): Promise<void> {
    return logEvent({
      userId,
      username,
      eventType: 'system_error',
      action: `error: ${error}`,
      sessionId,
      details
    })
  }

  return {
    // State
    auditLogs,
    isLoading,
    error,
    // Getters
    recentLogs,
    logsByType,
    criticalEvents,
    userActivity,
    // Actions
    logEvent,
    loadAuditLogs,
    clearOldLogs,
    clearState,
    logAuthEvent,
    logDataOperation,
    logSystemError
  }
})
