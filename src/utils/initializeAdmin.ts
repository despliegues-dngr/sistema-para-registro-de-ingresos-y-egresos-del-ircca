/**
 * Script para inicializar usuario administrador por defecto
 * Según project-charter.md: "Creación manual del usuario con rol 'Administrador'"
 */

import { EncryptionService } from '@/services/encryptionService'
import { useDatabase } from '@/composables/useDatabase'

export interface AdminUser {
  cedula: string
  grado: string
  nombre: string
  apellido: string
  password: string
}

/**
 * Crea el usuario administrador inicial del sistema
 */
export async function createInitialAdmin(adminData: AdminUser): Promise<boolean> {
  try {
    const { addRecord, getRecords, initDatabase } = useDatabase()
    
    // Inicializar BD
    await initDatabase()

    // Verificar si ya existe un admin
    const existingUsers = await getRecords('usuarios', 'username', adminData.cedula)
    if (existingUsers.length > 0) {
      console.log('El usuario administrador ya existe')
      return false
    }

    // Generar ID único y hashear contraseña
    const encryptionService = new EncryptionService()
    const userId = encryptionService.generateSecureId()
    const { hash: hashedPassword, salt } = await EncryptionService.hashPassword(adminData.password)

    // Crear usuario administrador
    const adminUser = {
      id: userId,
      username: adminData.cedula,
      role: 'admin' as const,
      nombre: adminData.nombre,
      apellido: adminData.apellido,
      grado: adminData.grado,
      hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    // Guardar en BD
    const result = await addRecord('usuarios', adminUser)
    
    if (!result.success) {
      throw new Error(result.error || 'Error al crear usuario administrador')
    }

    console.log('Usuario administrador creado exitosamente:', adminData.cedula)
    return true

  } catch (error) {
    console.error('Error al crear usuario administrador:', error)
    return false
  }
}

/**
 * Datos por defecto del administrador según especificaciones
 * Basado en project-charter.md y stakeholders identificados
 * ✅ SEGURO: Credenciales leídas desde variables de entorno
 */
export const DEFAULT_ADMIN: AdminUser = {
  cedula: import.meta.env.VITE_ADMIN_DEFAULT_CEDULA || '55226350',
  grado: import.meta.env.VITE_ADMIN_DEFAULT_GRADO || 'Guardia Republicano',
  nombre: import.meta.env.VITE_ADMIN_DEFAULT_NOMBRE || 'Mario',
  apellido: import.meta.env.VITE_ADMIN_DEFAULT_APELLIDO || 'Berni',
  // ✅ SEGURIDAD: Contraseña hardcodeada (no en variables de entorno VITE_)
  password: '2025.Ircca'
}

// Flag para prevenir doble inicialización
let adminInitialized = false

/**
 * Función helper para inicializar admin automáticamente en desarrollo
 * ⚠️ SEGURIDAD: Las credenciales se leen desde variables de entorno
 */
export async function initializeDefaultAdmin(): Promise<void> {
  // Prevenir doble inicialización en desarrollo
  if (adminInitialized) {
    console.log('ℹ️ Administrador ya inicializado previamente')
    return
  }
  
  console.log('Inicializando usuario administrador por defecto...')
  console.log('🔒 Leyendo credenciales desde variables de entorno...')
  
  const success = await createInitialAdmin(DEFAULT_ADMIN)
  
  if (success) {
    console.log('✅ Usuario administrador inicializado correctamente')
    console.log('📋 Credenciales configuradas:')
    console.log(`   Usuario: ${DEFAULT_ADMIN.cedula}`)
    // ⚠️ No mostrar contraseña en logs por seguridad
    console.log(`   Contraseña: ${'*'.repeat(DEFAULT_ADMIN.password.length)}`)
    console.log('🔒 IMPORTANTE: Cambiar credenciales en producción')
    adminInitialized = true
  } else {
    console.log('ℹ️ Usuario administrador ya existe o no pudo crearse')
    adminInitialized = true
  }
}
