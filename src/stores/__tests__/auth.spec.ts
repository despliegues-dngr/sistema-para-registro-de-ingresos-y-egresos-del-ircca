import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, type User } from '../auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
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
})
