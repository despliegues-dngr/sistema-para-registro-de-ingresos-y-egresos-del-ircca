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
  cedula?: string // Alias para username (para compatibilidad)
  fechaRegistro?: string // Fecha de creación del usuario
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
    // Asegurar compatibilidad de datos
    user.value = {
      ...userData,
      cedula: userData.cedula || userData.username, // cedula es alias de username
      fechaRegistro: userData.fechaRegistro || new Date().toISOString().split('T')[0] // Fecha por defecto si no existe
    }
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

  // Actualizar perfil de usuario
  async function updateUserProfile(updatedData: {
    cedula: string
    grado: string
    nombre: string
    apellido: string
  }) {
    try {
      if (!user.value) {
        throw new Error('No hay usuario autenticado')
      }

      const { initDatabase, updateRecord, getRecords } = useDatabase()
      await initDatabase()

      // Verificar si la cédula cambió
      let updateData: any = {
        grado: updatedData.grado,
        nombre: updatedData.nombre,
        apellido: updatedData.apellido,
      }

      // Si la cédula cambió, verificar que no exista otro usuario con esa cédula
      if (updatedData.cedula !== user.value.username) {
        const existingUsers = await getRecords('usuarios', 'username', updatedData.cedula)
        if (existingUsers.length > 0) {
          throw new Error('Ya existe un usuario registrado con esa cédula')
        }
        
        // Permitir cambio de cédula (username)
        updateData.username = updatedData.cedula
      }

      // Actualizar en la base de datos
      const result = await updateRecord('usuarios', user.value.id, updateData)

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar el perfil')
      }

      // Actualizar el estado local
      user.value = {
        ...user.value,
        username: updatedData.cedula, // Actualizar también el username
        cedula: updatedData.cedula, // Mantener consistencia
        grado: updatedData.grado,
        nombre: updatedData.nombre,
        apellido: updatedData.apellido,
      }

      console.log('Perfil actualizado exitosamente')

    } catch (error) {
      console.error('Error en updateUserProfile:', error)
      throw error
    }
  }

  // Cambiar contraseña
  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      if (!user.value) {
        throw new Error('No hay usuario autenticado')
      }

      const { initDatabase, getRecords, updateRecord } = useDatabase()
      await initDatabase()

      // Obtener usuario actual de la base de datos
      const users = await getRecords('usuarios', 'id', user.value.id)
      if (users.length === 0) {
        throw new Error('Usuario no encontrado')
      }

      const currentUser = users[0]
      
      // Verificar contraseña actual
      const isCurrentPasswordValid = await EncryptionService.verifyPassword(
        currentPassword, 
        currentUser.hashedPassword, 
        currentUser.salt
      )

      if (!isCurrentPasswordValid) {
        throw new Error('La contraseña actual es incorrecta')
      }

      // Generar nueva contraseña hasheada
      const { hashedPassword: newHashedPassword, salt: newSalt } = 
        await EncryptionService.hashPassword(newPassword)

      // Actualizar en la base de datos
      const result = await updateRecord('usuarios', user.value.id, {
        hashedPassword: newHashedPassword,
        salt: newSalt,
      })

      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar la contraseña')
      }

      console.log('Contraseña cambiada exitosamente')

    } catch (error) {
      console.error('Error en changePassword:', error)
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
    updateUserProfile,
    changePassword,
  }
})
