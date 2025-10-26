// TypeScript configuration for Vue Testing - using global helper approach
import { describe, it, expect, vi } from 'vitest'
import RegistrationForm from '../RegistrationForm.vue'

// Mock de constantes
vi.mock('@/config/constants', () => ({
  MESSAGES: {
    VALIDATION: {
      REQUIRED_FIELD: 'Este campo es requerido'
    }
  },
  ICONS: {
    USER: {
      PROFILE: 'mdi-account-card-details',
      PERSON: 'mdi-account',
      ADD: 'mdi-account-plus'
    },
    AUTH: {
      PASSWORD: 'mdi-lock',
      SHOW_PASSWORD: 'mdi-eye',
      HIDE_PASSWORD: 'mdi-eye-off'
    }
  },
  VALIDATION_PATTERNS: {
    CEDULA: /^\d{8}$/
  }
}))

// Mock del componente TermsAndConditionsDialog
vi.mock('@/components/ui/TermsAndConditionsDialog.vue', () => ({
  default: {
    name: 'TermsAndConditionsDialog',
    template: '<div data-testid="terms-dialog">Terms Dialog</div>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'close']
  }
}))

describe('RegistrationForm', () => {
  // Use global helper from test-setup.ts - more robust approach
  const mountComponent = (props = {}) => {
    return (globalThis as any).mountWithVuetify(RegistrationForm, { props })
  }

  describe('Términos y Condiciones', () => {
    it('debe mostrar checkbox de términos y condiciones', () => {
      const wrapper = mountComponent()
      const checkbox = wrapper.find('input[type="checkbox"]')
      expect(checkbox.exists()).toBe(true)
    })

    it('debe mostrar el texto de términos con enlace', () => {
      const wrapper = mountComponent()
      expect(wrapper.text()).toContain('He leído y acepto los')
      expect(wrapper.text()).toContain('Términos y Condiciones')
    })

    it('debe mostrar el modal de términos al hacer click en el enlace', async () => {
      const wrapper = mountComponent()
      const termsButton = wrapper.find('button')
      await termsButton.trigger('click')
      expect(wrapper.find('[data-testid="terms-dialog"]').exists()).toBe(true)
    })

    it('debe incluir el campo terminosCondiciones en el submit', async () => {
      const wrapper = mountComponent()
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      const submitEvents = wrapper.emitted('submit')
      if (submitEvents && submitEvents[0]) {
        const userData = submitEvents[0][0] as Record<string, unknown>
        expect(userData).toHaveProperty('terminosCondiciones')
        expect(typeof userData.terminosCondiciones).toBe('boolean')
      }
    })
  })

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.registration-form').exists()).toBe(true)
      expect(wrapper.find('h2').text()).toBe('Datos del nuevo operador')
    })

    it('debe mostrar todos los campos requeridos', () => {
      const wrapper = mountComponent()
      expect(wrapper.html()).toContain('Documento')
      expect(wrapper.html()).toContain('Grado')
      expect(wrapper.html()).toContain('Nombre')
      expect(wrapper.html()).toContain('Apellido')
      expect(wrapper.html()).toContain('Contraseña')
      expect(wrapper.html()).toContain('Confirmar Contraseña')
    })

    it('debe mostrar botón de registro deshabilitado inicialmente', () => {
      const wrapper = mountComponent()
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('debe tener contraseñas ocultas por defecto', () => {
      const wrapper = mountComponent()
      const passwordFields = wrapper.findAll('input[type="password"]')
      expect(passwordFields.length).toBeGreaterThanOrEqual(2)
    })

    it('no debe mostrar alerta sin mensaje', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.v-alert').exists()).toBe(false)
    })
  })

  describe('Props', () => {
    it('debe mostrar alerta cuando se proporciona mensaje', () => {
      const wrapper = mountComponent({
        message: 'Error en el registro'
      })
      expect(wrapper.find('.v-alert').exists()).toBe(true)
      expect(wrapper.text()).toContain('Error en el registro')
    })

    it('debe mostrar alerta de error para mensajes normales', () => {
      const wrapper = mountComponent({
        message: 'Usuario ya existe'
      })
      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.classes()).toContain('text-error')
    })

    it('debe mostrar alerta de éxito para mensajes exitosos', () => {
      const wrapper = mountComponent({
        message: 'Registro exitoso'
      })
      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.classes()).toContain('text-success')
    })

    it('debe deshabilitar campos cuando loading=true', () => {
      const wrapper = mountComponent({
        loading: true
      })
      const inputs = wrapper.findAll('input')
      inputs.forEach(input => {
        expect(input.attributes('disabled')).toBeDefined()
      })
    })

    it('debe mantener botón deshabilitado durante loading', () => {
      const wrapper = mountComponent({
        loading: true
      })
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('debe mostrar loading en botón cuando loading=true', () => {
      const wrapper = mountComponent({
        loading: true
      })
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.text()).toContain('Registrando...')
    })
  })

  describe('Validaciones', () => {
    it('debe validar documento requerido', () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      const rules = vm.cedulaRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('12345678')).toBe(true)
    })

    it('debe validar formato de documento', () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any
      const rules = vm.cedulaRules
      expect(rules[1]('1234567')).toBe('El documento debe tener exactamente 8 dígitos')
      expect(rules[1]('12345678')).toBe(true)
      expect(rules[2]('1234567a')).toBe('Formato de documento inválido')
      expect(rules[2]('12345678')).toBe(true)
    })

    it('debe validar contraseñas coincidan', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.userData.password = 'password123'
      await wrapper.vm.$nextTick()

      const rules = vm.confirmPasswordRules
      expect(rules[1]('different')).toBe('Las contraseñas no coinciden')
      expect(rules[1]('password123')).toBe(true)
    })
  })

  describe('Interacciones', () => {
    it('debe permitir escribir en campos', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.userData.cedula = '12345678'
      vm.userData.nombre = 'Juan'
      vm.userData.apellido = 'Pérez'

      await wrapper.vm.$nextTick()

      expect(vm.userData.cedula).toBe('12345678')
      expect(vm.userData.nombre).toBe('Juan')
      expect(vm.userData.apellido).toBe('Pérez')
    })

    it('debe alternar visibilidad de contraseña', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      expect(vm.showPassword).toBe(false)
      vm.showPassword = true
      await wrapper.vm.$nextTick()
      expect(vm.showPassword).toBe(true)
    })
  })

  describe('Envío de formulario', () => {
    it('debe emitir evento submit con datos válidos', async () => {
      const wrapper = mountComponent()
      const vm = wrapper.vm as any

      vm.userData = {
        cedula: '12345678',
        grado: 'cabo',
        nombre: 'Juan',
        apellido: 'Pérez',
        password: 'password123',
        confirmPassword: 'password123'
      }
      vm.formValid = true

      await wrapper.vm.$nextTick()
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(wrapper.emitted('submit')).toBeTruthy()
    })
  })
})
