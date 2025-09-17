import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { RegistroEntry } from '@/stores/registro'

// Mock useAppStore ANTES que useDatabase (dependencia)
const mockAppStore = {
  addNotification: vi.fn()
}

vi.mock('@/stores/app', () => ({
  useAppStore: () => mockAppStore
}))

// Mock useDatabase composable ANTES de importar DatabaseService
const mockUseDatabase = {
  initDatabase: vi.fn(),
  addRecord: vi.fn(), 
  getRecords: vi.fn(),
  clearStore: vi.fn(),
  isConnected: { value: false },
  config: {
    dbName: 'IRCCA_Sistema_DB',
    version: 1,
    stores: ['registros', 'usuarios', 'configuracion', 'backups']
  }
}

vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => mockUseDatabase
}))

// Mock encryptionService
const mockEncryptionService = {
  generateSecureId: vi.fn(() => 'mock-secure-id'),
  hashPassword: vi.fn(() => Promise.resolve({ hash: 'mock-hash', salt: 'mock-salt' })),
  encrypt: vi.fn(() => Promise.resolve({ 
    encrypted: 'mock-encrypted-data', 
    salt: 'mock-salt', 
    iv: 'mock-iv' 
  })),
  decrypt: vi.fn(() => Promise.resolve('{"documento": "12345678", "nombre": "Juan", "apellido": "Pérez"}'))
}

vi.mock('../encryptionService', () => ({
  encryptionService: mockEncryptionService
}))

// Ahora importar DatabaseService después de los mocks
const { DatabaseService } = await import('../databaseService')

// Mock crypto.subtle para las pruebas de sesión
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    exportKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    generateKey: vi.fn(),
  },
  getRandomValues: vi.fn(),
}

