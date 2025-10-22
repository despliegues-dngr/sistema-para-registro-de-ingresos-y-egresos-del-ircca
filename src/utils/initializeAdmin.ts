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

    // ✅ MEJORADO: Verificar si ya existe un usuario con rol 'admin'
    const allUsers = await getRecords('usuarios') as Array<Record<string, unknown>>
    const existingAdmin = allUsers.find(user => user.role === 'admin')
    
    if (existingAdmin) {
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

    return true

  } catch {
    return false
  }
}

/**
 * 🔒 USUARIO ADMINISTRADOR POR DEFECTO
 * ✅ Credenciales desde variables de entorno (más seguro)
 * ⚠️ IMPORTANTE: Cambiar tras primer login usando AdminPanel
 * 
 * Variables de entorno requeridas:
 * - VITE_ADMIN_CEDULA
 * - VITE_ADMIN_PASSWORD
 * - VITE_ADMIN_NOMBRE
 * - VITE_ADMIN_APELLIDO
 * - VITE_ADMIN_GRADO
 */
export const DEFAULT_ADMIN: AdminUser = {
  cedula: import.meta.env.VITE_ADMIN_CEDULA || '55226350',
  grado: import.meta.env.VITE_ADMIN_GRADO || 'Guardia Republicano',
  nombre: import.meta.env.VITE_ADMIN_NOMBRE || 'Mario',
  apellido: import.meta.env.VITE_ADMIN_APELLIDO || 'Berni',
  password: import.meta.env.VITE_ADMIN_PASSWORD || '2025.Ircca'
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
    }
  } catch {
    // Error silencioso
  }
}

/**
 * 🔒 USUARIO SUPERVISOR POR DEFECTO
 * ✅ Credenciales desde variables de entorno (más seguro)
 * 
 * Variables de entorno requeridas:
 * - VITE_SUPERVISOR_CEDULA
 * - VITE_SUPERVISOR_PASSWORD
 * - VITE_SUPERVISOR_NOMBRE
 * - VITE_SUPERVISOR_APELLIDO
 * - VITE_SUPERVISOR_GRADO
 */
export const DEFAULT_SUPERVISOR: AdminUser = {
  cedula: import.meta.env.VITE_SUPERVISOR_CEDULA || '12345678',
  grado: import.meta.env.VITE_SUPERVISOR_GRADO || 'Encargado',
  nombre: import.meta.env.VITE_SUPERVISOR_NOMBRE || 'Carlos',
  apellido: import.meta.env.VITE_SUPERVISOR_APELLIDO || 'Torres',
  password: import.meta.env.VITE_SUPERVISOR_PASSWORD || '2025.Supervisor'
}

/**
 * Crea el usuario supervisor del sistema
 */
export async function createInitialSupervisor(supervisorData: AdminUser): Promise<boolean> {
  try {
    const { addRecord, getRecords, initDatabase } = useDatabase()
    
    // Inicializar BD
    await initDatabase()

    // ✅ MEJORADO: Verificar si ya existe un usuario con rol 'supervisor'
    const allUsers = await getRecords('usuarios') as Array<Record<string, unknown>>
    const existingSupervisor = allUsers.find(user => user.role === 'supervisor')
    
    if (existingSupervisor) {
      return false
    }

    // Generar ID único y hashear contraseña
    const encryptionService = new EncryptionService()
    const userId = encryptionService.generateSecureId()
    const { hash: hashedPassword, salt } = await EncryptionService.hashPassword(supervisorData.password)

    // Crear usuario supervisor
    const supervisorUser = {
      id: userId,
      username: supervisorData.cedula,
      role: 'supervisor' as const,
      nombre: supervisorData.nombre,
      apellido: supervisorData.apellido,
      grado: supervisorData.grado,
      hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
      lastLogin: null
    }

    // Guardar en BD
    const result = await addRecord('usuarios', supervisorUser)
    
    if (!result.success) {
      throw new Error(result.error || 'Error al crear usuario supervisor')
    }

    return true

  } catch {
    return false
  }
}

/**
 * Función helper para inicializar admin automáticamente
 * ✅ Se ejecuta en todos los entornos (desarrollo y producción)
 * ⚠️ SEGURIDAD: Solo muestra credenciales en modo desarrollo
 */
export async function initializeDefaultAdmin(): Promise<void> {
  await createInitialAdmin(DEFAULT_ADMIN)
}

/**
 * Función helper para inicializar supervisor automáticamente
 * ✅ Se ejecuta en todos los entornos (desarrollo y producción)
 * ⚠️ SEGURIDAD: Solo muestra credenciales en modo desarrollo
 */
export async function initializeDefaultSupervisor(): Promise<void> {
  await createInitialSupervisor(DEFAULT_SUPERVISOR)
}
