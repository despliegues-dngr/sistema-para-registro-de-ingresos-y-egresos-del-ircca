// TypeScript configuration for Vue Testing - using global helper approach
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../LoginView.vue'

// Mock de constantes
vi.mock('@/config/constants', () => ({
  MESSAGES: {
    AUTH: {
      ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos',
      LOGIN_SUCCESS: 'Inicio de sesión exitoso',
      LOGIN_ERROR: 'Credenciales incorrectas',
      CONNECTION_ERROR: 'Error de conexión'
    }
  },
  ROUTES: {
    DASHBOARD: '/dashboard'
  }
}))

// Mock de componentes hijos
vi.mock('@/components/layout/AuthBackground.vue', () => ({
  default: {
    name: 'AuthBackground',
    template: '<div class="auth-background"><slot /></div>'
  }
}))

vi.mock('@/components/ui/LoginCard.vue', () => ({
  default: {
    name: 'LoginCard',
    template: '<div class="login-card"><slot /></div>'
  }
}))

vi.mock('@/components/layout/InstitutionalHeader.vue', () => ({
  default: {
    name: 'InstitutionalHeader',
    template: '<div class="institutional-header">Header</div>'
  }
}))

vi.mock('@/components/forms/LoginForm.vue', () => ({
  default: {
    name: 'LoginForm',
    template: '<div class="login-form" @submit="$emit(\'submit\', $event)" @clear-message="$emit(\'clear-message\')">LoginForm</div>',
    props: ['loading', 'message'],
    emits: ['submit', 'clear-message']
  }
}))

vi.mock('@/components/layout/GovernmentFooter.vue', () => ({
  default: {
    name: 'GovernmentFooter',
    template: '<div class="government-footer" @help="$emit(\'help\')" @register="$emit(\'register\')">Footer</div>',
    emits: ['help', 'register']
  }
}))

vi.mock('@/components/ui/HelpDialog.vue', () => ({
  default: {
    name: 'HelpDialog',
    template: '<div v-if="modelValue" class="help-dialog" @close="$emit(\'close\')">Help Dialog</div>',
    props: ['modelValue'],
    emits: ['close', 'update:modelValue']
  }
}))

vi.mock('@/components/ui/RegistrationDialog.vue', () => ({
  default: {
    name: 'RegistrationDialog',
    template: '<div v-if="modelValue" class="registration-dialog" @close="$emit(\'close\')" @success="$emit(\'success\', $event)">Registration Dialog</div>',
    props: ['modelValue'],
    emits: ['close', 'success', 'update:modelValue']
  }
}))

