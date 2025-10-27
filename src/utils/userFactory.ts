/**
 * Factory para creación centralizada de usuarios
 * Evita duplicación de código y asegura consistencia
 * Inicializa TODOS los campos requeridos: seguridad + feedback
 */

import { EncryptionService } from '@/services/encryptionService'

export interface CreateUserParams {
  cedula: string
  nombre: string
  apellido: string
  grado: string
  password: string
  role: 'admin' | 'supervisor' | 'operador'
  terminosCondiciones?: boolean
  fechaAceptacionTerminos?: string
}

/**
 * Crea un objeto de usuario con todos los campos necesarios
 * Centraliza la lógica de creación para evitar inconsistencias
 */
export async function createUser(params: CreateUserParams): Promise<Record<string, unknown>> {
  // Hashear contraseña
  const { hash: hashedPassword, salt } = await EncryptionService.hashPassword(params.password)

  // Crear objeto usuario base
  const baseUser: Record<string, unknown> = {
    username: params.cedula,
    role: params.role,
    nombre: params.nombre,
    apellido: params.apellido,
    grado: params.grado,
    hashedPassword,
    salt,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    // ✅ SEGURIDAD: Campos de bloqueo temporal (v5)
    loginAttempts: 0,
    isLocked: false,
    lastFailedAttempt: null,
    lockedUntil: null,
    // ✅ FEEDBACK: Campos inicializados para todos los usuarios (v5)
    totalRegistrosRealizados: 0,
    encuestaCompletada: false,
    fechaEncuesta: null,
    encuestaDismissed: false,
    encuestaPostpuesta: false,
    ultimoRecordatorioEn: 0,
  }

  // Agregar campos específicos de operadores
  if (params.role === 'operador') {
    baseUser.terminosCondiciones = params.terminosCondiciones ?? false
    baseUser.fechaAceptacionTerminos = params.fechaAceptacionTerminos ?? new Date().toISOString()
  }

  return baseUser
}

/**
 * Genera un ID único para un usuario
 */
export function generateUserId(): string {
  const encryptionService = new EncryptionService()
  return encryptionService.generateSecureId()
}
