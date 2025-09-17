import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, type User, type RegisterUserData } from '../auth'

// Mock del composable useDatabase
const mockInitDatabase = vi.fn()
const mockAddRecord = vi.fn()
const mockGetRecords = vi.fn()

vi.mock('@/composables/useDatabase', () => ({
  useDatabase: () => ({
    initDatabase: mockInitDatabase,
    addRecord: mockAddRecord,
    getRecords: mockGetRecords
  })
}))

// Mock de IndexedDB para el entorno de testing
vi.stubGlobal('indexedDB', {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
  databases: vi.fn(() => Promise.resolve([])),
  cmp: vi.fn()
})

describe('useAuthStore', () => {
  beforeEach(() => {
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
    
    // Reset mocks
    vi.clearAllMocks()
    
    // Mock successful database operations por defecto
    mockInitDatabase.mockResolvedValue(undefined)
    mockAddRecord.mockResolvedValue({ success: true })
    mockGetRecords.mockResolvedValue([])
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
    it('debe autenticar usuario correctamente', () => {
      const authStore = useAuthStore()
      const userData: User = {
        id: '1',
        username: 'admin',
        role: 'admin',
        lastLogin: new Date()
      }

      authStore.login(userData)

      expect(authStore.user).toEqual(userData)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isOperador).toBe(false)
    })

    it('debe resetear intentos de login al autenticar', () => {
      const authStore = useAuthStore()
      
      // Simular intentos fallidos previos
      authStore.incrementLoginAttempts()
      authStore.incrementLoginAttempts()
      expect(authStore.loginAttempts).toBe(2)

      const userData: User = {
        id: '1',
        username: 'operador1',
        role: 'operador'
      }

      authStore.login(userData)

      expect(authStore.loginAttempts).toBe(0)
      expect(authStore.isOperador).toBe(true)
      expect(authStore.isAdmin).toBe(false)
    })
  })

  describe('Acción logout()', () => {
    it('debe limpiar sesión correctamente', () => {
      const authStore = useAuthStore()
      
      // Primero login
      const userData: User = {
        id: '1',
        username: 'admin',
        role: 'admin'
      }
      authStore.login(userData)
      
      // Verificar que está autenticado
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toEqual(userData)

      // Hacer logout
      authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
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
    it('debe identificar rol admin correctamente', () => {
      const authStore = useAuthStore()
      
      const adminUser: User = {
        id: '1',
        username: 'admin',
        role: 'admin'
      }

      authStore.login(adminUser)

      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isOperador).toBe(false)
    })

    it('debe identificar rol operador correctamente', () => {
      const authStore = useAuthStore()
      
      const operadorUser: User = {
        id: '2',
        username: 'operador1',
        role: 'operador'
      }

      authStore.login(operadorUser)

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
    it('isAuthenticated debe reaccionar a login y logout', () => {
      const authStore = useAuthStore()
      
      // Estado inicial
      expect(authStore.isAuthenticated).toBe(false)
      
      // Después de login
      const userData: User = {
        id: '1',
        username: 'test',
        role: 'operador'
      }
      authStore.login(userData)
      expect(authStore.isAuthenticated).toBe(true)
      
      // Después de logout
      authStore.logout()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('currentUser (user) debe reflejar cambios de estado', () => {
      const authStore = useAuthStore()
      
      // Estado inicial
      expect(authStore.user).toBeNull()
      
      // Después de login
      const userData: User = {
        id: '1',
        username: 'operador1',
        role: 'operador',
        nombre: 'Test',
        apellido: 'User'
      }
      authStore.login(userData)
      expect(authStore.user).toEqual(userData)
      
      // Después de logout
      authStore.logout()
      expect(authStore.user).toBeNull()
    })

    it('getters de roles deben reaccionar a cambios de usuario', () => {
      const authStore = useAuthStore()
      
      // Estado inicial - sin usuario
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(false)
      
      // Login como admin
      authStore.login({
        id: '1',
        username: 'admin',
        role: 'admin'
      })
      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isOperador).toBe(false)
      
      // Logout y login como operador
      authStore.logout()
      authStore.login({
        id: '2',
        username: 'operador1',
        role: 'operador'
      })
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(true)
      
      // Logout final
      authStore.logout()
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isOperador).toBe(false)
    })
  })
})