// Mock del authStore
const mockAuthStore = {
  canAttemptLogin: true,
  login: vi.fn(),
  incrementLoginAttempts: vi.fn(),
  isAuthenticated: false,
  user: null
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('LoginView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    mockAuthStore.canAttemptLogin = true
    mockAuthStore.login.mockResolvedValue(undefined)
    mockAuthStore.incrementLoginAttempts.mockImplementation(() => {})
    mockAuthStore.isAuthenticated = false
    mockAuthStore.user = null

    // Setup router
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'Login', component: { template: '<div>Login</div>' } },
        { path: '/dashboard', name: 'Dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })

    // Use fake timers for setTimeout in LoginView
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // Use global helper from test-setup.ts - more robust approach  
  const mountComponent = (props = {}) => {
    return (globalThis as any).mountWithVuetify(LoginView, { 
      props,
      router // Pasar router como opción especial
    })
  }

  describe('Renderizado inicial', () => {
    it('debe renderizar todos los componentes principales', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.v-container').exists()).toBe(true)
      expect(wrapper.find('.login-card').exists()).toBe(true)
      expect(wrapper.find('.institutional-header').exists()).toBe(true)
      expect(wrapper.find('.login-form').exists()).toBe(true)
      expect(wrapper.find('.government-footer').exists()).toBe(true)
    })

    it('debe tener estado inicial correcto', () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      expect(vm.loading).toBe(false)
      expect(vm.showHelp).toBe(false)
      expect(vm.showRegister).toBe(false)
      expect(vm.message).toBe('')
    })

    it('no debe mostrar diálogos inicialmente', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.help-dialog').exists()).toBe(false)
      expect(wrapper.find('.registration-dialog').exists()).toBe(false)
    })

    it('debe pasar props correctas a LoginForm', () => {
      const wrapper = mountComponent()
      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      expect(loginForm.props('loading')).toBe(false)
      expect(loginForm.props('message')).toBe('')
    })
  })

  describe('Gestión de diálogos', () => {
    it('debe mostrar diálogo de ayuda al hacer click en footer', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const footer = wrapper.findComponent({ name: 'GovernmentFooter' })
      await footer.vm.$emit('help')

      expect(vm.showHelp).toBe(true)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.help-dialog').exists()).toBe(true)
    })

    it('debe cerrar diálogo de ayuda', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.showHelp = true
      await wrapper.vm.$nextTick()

      const helpDialog = wrapper.findComponent({ name: 'HelpDialog' })
      await helpDialog.vm.$emit('close')

      expect(vm.showHelp).toBe(false)
    })

    it('debe mostrar diálogo de registro al hacer click en footer', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const footer = wrapper.findComponent({ name: 'GovernmentFooter' })
      await footer.vm.$emit('register')

      expect(vm.showRegister).toBe(true)
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.registration-dialog').exists()).toBe(true)
    })

    it('debe cerrar diálogo de registro', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.showRegister = true
      await wrapper.vm.$nextTick()

      const registrationDialog = wrapper.findComponent({ name: 'RegistrationDialog' })
      await registrationDialog.vm.$emit('close')

      expect(vm.showRegister).toBe(false)
    })

    it('debe manejar éxito de registro', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.showRegister = true
      await wrapper.vm.$nextTick()

      const registrationDialog = wrapper.findComponent({ name: 'RegistrationDialog' })
      await registrationDialog.vm.$emit('success', 'Usuario registrado exitosamente')

      expect(vm.showRegister).toBe(false)
      expect(vm.message).toBe('Usuario registrado exitosamente')
    })
  })

  describe('Autenticación exitosa', () => {
    it('debe manejar login exitoso con credenciales válidas', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })

      await flushPromises()

      expect(mockAuthStore.login).toHaveBeenCalledWith('admin', 'admin')
      expect(vm.message).toBe('Inicio de sesión exitoso')
      expect(vm.loading).toBe(false)

      // Advance timers to trigger the setTimeout redirect
      vi.advanceTimersByTime(1000)
      await flushPromises()

      expect(pushSpy).toHaveBeenCalledWith('/dashboard')
    })

    it('debe mostrar loading durante autenticación', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })

      expect(vm.loading).toBe(true)

      await flushPromises()
      expect(vm.loading).toBe(false)
    })

    it('debe limpiar mensaje antes de nuevo intento', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.message = 'Mensaje anterior'
      
      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })

      expect(vm.message).toBe('Inicio de sesión exitoso')
    })
  })

  describe('Autenticación fallida', () => {
    it('debe manejar credenciales incorrectas', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      
      mockAuthStore.login.mockImplementation(() => {
        throw new Error('Usuario no encontrado')
      })

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'wrong', password: 'wrong' })

      await flushPromises()

      expect(mockAuthStore.login).toHaveBeenCalledOnce()
      expect(vm.message).toBe('Usuario no encontrado')
      expect(vm.loading).toBe(false)
    })

    it('debe manejar cuenta bloqueada', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      mockAuthStore.canAttemptLogin = false

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })

      await flushPromises()

      expect(vm.message).toBe('Cuenta bloqueada por múltiples intentos fallidos')
      expect(mockAuthStore.incrementLoginAttempts).not.toHaveBeenCalled()
      expect(mockAuthStore.login).not.toHaveBeenCalled()
    })

    it('debe manejar errores de conexión', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockAuthStore.login.mockImplementation(() => {
        throw 'Network connection failed'
      })

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })

      await flushPromises()

      expect(vm.message).toBe('Error de conexión')
      expect(vm.loading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error durante el login:', 'Network connection failed')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Gestión de mensajes', () => {
    it('debe limpiar mensaje cuando se emite clear-message', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.message = 'Mensaje de prueba'
      
      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('clear-message')

      expect(vm.message).toBe('')
    })

    it('debe actualizar props de LoginForm cuando cambia mensaje', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.message = 'Nuevo mensaje'
      await wrapper.vm.$nextTick()

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      expect(loginForm.props('message')).toBe('Nuevo mensaje')
    })

    it('debe actualizar props de LoginForm cuando cambia loading', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.loading = true
      await wrapper.vm.$nextTick()

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      expect(loginForm.props('loading')).toBe(true)
    })
  })

  describe('Integración de componentes', () => {
    it('debe pasar eventos correctamente entre componentes', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const footer = wrapper.findComponent({ name: 'GovernmentFooter' })
      await footer.vm.$emit('register')

      expect(vm.showRegister).toBe(true)
      await wrapper.vm.$nextTick()

      const registrationDialog = wrapper.findComponent({ name: 'RegistrationDialog' })
      expect(registrationDialog.exists()).toBe(true)

      await registrationDialog.vm.$emit('success', 'Registro completado')

      expect(vm.showRegister).toBe(false)
      expect(vm.message).toBe('Registro completado')
    })

    it('debe mantener coherencia entre estado y UI', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      expect(vm.showHelp).toBe(false)
      expect(wrapper.find('.help-dialog').exists()).toBe(false)

      vm.showHelp = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.help-dialog').exists()).toBe(true)

      vm.showHelp = false
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.help-dialog').exists()).toBe(false)
    })
  })

  describe('Casos edge y robustez', () => {
    it('debe manejar múltiples clicks rápidos en login', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      
      loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })
      loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })
      
      await flushPromises()

      expect(mockAuthStore.login).toHaveBeenCalledTimes(2)
      expect(vm.loading).toBe(false)
      
      // Advance timers to trigger setTimeout redirects
      vi.advanceTimersByTime(1000)
      await flushPromises()
      
      expect(pushSpy).toHaveBeenCalledTimes(2)
    })

    it('debe manejar apertura/cierre rápido de diálogos', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.showHelp = true
      vm.showHelp = false
      vm.showRegister = true
      vm.showRegister = false

      await wrapper.vm.$nextTick()

      expect(vm.showHelp).toBe(false)
      expect(vm.showRegister).toBe(false)
      expect(wrapper.find('.help-dialog').exists()).toBe(false)
      expect(wrapper.find('.registration-dialog').exists()).toBe(false)
    })

    it('debe mantener funcionalidad después de errores', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      
      mockAuthStore.login.mockImplementationOnce(() => {
        throw new Error('Usuario no encontrado')
      })
      
      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'wrong', password: 'wrong' })
      await flushPromises()

      expect(vm.message).toBe('Usuario no encontrado')

      await loginForm.vm.$emit('clear-message')
      expect(vm.message).toBe('')

      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })
      await flushPromises()

      expect(vm.message).toBe('Inicio de sesión exitoso')
    })
  })

  describe('Flujo completo de usuario', () => {
    it('debe completar flujo exitoso completo', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined)

      expect(vm.loading).toBe(false)
      expect(vm.message).toBe('')

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })

      await flushPromises()

      expect(mockAuthStore.login).toHaveBeenCalledWith('admin', 'admin')
      expect(vm.message).toBe('Inicio de sesión exitoso')
      expect(vm.loading).toBe(false)
      
      // Advance timers to trigger setTimeout redirect
      vi.advanceTimersByTime(1000)
      await flushPromises()
      
      expect(pushSpy).toHaveBeenCalledWith('/dashboard')
    })

    it('debe completar flujo de error y recuperación', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      mockAuthStore.login.mockImplementationOnce(() => {
        throw new Error('Usuario no encontrado')
      })

      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      await loginForm.vm.$emit('submit', { username: 'wrong', password: 'wrong' })
      await flushPromises()

      expect(vm.message).toBe('Usuario no encontrado')
      expect(mockAuthStore.login).toHaveBeenCalledOnce()

      await loginForm.vm.$emit('clear-message')
      expect(vm.message).toBe('')

      vi.spyOn(router, 'push').mockResolvedValue(undefined)
      await loginForm.vm.$emit('submit', { username: 'admin', password: 'admin' })
      await flushPromises()

      expect(vm.message).toBe('Inicio de sesión exitoso')
      expect(mockAuthStore.login).toHaveBeenCalled()
    })

    it('debe manejar flujo de registro desde footer', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      const footer = wrapper.findComponent({ name: 'GovernmentFooter' })
      await footer.vm.$emit('register')

      expect(vm.showRegister).toBe(true)

      const registrationDialog = wrapper.findComponent({ name: 'RegistrationDialog' })
      await registrationDialog.vm.$emit('success', 'Usuario creado exitosamente')

      expect(vm.showRegister).toBe(false)
      expect(vm.message).toBe('Usuario creado exitosamente')

      await wrapper.vm.$nextTick()
      const loginForm = wrapper.findComponent({ name: 'LoginForm' })
      expect(loginForm.props('message')).toBe('Usuario creado exitosamente')
    })
  })
})
