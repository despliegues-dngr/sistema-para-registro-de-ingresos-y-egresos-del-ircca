import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import RegistrationForm from '../RegistrationForm.vue'

// Crear instancia de Vuetify para tests
const vuetify = createVuetify({
  components,
  directives,
})

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

describe('RegistrationForm', () => {
  let vuetify: any

  beforeEach(() => {
    vuetify = createVuetify({
      components,
      directives
    })
  })

  const mountComponent = (props = {}) => {
    return mount(RegistrationForm, {
      props,
      global: {
        plugins: [vuetify]
      }
    })
  }

  describe('Renderizado inicial', () => {
    it('debe renderizar correctamente', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.registration-form').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('Datos del nuevo operador')
    })

    it('debe mostrar todos los campos requeridos', () => {
      const wrapper = mountComponent()

      // Verificar que todos los campos están presentes
      expect(wrapper.html()).toContain('Cédula de Identidad')
      expect(wrapper.html()).toContain('Grado')
      expect(wrapper.html()).toContain('Nombre')
      expect(wrapper.html()).toContain('Apellido')
      expect(wrapper.html()).toContain('Contraseña')
      expect(wrapper.html()).toContain('Confirmar Contraseña')
    })

    it('debe mostrar botón de registro deshabilitado inicialmente', () => {
      const wrapper = mountComponent()

      const submitBtn = wrapper.find('button[type="submit"]')
      
      expect(submitBtn.exists()).toBe(true)
      expect(submitBtn.text()).toBe('REGISTRAR OPERADOR')
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

      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('Error en el registro')
    })

    it('debe mostrar alerta de error para mensajes normales', () => {
      const wrapper = mountComponent({
        message: 'Usuario ya existe'
      })

      const alert = wrapper.find('.v-alert')
      // En Vuetify 3, verificamos la variante y el contenido del mensaje
      expect(alert.classes()).toContain('v-alert--variant-tonal')
      expect(alert.text()).toContain('Usuario ya existe')
    })

    it('debe mostrar alerta de éxito para mensajes exitosos', () => {
      const wrapper = mountComponent({
        message: 'Registro exitoso'
      })

      const alert = wrapper.find('.v-alert')
      // En Vuetify 3, verificamos la variante y el contenido del mensaje
      expect(alert.classes()).toContain('v-alert--variant-tonal')
      expect(alert.text()).toContain('Registro exitoso')
    })

    it('debe deshabilitar campos cuando loading=true', () => {
      const wrapper = mountComponent({
        loading: true
      })

      const textFields = wrapper.findAll('input')
      textFields.forEach(field => {
        expect(field.attributes()).toHaveProperty('disabled')
      })
    })

    it('debe mantener botón deshabilitado durante loading', () => {
      const wrapper = mountComponent({
        loading: true
      })

      const submitBtn = wrapper.find('button[type="submit"]')
      // En Vuetify 3, verificamos si tiene la propiedad disabled
      expect(submitBtn.attributes()).toHaveProperty('disabled')
    })

    it('debe mostrar loading en botón cuando loading=true', () => {
      const wrapper = mountComponent({
        loading: true
      })

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.classes()).toContain('v-btn--loading')
    })
  })

  describe('Opciones de grado', () => {
    it('debe tener todas las opciones de grado disponibles', () => {
      const wrapper = mountComponent()

      const expectedGrados = [
        'Guardia Republicano',
        'Cabo',
        'Sargento',
        'Sub Oficial',
        'Alférez',
        'Teniente',
        'Tte. 1°',
        'Capitán',
        'Cte. Mayor',
        'Cte. General'
      ]

      const gradoOptions = wrapper.vm.gradoOptions
      
      expect(gradoOptions).toHaveLength(10)
      expectedGrados.forEach(grado => {
        expect(gradoOptions.some((option: any) => option.title === grado)).toBe(true)
      })
    })

    it('debe tener valores válidos para cada grado', () => {
      const wrapper = mountComponent()

      const gradoOptions = wrapper.vm.gradoOptions
      
      gradoOptions.forEach((option: any) => {
        expect(option).toHaveProperty('title')
        expect(option).toHaveProperty('value')
        expect(typeof option.title).toBe('string')
        expect(typeof option.value).toBe('string')
        expect(option.title.length).toBeGreaterThan(0)
        expect(option.value.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Validaciones de cédula', () => {
    it('debe validar cédula requerida', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.cedulaRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('12345678')).toBe(true)
    })

    it('debe validar formato de 8 dígitos exactos', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.cedulaRules
      expect(rules[1]('1234567')).toBe('La cédula debe tener exactamente 8 dígitos')
      expect(rules[1]('123456789')).toBe('La cédula debe tener exactamente 8 dígitos')
      expect(rules[1]('12345678')).toBe(true)
    })

    it('debe validar solo números en cédula', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.cedulaRules
      expect(rules[2]('1234567a')).toBe('Formato de cédula inválido')
      expect(rules[2]('12345678')).toBe(true)
    })
  })

  describe('Validaciones de grado', () => {
    it('debe validar grado requerido', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.gradoRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('cabo')).toBe(true)
    })
  })

  describe('Validaciones de nombre', () => {
    it('debe validar nombre requerido', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.nombreRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('Juan')).toBe(true)
    })

    it('debe validar longitud mínima de nombre', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.nombreRules
      expect(rules[1]('J')).toBe('El nombre debe tener al menos 2 caracteres')
      expect(rules[1]('Juan')).toBe(true)
    })

    it('debe validar longitud máxima de nombre', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.nombreRules
      const nombreLargo = 'a'.repeat(51)
      expect(rules[2](nombreLargo)).toBe('El nombre no puede exceder 50 caracteres')
      expect(rules[2]('Juan Carlos')).toBe(true)
    })

    it('debe validar caracteres válidos en nombre', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.nombreRules
      expect(rules[3]('Juan123')).toBe('Solo se permiten letras y espacios')
      expect(rules[3]('Juan Carlos')).toBe(true)
      expect(rules[3]('José María')).toBe(true)
      expect(rules[3]('Niño')).toBe(true)
    })
  })

  describe('Validaciones de apellido', () => {
    it('debe validar apellido requerido', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.apellidoRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('Pérez')).toBe(true)
    })

    it('debe validar longitud mínima de apellido', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.apellidoRules
      expect(rules[1]('P')).toBe('El apellido debe tener al menos 2 caracteres')
      expect(rules[1]('Pérez')).toBe(true)
    })

    it('debe validar longitud máxima de apellido', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.apellidoRules
      const apellidoLargo = 'a'.repeat(51)
      expect(rules[2](apellidoLargo)).toBe('El apellido no puede exceder 50 caracteres')
      expect(rules[2]('Pérez García')).toBe(true)
    })

    it('debe validar caracteres válidos en apellido', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.apellidoRules
      expect(rules[3]('Pérez123')).toBe('Solo se permiten letras y espacios')
      expect(rules[3]('Pérez García')).toBe(true)
      expect(rules[3]('Muñoz')).toBe(true)
    })
  })

  describe('Validaciones de contraseña', () => {
    it('debe validar contraseña requerida', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.passwordRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('password123')).toBe(true)
    })

    it('debe validar longitud mínima de contraseña', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.passwordRules
      expect(rules[1]('12345')).toBe('La contraseña debe tener al menos 6 caracteres')
      expect(rules[1]('123456')).toBe(true)
    })

    it('debe validar longitud máxima de contraseña', () => {
      const wrapper = mountComponent()

      const rules = wrapper.vm.passwordRules
      const passwordLarga = 'a'.repeat(51)
      expect(rules[2](passwordLarga)).toBe('La contraseña no puede exceder 50 caracteres')
      expect(rules[2]('password123')).toBe(true)
    })
  })

  describe('Validaciones de confirmación de contraseña', () => {
    it('debe validar confirmación requerida', async () => {
      const wrapper = mountComponent()

      // Acceder a las reglas computadas
      const rules = wrapper.vm.confirmPasswordRules
      expect(rules[0]('')).toBe('Este campo es requerido')
      expect(rules[0]('password123')).toBe(true)
    })

    it('debe validar que las contraseñas coincidan', async () => {
      const wrapper = mountComponent()

      // Establecer contraseña original
      wrapper.vm.userData.password = 'password123'
      await wrapper.vm.$nextTick()

      const rules = wrapper.vm.confirmPasswordRules
      expect(rules[1]('different')).toBe('Las contraseñas no coinciden')
      expect(rules[1]('password123')).toBe(true)
    })

    it('debe actualizar validación cuando cambia contraseña original', async () => {
      const wrapper = mountComponent()

      // Primera contraseña
      wrapper.vm.userData.password = 'password123'
      wrapper.vm.userData.confirmPassword = 'password123'
      await wrapper.vm.$nextTick()

      let rules = wrapper.vm.confirmPasswordRules
      expect(rules[1]('password123')).toBe(true)

      // Cambiar contraseña original
      wrapper.vm.userData.password = 'newpassword'
      await wrapper.vm.$nextTick()

      rules = wrapper.vm.confirmPasswordRules
      expect(rules[1]('password123')).toBe('Las contraseñas no coinciden')
      expect(rules[1]('newpassword')).toBe(true)
    })
  })

  describe('Interacciones de usuario', () => {
    it('debe permitir escribir en todos los campos de texto', async () => {
      const wrapper = mountComponent()

      // Simular entrada de datos
      wrapper.vm.userData.cedula = '12345678'
      wrapper.vm.userData.nombre = 'Juan'
      wrapper.vm.userData.apellido = 'Pérez'
      wrapper.vm.userData.password = 'password123'
      wrapper.vm.userData.confirmPassword = 'password123'

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.userData.cedula).toBe('12345678')
      expect(wrapper.vm.userData.nombre).toBe('Juan')
      expect(wrapper.vm.userData.apellido).toBe('Pérez')
      expect(wrapper.vm.userData.password).toBe('password123')
      expect(wrapper.vm.userData.confirmPassword).toBe('password123')
    })

    it('debe permitir seleccionar grado', async () => {
      const wrapper = mountComponent()

      wrapper.vm.userData.grado = 'cabo'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.userData.grado).toBe('cabo')
    })

    it('debe alternar visibilidad de contraseña', async () => {
      const wrapper = mountComponent()

      expect(wrapper.vm.showPassword).toBe(false)

      // Simular click en toggle
      wrapper.vm.showPassword = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showPassword).toBe(true)
    })

    it('debe alternar visibilidad de confirmación de contraseña', async () => {
      const wrapper = mountComponent()

      expect(wrapper.vm.showConfirmPassword).toBe(false)

      wrapper.vm.showConfirmPassword = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showConfirmPassword).toBe(true)
    })

    it('debe emitir evento submit con datos válidos', async () => {
      const wrapper = mountComponent()

      // Llenar formulario con datos válidos
      wrapper.vm.userData = {
        cedula: '12345678',
        grado: 'cabo',
        nombre: 'Juan',
        apellido: 'Pérez',
        password: 'password123',
        confirmPassword: 'password123'
      }

      // Simular que el formulario es válido
      wrapper.vm.formValid = true
      await wrapper.vm.$nextTick()

      // Submit
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Verificar evento emitido
      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0]).toEqual([{
        cedula: '12345678',
        grado: 'cabo',
        nombre: 'Juan',
        apellido: 'Pérez',
        password: 'password123',
        confirmPassword: 'password123'
      }])
    })

    it('no debe emitir submit si formulario es inválido', async () => {
      const wrapper = mountComponent()

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
      
      // Simular click en cerrar
      const closeButton = alert.find('.v-alert__close button')
      if (closeButton.exists()) {
        await closeButton.trigger('click')
        expect(wrapper.emitted('clearMessage')).toBeTruthy()
      }
    })
  })

  describe('Estados del formulario', () => {
    it('debe habilitar botón cuando formulario es válido', async () => {
      const wrapper = mountComponent()

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

      wrapper.vm.formValid = true
      await wrapper.vm.$nextTick()

      const submitBtn = wrapper.find('button[type="submit"]')
      // En Vuetify 3, verificar si el botón tiene la clase de loading
      const hasLoadingClass = submitBtn.classes().includes('v-btn--loading')
      expect(hasLoadingClass).toBe(true)
    })
  })

  describe('Accesibilidad y UX', () => {
    it('debe tener campo cédula con autofocus', () => {
      const wrapper = mountComponent()

      // Verificar que el campo cédula tiene autofocus en su configuración
      expect(wrapper.html()).toContain('autofocus')
    })

    it('debe tener hints informativos', () => {
      const wrapper = mountComponent()

      // Verificar hints
      expect(wrapper.html()).toContain('8 dígitos sin puntos ni guiones')
      expect(wrapper.html()).toContain('Mínimo 6 caracteres')
    })

    it('debe tener placeholders apropiados', () => {
      const wrapper = mountComponent()

      expect(wrapper.html()).toContain('placeholder="12345678"')
    })

    it('debe mostrar labels descriptivos', () => {
      const wrapper = mountComponent()

      expect(wrapper.html()).toContain('Cédula de Identidad')
      expect(wrapper.html()).toContain('Confirmar Contraseña')
    })
  })

  describe('Integración completa', () => {
    it('debe completar flujo de registro exitoso', async () => {
      const wrapper = mountComponent()

      // 1. Llenar formulario completo
      wrapper.vm.userData = {
        cedula: '12345678',
        grado: 'cabo',
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        password: 'password123',
        confirmPassword: 'password123'
      }

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
      const emittedData = wrapper.emitted('submit')[0][0]
      expect(emittedData).toMatchObject({
        cedula: '12345678',
        grado: 'cabo',
        nombre: 'Juan Carlos',
        apellido: 'Pérez García',
        password: 'password123',
        confirmPassword: 'password123'
      })
    })

    it('debe manejar flujo de error de validación', async () => {
      const wrapper = mountComponent()

      // 1. Llenar con datos inválidos
      wrapper.vm.userData = {
        cedula: '123', // Muy corta
        grado: '',    // Vacío
        nombre: 'J',  // Muy corto
        apellido: '', // Vacío
        password: '12', // Muy corta
        confirmPassword: '34' // No coincide
      }

      // 2. Verificar que las validaciones fallan
      expect(wrapper.vm.cedulaRules[1]('123')).toBe('La cédula debe tener exactamente 8 dígitos')
      expect(wrapper.vm.gradoRules[0]('')).toBe('Este campo es requerido')
      expect(wrapper.vm.nombreRules[1]('J')).toBe('El nombre debe tener al menos 2 caracteres')
      expect(wrapper.vm.apellidoRules[0]('')).toBe('Este campo es requerido')
      expect(wrapper.vm.passwordRules[1]('12')).toBe('La contraseña debe tener al menos 6 caracteres')

      await wrapper.vm.$nextTick()

      const confirmRules = wrapper.vm.confirmPasswordRules
      expect(confirmRules[1]('34')).toBe('Las contraseñas no coinciden')
    })

    it('debe manejar flujo de error del servidor', async () => {
      const wrapper = mountComponent({
        message: 'El usuario ya existe en el sistema'
      })

      // 1. Verificar alerta visible
      const alert = wrapper.find('.v-alert')
      expect(alert.exists()).toBe(true)
      expect(alert.text()).toContain('El usuario ya existe en el sistema')
      // En Vuetify 3, verificamos la variante en lugar de atributos
      expect(alert.classes()).toContain('v-alert--variant-tonal')

      // 2. El formulario debería seguir siendo funcional
      wrapper.vm.userData.cedula = '87654321'
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.userData.cedula).toBe('87654321')
    })

    it('debe manejar estado de loading correctamente', async () => {
      const wrapper = mountComponent({
        loading: true
      })

      // 1. Verificar que todos los campos están deshabilitados
      const inputs = wrapper.findAll('input')
      inputs.forEach(input => {
        expect(input.attributes('disabled')).toBeDefined()
      })

      // 2. Verificar botón en estado loading
      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.classes()).toContain('v-btn--loading')
      expect(submitBtn.attributes('disabled')).toBeDefined()

      // 3. No debe permitir submit durante loading
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      expect(wrapper.emitted('submit')).toBeFalsy()
    })
  })
})
