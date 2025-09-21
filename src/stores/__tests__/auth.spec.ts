import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, type User, type RegisterUserData } from '../auth'
import { EncryptionService } from '@/services/encryptionService'

// Mock del composable useDatabase - COMPLETO según documentación oficial
const mockInitDatabase = vi.fn()
const mockAddRecord = vi.fn()
const mockGetRecords = vi.fn()
const mockUpdateRecord = vi.fn() // ✅ AÑADIDO
const mockClearStore = vi.fn() // ✅ AÑADIDO

vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => ({
    isConnected: { value: true },
    config: { dbName: 'test_db', version: 1, stores: ['usuarios'] },
    initDatabase: mockInitDatabase,
    addRecord: mockAddRecord,
    getRecords: mockGetRecords,
    updateRecord: mockUpdateRecord, // ✅ AÑADIDO
    clearStore: mockClearStore // ✅ AÑADIDO
  })
}))

// Mock de IndexedDB para el entorno de testing
vi.stubGlobal('indexedDB', {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(() => Promise.resolve([])),
  cmp: vi.fn()
})

// 🔥 SOLUCIÓN: Mock de localStorage para evitar persistencia entre tests
const mockLocalStorage = {
  getItem: vi.fn(() => null), // Siempre devolver null = sin sesión guardada
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
vi.stubGlobal('localStorage', mockLocalStorage)

describe('useAuthStore', () => {
  beforeEach(() => {
    console.log('🔄 DEBUG BEFOREEACH - Inicializando test...')
    
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
    console.log('🔄 DEBUG BEFOREEACH - Pinia configurada')
    
    // Reset all mocks - patrón oficial Vitest
    vi.clearAllMocks()
    
    // 🔥 FORZAR LIMPIEZA DE LOCALSTORAGE
    mockLocalStorage.getItem.mockReturnValue(null)
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
    console.log('🔄 DEBUG BEFOREEACH - Mocks limpiados + localStorage mockeado')
    
    // Configurar valores por defecto para mocks exitosos
    mockInitDatabase.mockResolvedValue({ success: true })
    mockAddRecord.mockResolvedValue({ success: true, id: '1' })
    mockUpdateRecord.mockResolvedValue({ success: true }) // ✅ CONFIGURADO
    mockGetRecords.mockResolvedValue([]) // Importante: lista vacía por defecto
    mockClearStore.mockResolvedValue({ success: true })
    
    console.log('🔄 DEBUG BEFOREEACH - Mocks configurados con valores por defecto')
    console.log('   mockGetRecords devolverá:', [])
  })

  describe('Estado inicial', () => {
    it('debe tener valores iniciales correctos', () => {
      const authStore = useAuthStore()

      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.maxLoginAttempts).toBe(3)
    })

    it('getters deben reflejar estado inicial', () => {
      const authStore = useAuthStore()

      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(false)
      expect(authStore.canAttemptLogin).toBe(true)
    })
  })

  describe('Acción login()', () => {
    it('debe autenticar usuario correctamente', async () => {
      const authStore = useAuthStore()
      
      // Mock del useDatabase para simular usuario existente
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'admin',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'admin',
          nombre: 'Admin',
          apellido: 'User',
          lastLogin: new Date()
        }
      ])
      
      // Mock del EncryptionService para simular contraseña válida
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)
      
      await authStore.login('admin', 'password123')
      
      expect(authStore.user).toBeTruthy()
      expect(authStore.user?.username).toBe('admin')
      expect(authStore.user?.role).toBe('admin')
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isOperador).toBe(false)
    })

    it('debe resetear intentos de login al autenticar', async () => {
      const authStore = useAuthStore()
      
      // Simular intentos fallidos previos
      authStore.incrementLoginAttempts()
      authStore.incrementLoginAttempts()
      expect(authStore.loginAttempts).toBe(2)

      // Mock del useDatabase para simular usuario operador existente
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'operador1',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'operador',
          nombre: 'Operador',
          apellido: 'Test'
        }
      ])
      
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)

      await authStore.login('operador1', 'password123')

      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.isOperador).toBe(true)
      expect(authStore.isAdmin).toBe(false)
    })
  })

  describe('Acción logout()', () => {
    it('debe limpiar sesión correctamente', async () => {
      console.log('📝 DEBUG LOGOUT TEST - Iniciando...')
      const authStore = useAuthStore()
      console.log('📝 DEBUG LOGOUT TEST - Estado inicial:', { user: authStore.user, isAuth: authStore.isAuthenticated })
      
      // Configurar mock para login exitoso ANTES del login
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'admin',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'admin',
          nombre: 'Admin',
          apellido: 'User'
        }
      ])
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)
      console.log('📝 DEBUG LOGOUT TEST - Mocks configurados para login exitoso')
      
      // Hacer login con API CORRECTA
      await authStore.login('admin', 'password123')
      console.log('📝 DEBUG LOGOUT TEST - Después del login:', { user: authStore.user, isAuth: authStore.isAuthenticated })
      
      // Verificar que está autenticado
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toBeTruthy()
      expect(authStore.user?.username).toBe('admin')
      expect(authStore.user?.role).toBe('admin')
      console.log('📝 DEBUG LOGOUT TEST - Login verificado exitosamente')

      // Hacer logout
      console.log('📝 DEBUG LOGOUT TEST - Ejecutando logout...')
      authStore.logout()
      console.log('📝 DEBUG LOGOUT TEST - Logout ejecutado, estado final:', { user: authStore.user, isAuth: authStore.isAuthenticated })

      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      console.log('📝 DEBUG LOGOUT TEST - Test completado exitosamente')
      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(false)
    })
  })

  describe('Control de intentos de login', () => {
    it('debe incrementar intentos fallidos', () => {
      const authStore = useAuthStore()

      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.canAttemptLogin).toBe(true)

      authStore.incrementLoginAttempts()
      expect(authStore.loginAttempts).toBe(1)
      expect(authStore.canAttemptLogin).toBe(true)

      authStore.incrementLoginAttempts()
      expect(authStore.loginAttempts).toBe(2)
      expect(authStore.canAttemptLogin).toBe(true)
    })

    it('debe bloquear después del máximo de intentos', () => {
      const authStore = useAuthStore()

      // Llegar al límite
      authStore.incrementLoginAttempts() // 1
      authStore.incrementLoginAttempts() // 2
      authStore.incrementLoginAttempts() // 3

      expect(authStore.loginAttempts).toBe(3)
      expect(authStore.canAttemptLogin).toBe(false)
    })

    it('debe resetear intentos correctamente', () => {
      const authStore = useAuthStore()

      // Agregar algunos intentos fallidos
      authStore.incrementLoginAttempts()
      authStore.incrementLoginAttempts()
      expect(authStore.loginAttempts).toBe(2)

      authStore.resetLoginAttempts()
      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.canAttemptLogin).toBe(true)
    })
  })

  describe('Getters computados', () => {
    it('debe identificar rol admin correctamente', async () => {
      const authStore = useAuthStore()
      
      // Mock para login exitoso de admin
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'admin',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'admin',
          nombre: 'Admin',
          apellido: 'User'
        }
      ])
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)

      await authStore.login('admin', 'password123')

      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isOperador).toBe(false)
    })

    it('debe identificar rol operador correctamente', async () => {
      const authStore = useAuthStore()
      
      // Mock para login exitoso de operador
      mockGetRecords.mockResolvedValue([
        {
          id: '2',
          username: 'operador1',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'operador',
          nombre: 'Operador',
          apellido: 'Test'
        }
      ])
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)

      await authStore.login('operador1', 'password123')

      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(true)
    })

    it('canAttemptLogin debe reflejar límite correctamente', () => {
      const authStore = useAuthStore()

      // Estado inicial - puede intentar
      expect(authStore.canAttemptLogin).toBe(true)

      // Intentos dentro del límite
      authStore.incrementLoginAttempts()
      authStore.incrementLoginAttempts()
      expect(authStore.canAttemptLogin).toBe(true)

      // Último intento permitido
      authStore.incrementLoginAttempts()
      expect(authStore.canAttemptLogin).toBe(false)
    })
  })

  describe('Acción registerUser()', () => {
    beforeEach(() => {
      // Mock de servicios para testing
      vi.clearAllMocks()
      
      // Configurar mocks por defecto para este describe
      mockGetRecords.mockResolvedValue([])
      mockAddRecord.mockResolvedValue({ success: true })
      mockInitDatabase.mockResolvedValue(undefined)
    })

    it('debe registrar un nuevo usuario exitosamente', async () => {
      const authStore = useAuthStore()
      
      const newUserData: RegisterUserData = {
        cedula: '12345678',
        grado: 'Guardia Republicano',
        nombre: 'Juan',
        apellido: 'Pérez',
        password: 'password123'
      }

      // La función debe completarse sin errores
      await expect(authStore.registerUser(newUserData)).resolves.toBeUndefined()

      // Verificar que se llamaron los métodos correctos
      expect(mockInitDatabase).toHaveBeenCalled()
      expect(mockGetRecords).toHaveBeenCalledWith('usuarios', 'username', '12345678')
      expect(mockAddRecord).toHaveBeenCalledWith('usuarios', expect.objectContaining({
        username: '12345678',
        role: 'operador',
        nombre: 'Juan',
        apellido: 'Pérez',
        grado: 'Guardia Republicano'
      }))
    })

    it('debe fallar si la cédula ya existe', async () => {
      const authStore = useAuthStore()
      
      const duplicateUserData: RegisterUserData = {
        cedula: '87654321',
        nombre: 'Otro',
        apellido: 'Usuario',
        grado: 'Teniente',
        password: 'password456'
      }

      // Configurar mock para devolver usuario existente
      mockGetRecords.mockResolvedValueOnce([{ 
        id: 'existing-user-id',
        username: '87654321',
        role: 'operador'
      }])

      // Debe lanzar error por cédula duplicada
      await expect(authStore.registerUser(duplicateUserData))
        .rejects.toThrow('Ya existe un usuario registrado con esa cédula')

      expect(mockGetRecords).toHaveBeenCalledWith('usuarios', 'username', '87654321')
    })

    it('debe fallar si hay error en la base de datos', async () => {
      const authStore = useAuthStore()
      
      const userData: RegisterUserData = {
        cedula: '11223344',
        grado: 'Sargento',
        nombre: 'Carlos',
        apellido: 'López',
        password: 'password789'
      }

      // Mock para simular error en la base de datos
      mockAddRecord.mockResolvedValue({ 
        success: false, 
        error: 'Error de conexión con IndexedDB' 
      })

      // Debe lanzar error de base de datos
      await expect(authStore.registerUser(userData))
        .rejects.toThrow('Error de conexión con IndexedDB')
    })
  })

  describe('Reactividad de getters', () => {
    it('isAuthenticated debe reaccionar a login y logout', async () => {
      const authStore = useAuthStore()
      
      // Estado inicial
      expect(authStore.isAuthenticated).toBe(false)
      
      // Mock para login exitoso
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'test',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'operador',
          nombre: 'Test',
          apellido: 'User'
        }
      ])
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)
      
      // Después de login
      await authStore.login('test', 'password123')
      expect(authStore.isAuthenticated).toBe(true)
      
      // Después de logout
      authStore.logout()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('currentUser (user) debe reflejar cambios de estado', async () => {
      const authStore = useAuthStore()
      
      // Estado inicial
      expect(authStore.user).toBeNull()
      
      // Mock para login exitoso
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'operador1',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'operador',
          nombre: 'Test',
          apellido: 'User'
        }
      ])
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)
      
      // Después de login
      await authStore.login('operador1', 'password123')
      expect(authStore.user).toBeTruthy()
      expect(authStore.user?.username).toBe('operador1')
      expect(authStore.user?.role).toBe('operador')
      
      // Después de logout
      authStore.logout()
      expect(authStore.user).toBeNull()
    })

    it('getters de roles deben reaccionar a cambios de usuario', async () => {
      const authStore = useAuthStore()
      
      // Estado inicial - sin usuario
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(false)
      
      // Mock para login como admin
      mockGetRecords.mockResolvedValue([
        {
          id: '1',
          username: 'admin',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'admin',
          nombre: 'Admin',
          apellido: 'User'
        }
      ])
      vi.spyOn(EncryptionService, 'verifyPassword').mockResolvedValue(true)
      
      // Login como admin
      await authStore.login('admin', 'password123')
      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isOperador).toBe(false)
      
      // Logout y cambiar mock para operador
      authStore.logout()
      mockGetRecords.mockResolvedValue([
        {
          id: '2',
          username: 'operador1',
          hashedPassword: 'hashed_password',
          salt: 'salt_value',
          role: 'operador', 
          nombre: 'Operador',
          apellido: 'Test'
        }
      ])
      
      // Login como operador
      await authStore.login('operador1', 'password123')
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(true)
      
      // Logout final
      authStore.logout()
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(false)
    })
  })
})
