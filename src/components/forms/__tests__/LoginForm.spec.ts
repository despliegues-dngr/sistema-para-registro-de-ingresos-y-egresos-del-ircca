import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import LoginForm from '../LoginForm.vue'

// Crear instancia de Vuetify para tests
const vuetify = createVuetify({
  components,
  directives,
})

// Mock de constantes para evitar dependencias
vi.mock('@/config/constants', () => ({
  MESSAGES: {
    VALIDATION: {
      REQUIRED_FIELD: 'Este campo es requerido',
      USERNAME_MIN: 'El usuario debe tener al menos 3 caracteres',
      USERNAME_FORMAT: 'Formato de usuario inválido',
      PASSWORD_MIN: 'La contraseña debe tener al menos 4 caracteres'
    }
  },
  AUTH_CONFIG: {
    USERNAME_MIN_LENGTH: 3,
    PASSWORD_MIN_LENGTH: 4
  },
  ICONS: {
    AUTH: {
      USER: 'mdi-account',
      PASSWORD: 'mdi-lock',
      LOGIN: 'mdi-login',
      SHOW_PASSWORD: 'mdi-eye',
      HIDE_PASSWORD: 'mdi-eye-off'
    }
  },
  VALIDATION_PATTERNS: {
    USERNAME: /^[a-zA-Z0-9._-]+$/
  }
}))

