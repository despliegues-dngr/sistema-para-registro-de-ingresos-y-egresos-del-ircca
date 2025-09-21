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
 */
export const DEFAULT_ADMIN: AdminUser = {
  cedula: '12345678', // Usuario por defecto para testing
  grado: 'teniente',
  nombre: 'Admin',
  apellido: 'Sistema',
  password: 'admin123'
}

/**
 * Función helper para inicializar admin automáticamente en desarrollo
 */
export async function initializeDefaultAdmin(): Promise<void> {
  console.log('Inicializando usuario administrador por defecto...')
  
  const success = await createInitialAdmin(DEFAULT_ADMIN)
  
  if (success) {
    console.log('✅ Usuario administrador inicializado correctamente')
    console.log('📋 Credenciales por defecto:')
    console.log(`   Usuario: ${DEFAULT_ADMIN.cedula}`)
    console.log(`   Contraseña: ${DEFAULT_ADMIN.password}`)
  } else {
    console.log('ℹ️ Usuario administrador ya existe o no pudo crearse')
  }
}
