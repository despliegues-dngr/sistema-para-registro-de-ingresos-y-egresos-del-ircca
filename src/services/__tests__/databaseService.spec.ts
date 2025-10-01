import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { RegistroEntry, RegistroIngreso } from '@/stores/registro'

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
  // ✅ MOCK DINÁMICO: Retorna diferentes estructuras según el contenido que se descifre
  decrypt: vi.fn((encryptedData) => {
    // Simular descifrado de persona completa (datosPersonales + datosVisita + observaciones)
    if (encryptedData.includes('persona') || encryptedData === 'mock-encrypted-data') {
      return Promise.resolve(JSON.stringify({
        datosPersonales: {
          cedula: '12345678',
          nombre: 'Juan',
          apellido: 'Pérez'
        },
        datosVisita: {
          destino: 'IRCCA'
        }
      }))
    }
    // Simular descifrado de vehículo
    if (encryptedData.includes('vehiculo')) {
      return Promise.resolve(JSON.stringify({
        tipo: 'Auto',
        matricula: 'ABC1234'
      }))
    }
    // Simular descifrado de acompañantes
    if (encryptedData.includes('acompanantes')) {
      return Promise.resolve(JSON.stringify([]))
    }
    // Default para casos simples
    return Promise.resolve(JSON.stringify({
      cedula: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez'
    }))
  })
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
      decode() { return '{"cedula": "12345678", "nombre": "Juan", "apellido": "Pérez"}' }
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

    it('debe inicializar con una clave de sesión', async () => {
      // Mock crypto operations
      const mockKeyMaterial = {}
      const mockSessionKey = {}
      const mockSessionKeyBuffer = new Uint8Array(32)
      
      mockCrypto.subtle.importKey.mockResolvedValue(mockKeyMaterial)
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockSessionKey)
      mockCrypto.subtle.exportKey.mockResolvedValue(mockSessionKeyBuffer)

      await service.initializeWithSessionKey()

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
      
      await service.initializeWithSessionKey()
      
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
      datosPersonales: {
        cedula: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez'
      },
      datosVisita: {
        destino: 'IRCCA'
      },
      datosVehiculo: {
        tipo: 'Auto',
        matricula: 'ABC1234'
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
      await service.initializeWithSessionKey()
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
        id: testRegistro.id,
        tipo: 'ingreso',
        timestamp: testRegistro.timestamp,
        operadorId: testRegistro.operadorId,
        encrypted: true,
        persona: {
          encrypted: 'mock-encrypted-persona-data',
          salt: 'mock-salt',
          iv: 'mock-iv'
        },
        vehiculo: {
          encrypted: 'mock-encrypted-vehiculo-data', 
          salt: 'mock-salt',
          iv: 'mock-iv'
        }
      }]

      // ✅ Configurar mock específico para estos datos cifrados
      mockEncryptionService.decrypt.mockImplementation((encryptedData) => {
        if (encryptedData === 'mock-encrypted-persona-data') {
          return Promise.resolve(JSON.stringify({
            datosPersonales: {
              cedula: '12345678',
              nombre: 'Juan',
              apellido: 'Pérez'
            },
            datosVisita: {
              destino: 'IRCCA'
            }
          }))
        }
        if (encryptedData === 'mock-encrypted-vehiculo-data') {
          return Promise.resolve(JSON.stringify({
            tipo: 'Auto',
            matricula: 'ABC1234'
          }))
        }
        return Promise.resolve('{}')
      })

      mockUseDatabase.getRecords.mockResolvedValue(registrosCifrados)

      // 4. GET & DECRYPT
      const registrosDescifrados = await service.getRegistros()

      // 5. VERIFY
      expect(registrosDescifrados).toHaveLength(1)
      expect(registrosDescifrados[0].id).toBe(testRegistro.id)
      expect(registrosDescifrados[0].tipo).toBe(testRegistro.tipo)
      const registroIngreso = registrosDescifrados[0] as RegistroIngreso
      expect(registroIngreso.datosPersonales).toEqual({
        cedula: '12345678',
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
        id: 'test-123',
        tipo: 'ingreso' as const,
        timestamp: new Date(),
        operadorId: 'op-001',
        encrypted: true,
        persona: {
          encrypted: 'invalid-encrypted-data',
          salt: 'mock-salt', 
          iv: 'mock-iv'
        }
      }]

      mockUseDatabase.getRecords.mockResolvedValue(registrosCifrados)

      const result = await service.getRegistros()
      
      // ✅ CORRECCIÓN: El sistema omite registros con errores de descifrado
      // Basado en los logs: "✅ [DEBUG] Registros descifrados exitosamente: 0"
      expect(result).toHaveLength(0)
    })

    it('debe filtrar registros por tipo correctamente', async () => {
      // ✅ Usar registros cifrados como en el sistema real
      const registrosCifrados = [
        {
          id: '1', 
          tipo: 'ingreso' as const, 
          timestamp: new Date(),
          operadorId: 'op-001',
          encrypted: true,
          persona: { encrypted: 'mock-data-1', salt: 'salt', iv: 'iv' }
        },
        {
          id: '2', 
          tipo: 'salida' as const, 
          timestamp: new Date(),
          operadorId: 'op-001', 
          encrypted: true,
          persona: { encrypted: 'mock-data-2', salt: 'salt', iv: 'iv' }
        },
        {
          id: '3', 
          tipo: 'ingreso' as const, 
          timestamp: new Date(),
          operadorId: 'op-001',
          encrypted: true,
          persona: { encrypted: 'mock-data-3', salt: 'salt', iv: 'iv' }
        }
      ]

      // ✅ Mock para descifrado específico de cada registro
      mockEncryptionService.decrypt.mockImplementation((encrypted) => {
        if (encrypted === 'mock-data-1' || encrypted === 'mock-data-3') {
          return Promise.resolve(JSON.stringify({
            datosPersonales: { cedula: '12345678', nombre: 'Test', apellido: 'User' },
            datosVisita: { destino: 'IRCCA' }
          }))
        }
        if (encrypted === 'mock-data-2') {
          return Promise.resolve('87654321') // Para registros de salida (solo cédula)
        }
        return Promise.resolve('{}')
      })

      mockUseDatabase.getRecords.mockResolvedValue(registrosCifrados)

      const result = await service.getRegistros({ tipo: 'ingreso' })
      
      expect(result).toHaveLength(2)
      expect(result.every(r => r.tipo === 'ingreso')).toBe(true)
    })

    it('debe filtrar registros por fecha correctamente', async () => {
      // SOLUCIÓN: Usar la misma fecha base para ambos (siguiendo doc oficial Vitest)
      const fechaBase = '2025-09-15T12:00:00.000Z' // Fecha fija en UTC
      const fecha = new Date(fechaBase)
      
      // ✅ Crear registros cifrados usando fechas consistentes
      const registrosCifrados = [
        {
          id: '1', 
          tipo: 'ingreso' as const,
          timestamp: new Date('2025-09-15T10:00:00.000Z'), 
          operadorId: 'op-001',
          encrypted: true,
          persona: { encrypted: 'mock-data-fecha-1', salt: 'salt', iv: 'iv' }
        },
        {
          id: '2', 
          tipo: 'ingreso' as const,
          timestamp: new Date('2025-09-16T10:00:00.000Z'), 
          operadorId: 'op-001',
          encrypted: true,
          persona: { encrypted: 'mock-data-fecha-2', salt: 'salt', iv: 'iv' }
        },
        {
          id: '3', 
          tipo: 'ingreso' as const,
          timestamp: new Date('2025-09-15T15:00:00.000Z'), 
          operadorId: 'op-001',
          encrypted: true,
          persona: { encrypted: 'mock-data-fecha-3', salt: 'salt', iv: 'iv' }
        }
      ]

      // ✅ Mock para descifrado de registros de fecha
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockEncryptionService.decrypt.mockImplementation((encrypted) => {
        return Promise.resolve(JSON.stringify({
          datosPersonales: { cedula: '12345678', nombre: 'Test', apellido: 'User' },
          datosVisita: { destino: 'IRCCA' }
        }))
      })

      // El servicio real obtiene TODOS los registros y luego filtra en memoria
      mockUseDatabase.getRecords.mockResolvedValue(registrosCifrados)

      const result = await service.getRegistros({ fecha })
      
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
