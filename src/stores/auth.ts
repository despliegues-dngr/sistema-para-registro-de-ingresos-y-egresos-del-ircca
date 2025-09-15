import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { EncryptionService } from '@/services/encryptionService'
import { useDatabase } from '@/composables/useDatabase'

export interface User {
  id: string
  username: string
  role: 'admin' | 'operador'
  lastLogin?: Date
  nombre?: string
  apellido?: string
  grado?: string
}

export interface RegisterUserData {
  cedula: string
  grado: string
  nombre: string
  apellido: string
  password: string
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

  // Instancias de servicios
  const encryptionService = new EncryptionService()
  const { addRecord, getRecords, initDatabase } = useDatabase()

  // Actions
  const registerUser = async (userData: RegisterUserData): Promise<void> => {
    try {
      // Inicializar BD si no está inicializada
      await initDatabase()

      // Verificar que no exista un usuario con esa cédula
      const existingUsers = await getRecords('usuarios', 'username', userData.cedula)
      if (existingUsers.length > 0) {
        throw new Error('Ya existe un usuario registrado con esa cédula')
      }

      // Hashear la contraseña
      const { hash: hashedPassword, salt } = await encryptionService.hashPassword(userData.password)

      // Generar ID único para el usuario
      const userId = encryptionService.generateSecureId()

      // Crear objeto usuario
      const newUser = {
        id: userId,
        username: userData.cedula, // La cédula funciona como username
        role: 'operador' as const,
        nombre: userData.nombre,
        apellido: userData.apellido,
        grado: userData.grado,
        hashedPassword,
        salt,
        createdAt: new Date().toISOString(),
        lastLogin: null
      }

      // Guardar en la base de datos
      const result = await addRecord('usuarios', newUser)
      
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar el usuario en la base de datos')
      }

      // Si llegamos aquí, el registro fue exitoso
      console.log('Usuario registrado exitosamente:', newUser.username)

    } catch (error) {
      console.error('Error en registerUser:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    loginAttempts,
    maxLoginAttempts,
    isAdmin,
    isOperador,
    canAttemptLogin,
    login,
    logout,
    incrementLoginAttempts,
    resetLoginAttempts,
    registerUser,
  }
})
