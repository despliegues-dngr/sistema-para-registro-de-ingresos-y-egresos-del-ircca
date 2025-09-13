import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  // Computed properties
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const isOperador = computed(() => authStore.isOperador)
  const canLogin = computed(() => authStore.canAttemptLogin)

  // Authentication methods
  const login = async (username: string, password: string) => {
    try {
      // TODO: Implementar autenticación con cifrado
      // Por ahora simulamos usuarios hardcodeados para desarrollo

      if (username === 'admin' && password === 'admin123') {
        authStore.login({
          id: '1',
          username: 'admin',
          role: 'admin',
          lastLogin: new Date(),
        })
        router.push('/dashboard')
        return { success: true }
      }

      if (username === 'operador' && password === 'op123') {
        authStore.login({
          id: '2',
          username: 'operador',
          role: 'operador',
          lastLogin: new Date(),
        })
        router.push('/dashboard')
        return { success: true }
      }

      // Credenciales incorrectas
      authStore.incrementLoginAttempts()
      return {
        success: false,
        error: 'Credenciales incorrectas',
        attemptsLeft: authStore.maxLoginAttempts - authStore.loginAttempts,
      }
    } catch {
      return {
        success: false,
        error: 'Error en el sistema de autenticación',
      }
    }
  }

  const logout = () => {
    authStore.logout()
    router.push('/login')
  }

  const resetAttempts = () => {
    authStore.resetLoginAttempts()
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    isOperador,
    canLogin,
    // Methods
    login,
    logout,
    resetAttempts,
  }
}