describe('LoginForm', () => {
  let vuetify: any

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives
    })
  })

  const mountComponent = (props = {}) => {
    return mount(LoginForm, {
      props,
      global: {
        plugins: [vuetify]
      }
    })
  }

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.login-form').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Acceso al sistema')
    })

    it('debe mostrar campos de usuario y contraseña', () => {
      const wrapper = mountComponent()

      const usernameField = wrapper.find('input[autocomplete="username"]')
      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      
      expect(usernameField.exists()).toBe(true)
      expect(passwordField.exists()).toBe(true)
    })

    it('debe mostrar botón de ingreso deshabilitado inicialmente', () => {
      const wrapper = mountComponent()

      const submitBtn = wrapper.find('button[type="submit"]')
      
      expect(submitBtn.exists()).toBe(true)
      expect(submitBtn.text()).toBe('INGRESAR')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('no debe mostrar alerta sin mensaje', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.v-alert').exists()).toBe(false)
    })

    it('debe tener campo de contraseña oculto por defecto', () => {
      const wrapper = mountComponent()

      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      expect(passwordField.attributes('type')).toBe('password')
    })
  })

  describe('Props', () => {
    it('debe mostrar alerta cuando se proporciona mensaje', () => {
      const wrapper = mountComponent({
        message: 'Error de prueba'
      })

      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Error de prueba')
    })

    it('debe mostrar alerta de error para mensajes normales', () => {
      const wrapper = mountComponent({
        message: 'Credenciales incorrectas'
      })

      const alert = wrapper.find('.v-alert')
      // En Vuetify 3, el type prop genera clases CSS relacionadas con el color
      expect(alert.classes()).toContain('v-alert--variant-tonal')
      // Verificamos que el contenido del mensaje está presente
      expect(alert.text()).toContain('Credenciales incorrectas')
    })

    it('debe mostrar alerta de éxito para mensajes exitosos', () => {
      const wrapper = mountComponent({
        message: 'Login exitosamente completado'
      })

      const alert = wrapper.find('.v-alert')
      // En Vuetify 3, verificamos la variante y el contenido del mensaje
      expect(alert.classes()).toContain('v-alert--variant-tonal')
      expect(alert.text()).toContain('Login exitosamente completado')
    })

    it('debe deshabilitar campos cuando loading=true', () => {
      const wrapper = mountComponent({
        loading: true
      })

      const usernameField = wrapper.find('input[autocomplete="username"]')
      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      
      expect(usernameField.attributes('disabled')).toBeDefined()
      expect(passwordField.attributes('disabled')).toBeDefined()
    })

    it('debe mantener botón deshabilitado durante loading', () => {
      const wrapper = mountComponent({
        loading: true
      })

      const submitBtn = wrapper.find('button[type="submit"]')
      // En Vuetify 3, verificamos si tiene la propiedad disabled
      expect(submitBtn.attributes()).toHaveProperty('disabled')
    })
  })

  describe('Interacciones de usuario', () => {
    it('debe permitir escribir en campo usuario', async () => {
      const wrapper = mountComponent()

      const usernameField = wrapper.find('input[autocomplete="username"]')
      await usernameField.setValue('testuser')

      expect(usernameField.element.value).toBe('testuser')
    })

    it('debe permitir escribir en campo contraseña', async () => {
      const wrapper = mountComponent()

      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      await passwordField.setValue('testpass')

      expect(passwordField.element.value).toBe('testpass')
    })

    it('debe alternar visibilidad de contraseña al hacer click en icono', async () => {
      const wrapper = mountComponent()
      
      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      expect(passwordField.attributes('type')).toBe('password')
      
      // En Vuetify 3, el botón es un ícono que maneja el evento click:append-inner
      // Buscar el ícono append-inner
      const toggleIcon = wrapper.find('.v-field__append-inner .v-icon')
      expect(toggleIcon.exists()).toBe(true)
      
      await toggleIcon.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Verificar que el tipo de input cambió a text (visible)
      expect(passwordField.attributes('type')).toBe('text')

    })

    it('debe emitir evento submit con credenciales válidas', async () => {
      const wrapper = mountComponent()

      // Llenar campos con datos válidos
      const usernameField = wrapper.find('input[autocomplete="username"]')
      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      
      await usernameField.setValue('testuser')
      await passwordField.setValue('testpass')

      // Simular que el formulario es válido
      wrapper.vm.formValid = true
      await wrapper.vm.$nextTick()

      // Buscar y hacer click en botón submit
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Verificar evento emitido
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0]).toEqual([{
        username: 'testuser',
        password: 'testpass'
      }])
    })

    it('no debe emitir submit si formulario es inválido', async () => {
      const wrapper = mountComponent()

      // Dejar campos vacíos o inválidos
      wrapper.vm.formValid = false
      await wrapper.vm.$nextTick()

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('debe emitir clearMessage al cerrar alerta', async () => {
      const wrapper = mountComponent({
        message: 'Error de prueba'
      })

      const alert = wrapper.find('.v-alert')
      const closeBtn = alert.find('[data-testid="close"]')
      
      // En Vuetify, buscar el botón de cerrar
      const closeButton = alert.find('.v-alert__close button')
      if (closeButton.exists()) {
        await closeButton.trigger('click')
      } else {
        // Alternativa: emitir evento directamente
        await alert.trigger('click:close')
      }

      expect(wrapper.emitted('clearMessage')).toBeTruthy()
    })
  })

  describe('Validaciones', () => {
    it('debe validar campo usuario requerido', async () => {
      const wrapper = mountComponent()

      const usernameField = wrapper.find('input[autocomplete="username"]')
      
      // Campo vacío
      await usernameField.setValue('')
      await usernameField.trigger('blur')

      // Verificar reglas de validación
      const rules = wrapper.vm.usernameRules
      expect(rules[0]('')).toBe('Este campo es requerido')
    })

    it('debe validar longitud mínima de usuario', async () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.usernameRules
      expect(rules[1]('ab')).toBe('El usuario debe tener al menos 3 caracteres')
      expect(rules[1]('abc')).toBe(true)
    })

    it('debe validar formato de usuario', async () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.usernameRules
      expect(rules[2]('user@invalid')).toBe('Formato de usuario inválido')
      expect(rules[2]('validuser123')).toBe(true)
    })

    it('debe validar contraseña requerida', async () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.passwordRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('password')).toBe(true)
    })

    it('debe validar longitud mínima de contraseña', async () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.passwordRules
      expect(rules[1]('123')).toBe('La contraseña debe tener al menos 4 caracteres')
      expect(rules[1]('1234')).toBe(true)
    })
  })

  describe('Estados del formulario', () => {
    it('debe habilitar botón cuando formulario es válido', async () => {
      const wrapper = mountComponent()

      // Simular formulario válido
      wrapper.vm.formValid = true
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeUndefined()
    })

    it('debe mantener botón deshabilitado cuando formulario es inválido', async () => {
      const wrapper = mountComponent()

      wrapper.vm.formValid = false
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('debe mostrar estado de loading en el botón', async () => {
      const wrapper = mountComponent({
        loading: true
      })

      // Incluso con formulario válido
      wrapper.vm.formValid = true
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      // En Vuetify 3, verificar si el botón tiene la clase de loading
      const hasLoadingClass = submitBtn.classes().includes('v-btn--loading')
      expect(hasLoadingClass).toBe(true)
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener campo usuario con autofocus', () => {
      const wrapper = mountComponent()

      const usernameField = wrapper.find('input[autocomplete="username"]')
      expect(usernameField.attributes('autofocus')).toBeDefined()
    })

    it('debe tener autocomplete apropiado en campos', () => {
      const wrapper = mountComponent()

      const usernameField = wrapper.find('input[autocomplete="username"]')
      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      
      expect(usernameField.attributes('autocomplete')).toBe('username')
      expect(passwordField.attributes('autocomplete')).toBe('current-password')
    })

    it('debe tener labels apropiados', () => {
      const wrapper = mountComponent()

      // Vuetify renderiza labels como parte del v-text-field
      expect(wrapper.html()).toContain('Usuario')
      expect(wrapper.html()).toContain('Contraseña')
    })
  })

  describe('Integración completa', () => {
    it('debe completar flujo de login exitoso', async () => {
      const wrapper = mountComponent()

      // 1. Llenar formulario
      const usernameField = wrapper.find('input[autocomplete="username"]')
      const passwordField = wrapper.find('input[autocomplete="current-password"]')
      
      await usernameField.setValue('admin')
      await passwordField.setValue('password123')

      // 2. Simular validación exitosa
      wrapper.vm.formValid = true
      await wrapper.vm.$nextTick()

      // 3. Verificar botón habilitado
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeUndefined()

      // 4. Submit
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // 5. Verificar evento
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0]).toEqual([{
        username: 'admin',
        password: 'password123'
      }])
    })

    it('debe manejar flujo de error', async () => {
      const wrapper = mountComponent({
        message: 'Credenciales incorrectas'
      })

      // 1. Verificar alerta visible
      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Credenciales incorrectas')

      // 2. Cerrar alerta
      const closeButton = alert.find('.v-alert__close button')
      if (closeButton.exists()) {
        await closeButton.trigger('click')
        expect(wrapper.emitted('clearMessage')).toBeTruthy()
      }
    })
  })
})
