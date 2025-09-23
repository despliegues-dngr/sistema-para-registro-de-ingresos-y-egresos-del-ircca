/**
 * Tipos específicos para testing Vue components
 * Soluciona el problema de acceso a propiedades internas en wrapper.vm
 */

import type { ComponentPublicInstance } from 'vue'

// Tipo extendido para testing que permite acceso a propiedades internas
export type ComponentTestInstance<T = Record<string, unknown>> = ComponentPublicInstance & T

// Tipos específicos para componentes de testing
export interface RegistrationFormTestProps {
  userData: {
    cedula: string
    grado: string
    nombre: string
    apellido: string
    password: string
    confirmPassword: string
    terminosCondiciones: boolean
  }
  formValid: boolean
  showPassword: boolean
  showConfirmPassword: boolean
  gradoOptions: Array<{ text: string; value: string }>
  cedulaRules: Array<(v: string) => string | boolean>
  gradoRules: Array<(v: string) => string | boolean>
  nombreRules: Array<(v: string) => string | boolean>
  apellidoRules: Array<(v: string) => string | boolean>
  passwordRules: Array<(v: string) => string | boolean>
  confirmPasswordRules: Array<(v: string) => string | boolean>
}

export interface LoginViewTestProps {
  loading: boolean
  showHelp: boolean
  showRegister: boolean
  message: string
}

// Helper para casting de componentes en tests
export function asTestComponent<T>(component: ComponentPublicInstance): ComponentTestInstance<T> {
  return component as ComponentTestInstance<T>
}
