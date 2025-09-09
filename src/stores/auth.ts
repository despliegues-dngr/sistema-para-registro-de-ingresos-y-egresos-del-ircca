import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: string
  username: string
  role: 'admin' | 'operador'
  lastLogin?: Date
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loginAttempts = ref(0)
  const maxLoginAttempts = ref(3)
  
  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isOperador = computed(() => user.value?.role === 'operador')
  const canAttemptLogin = computed(() => loginAttempts.value < maxLoginAttempts.value)
  
  // Actions
  function login(userData: User) {
    user.value = userData
    isAuthenticated.value = true
    loginAttempts.value = 0
    // TODO: Implementar cifrado de sesión
  }
  
  function logout() {
    user.value = null
    isAuthenticated.value = false
    loginAttempts.value = 0
    // TODO: Limpiar datos cifrados
  }
  
  function incrementLoginAttempts() {
    loginAttempts.value++
  }
  
  function resetLoginAttempts() {
    loginAttempts.value = 0
  }

  return {
    // State
    user,
    isAuthenticated,
    loginAttempts,
    maxLoginAttempts,
    // Getters
    isAdmin,
    isOperador,
    canAttemptLogin,
    // Actions
    login,
    logout,
    incrementLoginAttempts,
    resetLoginAttempts
  }
})