describe('DatabaseService', () => {
  let service: InstanceType<typeof DatabaseService>
  
  beforeEach(() => {
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
    
    // Limpiar todos los mocks PRIMERO
    vi.clearAllMocks()
    
    // DESPUÉS reconfigurar los mocks que necesitamos
    mockUseDatabase.initDatabase.mockResolvedValue({ success: true })
    mockUseDatabase.addRecord.mockResolvedValue({ success: true })
    mockUseDatabase.getRecords.mockResolvedValue([])
    
    // Mock global objects necesarios para crypto
    vi.stubGlobal('crypto', mockCrypto)
    vi.stubGlobal('btoa', vi.fn().mockReturnValue('mock-base64-key'))
    vi.stubGlobal('atob', vi.fn().mockReturnValue('mock-decoded-key'))
    vi.stubGlobal('TextEncoder', class {
      encode(str: string) { return new Uint8Array(str.split('').map(c => c.charCodeAt(0))) }
    })
    vi.stubGlobal('TextDecoder', class {
      decode() { return '{"documento": "12345678", "nombre": "Juan", "apellido": "Pérez"}' }
    })
    
    // Crear nueva instancia del servicio
    service = new DatabaseService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Inicialización', () => {
    it('debe inicializar la base de datos correctamente', async () => {
      // Configurar mock para respuesta exitosa
      mockUseDatabase.initDatabase.mockResolvedValue({ success: true })

      const result = await service.initialize()
      
      expect(result.success).toBe(true)
      expect(mockUseDatabase.initDatabase).toHaveBeenCalledTimes(1)
    })

    it('debe inicializar con clave de sesión correctamente', async () => {
      const userCredentials = 'admin:password123'
      
      // Mock crypto operations
      const mockKeyMaterial = {}
      const mockSessionKey = {}
      const mockSessionKeyBuffer = new ArrayBuffer(32)
      
      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial)
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockSessionKey)
      mockCrypto.subtle.exportKey.mockResolvedValue(mockSessionKeyBuffer)

      await service.initializeWithSessionKey(userCredentials)

      expect(mockCrypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      )
      
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PBKDF2',
          iterations: 100000,
          hash: 'SHA-256'
        }),
        mockKeyMaterial,
        expect.objectContaining({
          name: 'AES-GCM',
          length: 256
        }),
        true,
        ['encrypt', 'decrypt']
      )
    })

    it('debe limpiar la sesión correctamente', async () => {
      // Inicializar primero con crypto mocks
      const mockKeyMaterial = {}
      const mockSessionKey = {}
      const mockSessionKeyBuffer = new ArrayBuffer(32)
      
      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial)
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockSessionKey)
      mockCrypto.subtle.exportKey.mockResolvedValue(mockSessionKeyBuffer)
      
      await service.initializeWithSessionKey('test:credentials')
      
      // Limpiar sesión
      service.clearSession()
      
      // Intentar usar un método que requiere inicialización
      await expect(service.saveRegistro({} as RegistroEntry))
        .rejects.toThrow('DatabaseService debe ser inicializado con initializeWithSessionKey() antes de usar')
    })
  })

  describe('Ciclo completo: encrypt -> save -> get -> decrypt -> verify', () => {
    const testRegistro: RegistroEntry = {
      id: 'test-123',
      tipo: 'ingreso',
      timestamp: new Date('2025-09-15T10:00:00Z'),
      persona: {
        documento: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        motivo: 'Visita oficial'
      },
      vehiculo: {
        matricula: 'ABC1234',
        marca: 'Toyota',
        modelo: 'Corolla',
        conductor: 'Juan Pérez'
      },
      operadorId: 'op-001'
    }

    beforeEach(async () => {
      // Configurar crypto mocks para el ciclo completo
      const mockKeyMaterial = {}
      const mockSessionKey = {}
      const mockSessionKeyBuffer = new ArrayBuffer(32)
      
      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial)
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockSessionKey)
      mockCrypto.subtle.exportKey.mockResolvedValue(mockSessionKeyBuffer)

      // Inicializar el servicio con clave de sesión
      await service.initializeWithSessionKey('admin:password123')
    })

    it('debe cifrar, guardar, obtener y descifrar un registro correctamente', async () => {
      // 1. CONFIGURAR MOCKS PARA SAVE
      mockUseDatabase.addRecord.mockResolvedValue({ success: true })
      
      // 2. ENCRYPT & SAVE
      const saveResult = await service.saveRegistro(testRegistro)
      expect(saveResult.success).toBe(true)

      // Verificar que se llamó addRecord con datos cifrados
      expect(mockUseDatabase.addRecord).toHaveBeenCalledWith(
        'registros',
        expect.objectContaining({
          id: testRegistro.id,
          tipo: testRegistro.tipo,
          encrypted: true,
          persona: expect.objectContaining({
            encrypted: 'mock-encrypted-data',
            salt: 'mock-salt',
            iv: 'mock-iv'
          }),
          vehiculo: expect.objectContaining({
            encrypted: 'mock-encrypted-data',
            salt: 'mock-salt',
            iv: 'mock-iv'
          })
        })
      )

      // 3. CONFIGURAR MOCKS PARA GET
      const registrosCifrados = [{
        ...testRegistro,
        encrypted: true,
        persona: {
          encrypted: 'mock-encrypted-persona',
          salt: 'mock-salt',
          iv: 'mock-iv'
        },
        vehiculo: {
          encrypted: 'mock-encrypted-vehiculo', 
          salt: 'mock-salt',
          iv: 'mock-iv'
        }
      }]

      mockUseDatabase.getRecords.mockResolvedValue(registrosCifrados)

      // 4. GET & DECRYPT
      const registrosDescifrados = await service.getRegistros()

      // 5. VERIFY
      expect(registrosDescifrados).toHaveLength(1)
      expect(registrosDescifrados[0].id).toBe(testRegistro.id)
      expect(registrosDescifrados[0].tipo).toBe(testRegistro.tipo)
      expect(registrosDescifrados[0].persona).toEqual({
        documento: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez'
      })
      
      // Verificar que se llamó getRecords
      expect(mockUseDatabase.getRecords).toHaveBeenCalledWith('registros')
    })

    it('debe manejar errores de cifrado correctamente', async () => {
      // Mock error en el servicio de cifrado
      mockEncryptionService.encrypt.mockRejectedValue(new Error('Error de cifrado'))

      const result = await service.saveRegistro(testRegistro)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Error guardando registro')
    })

    it('debe manejar errores de descifrado correctamente', async () => {
      // Mock error en descifrado
      mockEncryptionService.decrypt.mockRejectedValue(new Error('Error de descifrado'))
      
      const registrosCifrados = [{
        ...testRegistro,
        encrypted: true,
        persona: {
          encrypted: 'invalid-encrypted-data',
          salt: 'mock-salt', 
          iv: 'mock-iv'
        }
      }]

      mockUseDatabase.getRecords.mockResolvedValue(registrosCifrados)

      const result = await service.getRegistros()
      
      // Debe devolver el registro pero con persona = null debido al error de descifrado
      expect(result).toHaveLength(1)
      expect(result[0].persona).toBeNull()
    })

    it('debe filtrar registros por tipo correctamente', async () => {
      // Crear registros sin cifrar (simplificado para test de filtrado)
      const registros = [
        { ...testRegistro, id: '1', tipo: 'ingreso' as const, encrypted: false },
        { ...testRegistro, id: '2', tipo: 'egreso' as const, encrypted: false },
        { ...testRegistro, id: '3', tipo: 'ingreso' as const, encrypted: false }
      ]

      mockUseDatabase.getRecords.mockResolvedValue(registros)

      const result = await service.getRegistros({ tipo: 'ingreso' })
      
      expect(result).toHaveLength(2)
      expect(result.every(r => r.tipo === 'ingreso')).toBe(true)
    })

    it('debe filtrar registros por fecha correctamente', async () => {
      // SOLUCIÓN: Usar la misma fecha base para ambos (siguiendo doc oficial Vitest)
      const fechaBase = '2025-09-15T12:00:00.000Z' // Fecha fija en UTC
      const fecha = new Date(fechaBase)
      
      // Crear registros usando fechas consistentes
      const registros = [
        { ...testRegistro, id: '1', timestamp: new Date('2025-09-15T10:00:00.000Z'), encrypted: false },
        { ...testRegistro, id: '2', timestamp: new Date('2025-09-16T10:00:00.000Z'), encrypted: false },
        { ...testRegistro, id: '3', timestamp: new Date('2025-09-15T15:00:00.000Z'), encrypted: false }
      ]

      console.log('🕒 DEBUG - Fechas con UTC explícito:')
      console.log('   Fecha filtro:', fecha.toDateString(), '(UTC):', fecha.toISOString())
      console.log('   Registro 1:', registros[0].timestamp.toDateString(), '- Match:', registros[0].timestamp.toDateString() === fecha.toDateString())
      console.log('   Registro 2:', registros[1].timestamp.toDateString(), '- Match:', registros[1].timestamp.toDateString() === fecha.toDateString())
      console.log('   Registro 3:', registros[2].timestamp.toDateString(), '- Match:', registros[2].timestamp.toDateString() === fecha.toDateString())

      // El servicio real obtiene TODOS los registros y luego filtra en memoria
      mockUseDatabase.getRecords.mockResolvedValue(registros)

      const result = await service.getRegistros({ fecha })
      
      console.log('✅ DEBUG - Resultado final:', result.length, 'registros filtrados')
      
      // Verificar que se llamó getRecords sin filtros (obtiene todos)
      expect(mockUseDatabase.getRecords).toHaveBeenCalledWith('registros')
      
      expect(result).toHaveLength(2)
      expect(result.every(r => new Date(r.timestamp).toDateString() === fecha.toDateString())).toBe(true)
    })
  })

  describe('Manejo de errores', () => {
    it('debe fallar si no está inicializado con clave de sesión', async () => {
      await expect(service.saveRegistro({} as RegistroEntry))
        .rejects.toThrow('DatabaseService debe ser inicializado con initializeWithSessionKey() antes de usar')
    })

    it('debe manejar errores de base de datos en initialize', async () => {
      mockUseDatabase.initDatabase.mockResolvedValue({ 
        success: false, 
        error: 'Error al abrir la base de datos' 
      })

      const result = await service.initialize()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Error al abrir la base de datos')
    })
  })
})
