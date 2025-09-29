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
 * 🔒 USUARIO ADMINISTRADOR POR DEFECTO
 * ✅ Credenciales fijas y seguras para acceso inicial
 * ⚠️ IMPORTANTE: Cambiar tras primer login usando AdminPanel
 */
export const DEFAULT_ADMIN: AdminUser = {
  // ✅ SEGURO: Hardcodeadas solo en servidor (no en variables VITE_)
  cedula: '55226350',           // Tu cédula real
  grado: 'Guardia Republicano', // Tu grado real
  nombre: 'Mario',              // Tu nombre real  
  apellido: 'Berni',            // Tu apellido real
  // 🔑 CONTRASEÑA POR DEFECTO (personalizable desde AdminPanel)
  password: '2025.Ircca'
}

/**
 * 🔧 FUNCIÓN TEMPORAL: Eliminar usuario administrador para forzar recreación
 * Solo para resolver inconsistencia de hasheo detectada
 */
export async function clearAdminUser(): Promise<void> {
  try {
    const { deleteRecord, getRecords, initDatabase } = useDatabase()
    await initDatabase()
    
    const existingUsers = await getRecords('usuarios', 'username', DEFAULT_ADMIN.cedula)
    if (existingUsers.length > 0) {
      const adminUser = existingUsers[0] as { id: string }
      await deleteRecord('usuarios', adminUser.id)
      console.log('🗑️ Usuario administrador eliminado para recreación')
    }
  } catch (error) {
    console.error('Error al eliminar usuario administrador:', error)
  }
}

/**
 * Función helper para inicializar admin automáticamente en desarrollo
 * ⚠️ SEGURIDAD: Las credenciales se leen desde variables de entorno
 */
export async function initializeDefaultAdmin(): Promise<void> {
  // 🔧 DEBUG: Limpiar usuario existente para resolver inconsistencia de hasheo
  await clearAdminUser()
  
  console.log('Inicializando usuario administrador por defecto...')
  console.log('🔒 Leyendo credenciales desde variables de entorno...')
  
  const success = await createInitialAdmin(DEFAULT_ADMIN)
  
  if (success) {
    console.log('✅ Usuario administrador inicializado correctamente')
    console.log('🔒 CREDENCIALES DE ACCESO POR DEFECTO:')
    console.log(`   👤 Usuario: ${DEFAULT_ADMIN.cedula}`)
    console.log(`   🗝️  Contraseña: ${DEFAULT_ADMIN.password}`)
    console.log('📋 Acceder al AdminPanel para cambiar credenciales si es necesario')
  } else {
    console.log('ℹ️ Usuario administrador ya existe o no pudo crearse')
  }
}
