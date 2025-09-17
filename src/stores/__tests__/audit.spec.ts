import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuditStore, type AuditEvent, type AuditFilter } from '../audit'

// Mock del composable useDatabase
const mockAddRecord = vi.fn()
const mockGetRecords = vi.fn()
const mockInitDatabase = vi.fn()

vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => ({
    addRecord: mockAddRecord,
    getRecords: mockGetRecords,
    initDatabase: mockInitDatabase
  })
}))

describe('useAuditStore', () => {
  beforeEach(() => {
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock crypto.randomUUID para IDs consistentes
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-audit-uuid-123')
    })
    
    // Mock successful database operations por defecto
    mockInitDatabase.mockResolvedValue(undefined)
    mockAddRecord.mockResolvedValue({ success: true })
    mockGetRecords.mockResolvedValue({ success: true, data: [] })
  })

  describe('Estado inicial', () => {
    it('debe tener estado inicial correcto', () => {
      const auditStore = useAuditStore()

      expect(auditStore.auditLogs).toEqual([])
      expect(auditStore.isLoading).toBe(false)
      expect(auditStore.error).toBeNull()
    })

    it('getters deben reflejar estado inicial vacío', () => {
      const auditStore = useAuditStore()

      expect(auditStore.recentLogs).toEqual([])
      expect(auditStore.logsByType).toEqual({})
      expect(auditStore.criticalEvents).toEqual([])
      expect(auditStore.userActivity('any-user')).toEqual([])
    })
  })

  describe('logEvent()', () => {
    it('debe registrar evento de auditoría exitosamente', async () => {
      const auditStore = useAuditStore()
      
      const eventData = {
        userId: 'user-123',
        username: 'testuser',
        eventType: 'auth' as const,
        action: 'login_success',
        sessionId: 'session-456',
        details: { ip: '192.168.1.1' }
      }

      await auditStore.logEvent(eventData)

      expect(mockInitDatabase).toHaveBeenCalledOnce()
      expect(mockAddRecord).toHaveBeenCalledWith('audit_logs', {
        id: 'test-audit-uuid-123',
        userId: 'user-123',
        username: 'testuser',
        eventType: 'auth',
        action: 'login_success',
        details: { ip: '192.168.1.1' },
        timestamp: expect.any(String),
        sessionId: 'session-456',
        ipAddress: undefined,
        userAgent: undefined
      })

      expect(auditStore.auditLogs).toHaveLength(1)
      expect(auditStore.auditLogs[0]).toMatchObject({
        id: 'test-audit-uuid-123',
        userId: 'user-123',
        username: 'testuser',
        eventType: 'auth',
        action: 'login_success'
      })
    })

    it('debe incluir campos opcionales cuando se proporcionan', async () => {
      const auditStore = useAuditStore()
      
      const eventData = {
        userId: 'user-123',
        username: 'testuser',
        eventType: 'auth' as const,
        action: 'login_success',
        sessionId: 'session-456',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 test browser'
      }

      await auditStore.logEvent(eventData)

      const savedEvent = auditStore.auditLogs[0]
      expect(savedEvent.ipAddress).toBe('192.168.1.100')
      expect(savedEvent.userAgent).toBe('Mozilla/5.0 test browser')
    })

    it('debe manejar errores de base de datos', async () => {
      const auditStore = useAuditStore()
      
      mockAddRecord.mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      })

      const eventData = {
        userId: 'user-123',
        username: 'testuser',
        eventType: 'auth' as const,
        action: 'login_success',
        sessionId: 'session-456'
      }

      await expect(auditStore.logEvent(eventData)).rejects.toThrow('Database connection failed')
      
      expect(auditStore.error).toBe('Database connection failed')
      expect(auditStore.isLoading).toBe(false)
      expect(auditStore.auditLogs).toHaveLength(0)
    })

    it('debe mantener límite de 1000 eventos en memoria', async () => {
      const auditStore = useAuditStore()
      
      // Simular 1005 eventos ya en memoria
      const existingEvents: AuditEvent[] = Array.from({ length: 1005 }, (_, i) => ({
        id: `event-${i}`,
        userId: 'user-123',
        username: 'testuser',
        eventType: 'auth',
        action: `action-${i}`,
        details: {},
        timestamp: new Date().toISOString(),
        sessionId: 'session-456'
      }))

      auditStore.auditLogs = existingEvents

      const eventData = {
        userId: 'user-124',
        username: 'newuser',
        eventType: 'auth' as const,
        action: 'new_action',
        sessionId: 'session-789'
      }

      await auditStore.logEvent(eventData)

      expect(auditStore.auditLogs).toHaveLength(1000)
      expect(auditStore.auditLogs[auditStore.auditLogs.length - 1].action).toBe('new_action')
    })
  })

  describe('loadAuditLogs()', () => {
    it('debe cargar logs desde base de datos', async () => {
      const auditStore = useAuditStore()
      
      const mockLogs: AuditEvent[] = [
        {
          id: 'log-1',
          userId: 'user-1',
          username: 'user1',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: '2023-01-01T10:00:00Z',
          sessionId: 'session-1'
        },
        {
          id: 'log-2',
          userId: 'user-2',
          username: 'user2',
          eventType: 'data_operation',
          action: 'create_record',
          details: {},
          timestamp: '2023-01-01T11:00:00Z',
          sessionId: 'session-2'
        }
      ]

      mockGetRecords.mockResolvedValue({
        success: true,
        data: mockLogs
      })

      await auditStore.loadAuditLogs()

      expect(mockInitDatabase).toHaveBeenCalledOnce()
      expect(mockGetRecords).toHaveBeenCalledWith('audit_logs')
      
      expect(auditStore.auditLogs).toHaveLength(2)
      expect(auditStore.auditLogs[0].id).toBe('log-2') // Más reciente primero
      expect(auditStore.auditLogs[1].id).toBe('log-1')
    })

    it('debe aplicar filtros correctamente', async () => {
      const auditStore = useAuditStore()
      
      const mockLogs: AuditEvent[] = [
        {
          id: 'log-1',
          userId: 'user-1',
          username: 'user1',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: '2023-01-01T10:00:00Z',
          sessionId: 'session-1'
        },
        {
          id: 'log-2',
          userId: 'user-2',
          username: 'user2',
          eventType: 'data_operation',
          action: 'create_record',
          details: {},
          timestamp: '2023-01-01T11:00:00Z',
          sessionId: 'session-2'
        },
        {
          id: 'log-3',
          userId: 'user-1',
          username: 'user1',
          eventType: 'system_error',
          action: 'database_error',
          details: {},
          timestamp: '2023-01-01T12:00:00Z',
          sessionId: 'session-3'
        }
      ]

      mockGetRecords.mockResolvedValue({
        success: true,
        data: mockLogs
      })

      const filter: AuditFilter = {
        userId: 'user-1',
        eventType: 'auth'
      }

      await auditStore.loadAuditLogs(filter)

      expect(auditStore.auditLogs).toHaveLength(1)
      expect(auditStore.auditLogs[0].id).toBe('log-1')
    })

    it('debe aplicar límite cuando se especifica', async () => {
      const auditStore = useAuditStore()
      
      const mockLogs: AuditEvent[] = Array.from({ length: 10 }, (_, i) => ({
        id: `log-${i}`,
        userId: 'user-1',
        username: 'user1',
        eventType: 'auth',
        action: `action-${i}`,
        details: {},
        timestamp: new Date(2023, 0, 1, 10, i).toISOString(),
        sessionId: 'session-1'
      }))

      mockGetRecords.mockResolvedValue({
        success: true,
        data: mockLogs
      })

      await auditStore.loadAuditLogs({ limit: 5 })

      expect(auditStore.auditLogs).toHaveLength(5)
    })

    it('debe manejar errores al cargar logs', async () => {
      const auditStore = useAuditStore()
      
      mockGetRecords.mockResolvedValue({
        success: false,
        error: 'Failed to access database'
      })

      await expect(auditStore.loadAuditLogs()).rejects.toThrow('Failed to access database')
      
      expect(auditStore.error).toBe('Failed to access database')
      expect(auditStore.isLoading).toBe(false)
    })
  })

  describe('Getters computados', () => {
    beforeEach(async () => {
      const auditStore = useAuditStore()
      
      // Agregar eventos de prueba
      const testEvents: AuditEvent[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          username: 'user1',
          eventType: 'auth',
          action: 'login_success',
          details: {},
          timestamp: '2023-01-01T10:00:00Z',
          sessionId: 'session-1'
        },
        {
          id: 'event-2',
          userId: 'user-2',
          username: 'user2',
          eventType: 'system_error',
          action: 'database_failed',
          details: {},
          timestamp: '2023-01-01T11:00:00Z',
          sessionId: 'session-2'
        },
        {
          id: 'event-3',
          userId: 'user-1',
          username: 'user1',
          eventType: 'auth',
          action: 'login_blocked',
          details: {},
          timestamp: '2023-01-01T12:00:00Z',
          sessionId: 'session-3'
        }
      ]

      auditStore.auditLogs = testEvents
    })

    it('recentLogs debe retornar últimos 20 ordenados por timestamp', () => {
      const auditStore = useAuditStore()
      
      const recent = auditStore.recentLogs
      
      expect(recent).toHaveLength(3)
      expect(recent[0].id).toBe('event-3') // Más reciente
      expect(recent[1].id).toBe('event-2')
      expect(recent[2].id).toBe('event-1') // Más antiguo
    })

    it('logsByType debe agrupar por tipo de evento', () => {
      const auditStore = useAuditStore()
      
      const byType = auditStore.logsByType
      
      expect(byType).toHaveProperty('auth')
      expect(byType).toHaveProperty('system_error')
      expect(byType.auth).toHaveLength(2)
      expect(byType.system_error).toHaveLength(1)
    })

    it('criticalEvents debe filtrar eventos críticos', () => {
      const auditStore = useAuditStore()
      
      const critical = auditStore.criticalEvents
      
      expect(critical).toHaveLength(2) // system_error + login_blocked
      expect(critical.some(e => e.eventType === 'system_error')).toBe(true)
      expect(critical.some(e => e.action.includes('blocked'))).toBe(true)
    })

    it('userActivity debe filtrar por usuario específico', () => {
      const auditStore = useAuditStore()
      
      const user1Activity = auditStore.userActivity('user-1')
      const user2Activity = auditStore.userActivity('user-2')
      
      expect(user1Activity).toHaveLength(2)
      expect(user2Activity).toHaveLength(1)
      expect(user1Activity.every(e => e.userId === 'user-1')).toBe(true)
    })
  })

  describe('Filtros por fecha', () => {
    it('debe filtrar por rango de fechas', async () => {
      const auditStore = useAuditStore()
      
      const mockLogs: AuditEvent[] = [
        {
          id: 'log-1',
          userId: 'user-1',
          username: 'user1',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: '2023-01-01T10:00:00Z',
          sessionId: 'session-1'
        },
        {
          id: 'log-2',
          userId: 'user-2',
          username: 'user2',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: '2023-01-15T10:00:00Z',
          sessionId: 'session-2'
        },
        {
          id: 'log-3',
          userId: 'user-3',
          username: 'user3',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: '2023-02-01T10:00:00Z',
          sessionId: 'session-3'
        }
      ]

      mockGetRecords.mockResolvedValue({
        success: true,
        data: mockLogs
      })

      const filter: AuditFilter = {
        startDate: new Date('2023-01-10'),
        endDate: new Date('2023-01-20')
      }

      await auditStore.loadAuditLogs(filter)

      expect(auditStore.auditLogs).toHaveLength(1)
      expect(auditStore.auditLogs[0].id).toBe('log-2')
    })
  })

  describe('clearOldLogs()', () => {
    it('debe eliminar logs antiguos basado en días', async () => {
      const auditStore = useAuditStore()
      
      const now = new Date()
      const oldDate = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000) // 400 días atrás
      const recentDate = new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000) // 300 días atrás

      auditStore.auditLogs = [
        {
          id: 'old-log',
          userId: 'user-1',
          username: 'user1',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: oldDate.toISOString(),
          sessionId: 'session-1'
        },
        {
          id: 'recent-log',
          userId: 'user-2',
          username: 'user2',
          eventType: 'auth',
          action: 'login',
          details: {},
          timestamp: recentDate.toISOString(),
          sessionId: 'session-2'
        }
      ]

      const deletedCount = await auditStore.clearOldLogs(365) // Eliminar logs > 365 días

      expect(deletedCount).toBe(1)
      expect(auditStore.auditLogs).toHaveLength(1)
      expect(auditStore.auditLogs[0].id).toBe('recent-log')
    })
  })

  describe('Métodos de conveniencia', () => {
    it('logAuthEvent debe registrar evento de autenticación', async () => {
      const auditStore = useAuditStore()
      
      await auditStore.logAuthEvent(
        'user-123',
        'testuser',
        'login_success',
        'session-456',
        { method: 'password' }
      )

      expect(mockAddRecord).toHaveBeenCalledWith('audit_logs', expect.objectContaining({
        eventType: 'auth',
        action: 'login_success',
        details: { method: 'password' }
      }))
    })

    it('logDataOperation debe registrar operación de datos', async () => {
      const auditStore = useAuditStore()
      
      await auditStore.logDataOperation(
        'user-123',
        'testuser',
        'create_record',
        'session-456',
        { recordId: 'record-789' }
      )

      expect(mockAddRecord).toHaveBeenCalledWith('audit_logs', expect.objectContaining({
        eventType: 'data_operation',
        action: 'create_record',
        details: { recordId: 'record-789' }
      }))
    })

    it('logSystemError debe registrar error del sistema', async () => {
      const auditStore = useAuditStore()
      
      await auditStore.logSystemError(
        'user-123',
        'testuser',
        'Database connection failed',
        'session-456',
        { errorCode: 'DB_001' }
      )

      expect(mockAddRecord).toHaveBeenCalledWith('audit_logs', expect.objectContaining({
        eventType: 'system_error',
        action: 'error: Database connection failed',
        details: { errorCode: 'DB_001' }
      }))
    })
  })

  describe('clearState()', () => {
    it('debe limpiar todo el estado', () => {
      const auditStore = useAuditStore()
      
      // Establecer algún estado
      auditStore.auditLogs = [{
        id: 'test',
        userId: 'user-1',
        username: 'user1',
        eventType: 'auth',
        action: 'test',
        details: {},
        timestamp: new Date().toISOString(),
        sessionId: 'session-1'
      }]
      auditStore.error = 'Some error'
      auditStore.isLoading = true

      auditStore.clearState()

      expect(auditStore.auditLogs).toEqual([])
      expect(auditStore.error).toBeNull()
      expect(auditStore.isLoading).toBe(false)
    })
  })
})
