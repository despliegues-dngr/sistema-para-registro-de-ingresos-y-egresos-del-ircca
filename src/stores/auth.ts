import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { EncryptionService } from '@/services/encryptionService'
import { useDatabase } from '@/composables/useDatabase'
import { useAuditStore } from './audit'

// Interfaz para usuario almacenado en BD
interface StoredUser {
  id: string
  username: string
  role: 'admin' | 'supervisor' | 'operador'
  nombre: string
  apellido: string
  grado: string
  hashedPassword: string
  salt: string
  createdAt: string
  lastLogin: string | null
}

export interface User {
  id: string
  username: string
  role: 'admin' | 'supervisor' | 'operador'
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
  terminosCondiciones: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loginAttempts = ref(0)
  const maxLoginAttempts = ref(3)

  // Clave para localStorage (con prefijo para evitar conflictos)
  const SESSION_KEY = 'ircca_auth_session'
  
  // Función para guardar sesión en localStorage
  function saveSession() {
    if (user.value && isAuthenticated.value) {
      const sessionData = {
        user: user.value,
        isAuthenticated: isAuthenticated.value,
        timestamp: Date.now()
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    }
  }
  
  // Función para restaurar sesión desde localStorage
  function restoreSession(): boolean {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData) return false
      
      const parsed = JSON.parse(sessionData)
      const sessionAge = Date.now() - parsed.timestamp
      const maxSessionAge = 3 * 60 * 60 * 1000 // 3 horas (mismo que el timeout)
      
      // Verificar que la sesión no haya expirado
      if (sessionAge > maxSessionAge) {
        clearSession()
        return false
      }
      
      // Restaurar datos
      user.value = parsed.user
      isAuthenticated.value = parsed.isAuthenticated
      return true
      
    } catch {
      clearSession()
      return false
    }
  }
  
  // Función para limpiar sesión de localStorage
  function clearSession() {
    localStorage.removeItem(SESSION_KEY)
  }

  // Getters
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSupervisor = computed(() => user.value?.role === 'supervisor')
  const isOperador = computed(() => user.value?.role === 'operador')
  const canAttemptLogin = computed(() => loginAttempts.value < maxLoginAttempts.value)

  /**
   * Login con verificación de credenciales en base de datos
   */
  async function login(username: string, password: string): Promise<void> {
    const auditStore = useAuditStore()
    const sessionId = crypto.randomUUID()
    
    try {
      if (!canAttemptLogin.value) {
        // Log de cuenta bloqueada
        await auditStore.logAuthEvent(
          'unknown',
          username,
          'login.blocked',
          sessionId,
          { reason: 'max_attempts_exceeded', attempts: loginAttempts.value }
        )
        throw new Error('Máximo número de intentos de login excedido. Contacte al administrador.')
      }

      // Inicializar BD si no está inicializada
      await initDatabase()

      // Buscar usuario por username (cédula)
      const users = await getRecords('usuarios', 'username', username)
      if (users.length === 0) {
        incrementLoginAttempts()
        // Log de login fallido - usuario no encontrado
        await auditStore.logAuthEvent(
          'unknown',
          username,
          'login.failed',
          sessionId,
          { reason: 'user_not_found', attempts: loginAttempts.value }
        )
        throw new Error('Usuario no encontrado')
      }

      const dbUser = users[0] as StoredUser

      // Verificar contraseña usando método estático
      const isPasswordValid = await EncryptionService.verifyPassword(
        password,
        dbUser.hashedPassword,
        dbUser.salt
      )

      if (!isPasswordValid) {
        incrementLoginAttempts()
        // Log de login fallido - contraseña incorrecta
        await auditStore.logAuthEvent(
          dbUser.id,
          dbUser.username,
          'login.failed',
          sessionId,
          { reason: 'invalid_password', attempts: loginAttempts.value }
        )
        throw new Error('Contraseña incorrecta')
      }

      // Actualizar último login en la BD
      await updateRecord('usuarios', dbUser.id, {
        lastLogin: new Date().toISOString()
      })

      // Login exitoso - establecer usuario
      user.value = {
        id: dbUser.id,
        username: dbUser.username,
        role: dbUser.role || 'operador',
        nombre: dbUser.nombre,
        apellido: dbUser.apellido,
        grado: dbUser.grado,
        cedula: dbUser.username, // Alias para compatibilidad
        lastLogin: new Date(),
        fechaRegistro: dbUser.createdAt ? dbUser.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
      }

      isAuthenticated.value = true
      loginAttempts.value = 0 // Reset intentos tras login exitoso

      // Guardar sesión en localStorage
      saveSession()

      // ✅ Log de login exitoso
      await auditStore.logAuthEvent(
        dbUser.id,
        dbUser.username,
        'login.success',
        sessionId,
        { 
          role: dbUser.role,
          nombre: `${dbUser.nombre} ${dbUser.apellido}`,
          previousLogin: dbUser.lastLogin
        }
      )

    } catch (error) {
      throw error
    }
  }

  async function logout() {
    const auditStore = useAuditStore()
    
    // Registrar evento de auditoría antes de limpiar datos
    if (user.value) {
      // Calcular duración de sesión (manejar lastLogin como Date o string)
      let sessionDuration = 0
      if (user.value.lastLogin) {
        const lastLoginTime = user.value.lastLogin instanceof Date 
          ? user.value.lastLogin.getTime() 
          : new Date(user.value.lastLogin).getTime()
        sessionDuration = Date.now() - lastLoginTime
      }
      
      await auditStore.logAuthEvent(
        user.value.id,
        user.value.username,
        'logout',
        'manual',
        { 
          role: user.value.role,
          sessionDuration
        }
      )
    }
    
    // Limpiar estado del usuario
    user.value = null
    isAuthenticated.value = false
    loginAttempts.value = 0
    clearSession()
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
  const { addRecord, getRecords, updateRecord, initDatabase } = useDatabase()

  // Actions
  const registerUser = async (userData: RegisterUserData): Promise<void> => {
    try {
      // Validar que los términos fueron aceptados
      if (!userData.terminosCondiciones) {
        throw new Error('Debe aceptar los términos y condiciones para proceder con el registro')
      }

      // Inicializar BD si no está inicializada
      await initDatabase()

      // Verificar que no exista un usuario con esa cédula
      const existingUsers = await getRecords('usuarios', 'username', userData.cedula)
      if (existingUsers.length > 0) {
        throw new Error('Ya existe un usuario registrado con esa cédula')
      }

      // Hashear la contraseña usando método estático (consistencia con initializeAdmin)
      const { hash: hashedPassword, salt } = await EncryptionService.hashPassword(userData.password)

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
        terminosCondiciones: userData.terminosCondiciones,
        fechaAceptacionTerminos: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastLogin: null
      }

      // Guardar en la base de datos
      const result = await addRecord('usuarios', newUser)
      
      if (!result.success) {
        throw new Error(result.error || 'Error al guardar el usuario en la base de datos')
      }

      // Si llegamos aquí, el registro fue exitoso

    } catch (error) {
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
      const updateData: {
        grado: string
        nombre: string
        apellido: string
        username?: string
      } = {
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
      
      // Guardar sesión actualizada
      saveSession()

    } catch (error) {
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
      // ✅ CORRECCIÓN: Buscar por username en lugar de id (índice que sí existe)
      const users = await getRecords('usuarios', 'username', user.value.username)
      
      if (users.length === 0) {
        throw new Error('Usuario no encontrado')
      }

      const currentUser = users[0] as StoredUser
      
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
      const { hash: newHashedPassword, salt: newSalt } = 
        await EncryptionService.hashPassword(newPassword)

      // Actualizar en la base de datos
      const result = await updateRecord('usuarios', user.value.id, {
        hashedPassword: newHashedPassword,
        salt: newSalt,
      })

      if (!result.success) {
        throw new Error(result.error || 'Error al cambiar la contraseña')
      }

    } catch (error) {
      throw error
    }
  }

  // Inicializar sesión al crear el store
  restoreSession()

  return {
    user,
    isAuthenticated,
    loginAttempts,
    maxLoginAttempts,
    isAdmin,
    isSupervisor,
    isOperador,
    canAttemptLogin,
    login,
    logout,
    incrementLoginAttempts,
    resetLoginAttempts,
    registerUser,
    updateUserProfile,
    changePassword,
    restoreSession,
    clearSession,
  }
})
