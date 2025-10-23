/**
 * Encryption Manager - Gestión de cifrado/descifrado de registros
 * Responsable de todas las operaciones de encriptación de datos sensibles
 */

import { encryptionService } from '../encryptionService'
import type { RegistroIngreso, RegistroSalida, DatosAcompanante } from '@/stores/registro'
import type { 
  RegistroIngresoCifrado, 
  RegistroSalidaCifrado, 
  DatosEncriptados 
} from './types'

/**
 * Cifra un registro de ingreso completo
 */
export async function cifrarRegistroIngreso(
  registro: RegistroIngreso,
  sessionKey: string
): Promise<Record<string, unknown>> {
  // ✅ CIFRAR TODOS LOS DATOS SENSIBLES DE LA PERSONA (Compliance Ley 18.331)
  const datosPersonaCompletos = {
    datosPersonales: registro.datosPersonales,
    datosVisita: registro.datosVisita,
    observaciones: registro.observaciones
  }
  
  const encryptedPersona = await encryptionService.encrypt(
    JSON.stringify(datosPersonaCompletos), 
    sessionKey
  )
  
  // Cifrar datos de vehículo si existen
  let encryptedVehiculo: DatosEncriptados | undefined
  if (registro.datosVehiculo) {
    encryptedVehiculo = await encryptionService.encrypt(
      JSON.stringify(registro.datosVehiculo), 
      sessionKey
    )
  }
  
  // ✅ CIFRAR ACOMPAÑANTES si existen (COMPLIANCE LEY 18.331)
  let encryptedAcompanantes: DatosEncriptados | undefined
  if (registro.acompanantes && registro.acompanantes.length > 0) {
    // ✅ ESTRUCTURA MEJORADA: Cada acompañante con metadata para consultas futuras
    const acompanantesConMetadata = registro.acompanantes.map((acompanante, index) => ({
      ...acompanante,
      posicionEnGrupo: index + 1,
      registroGrupalId: registro.id,
      fechaIngreso: registro.timestamp,
      estado: 'dentro'
    }))
    
    encryptedAcompanantes = await encryptionService.encrypt(
      JSON.stringify(acompanantesConMetadata), 
      sessionKey
    )
  }

  // ✅ CREAR REGISTRO LIMPIO - SOLO DATOS CIFRADOS
  return {
    id: registro.id,
    tipo: registro.tipo,
    timestamp: registro.timestamp,
    operadorId: registro.operadorId,
    persona: encryptedPersona,
    vehiculo: encryptedVehiculo,
    acompanantes: encryptedAcompanantes,
    encrypted: true
  }
}

/**
 * Cifra un registro de salida
 */
export async function cifrarRegistroSalida(
  registro: RegistroSalida,
  sessionKey: string
): Promise<Record<string, unknown>> {
  // Cifrar la cédula buscada
  const encryptedPersona = await encryptionService.encrypt(
    registro.cedulaBuscada, 
    sessionKey
  )
  
  // ✅ Cifrar datos de vehículo de salida si existen
  let encryptedVehiculo: DatosEncriptados | undefined
  if (registro.datosVehiculoSalida) {
    encryptedVehiculo = await encryptionService.encrypt(
      JSON.stringify(registro.datosVehiculoSalida), 
      sessionKey
    )
  }

  // ✅ CREAR REGISTRO LIMPIO
  const encryptedRegistro: Record<string, unknown> = {
    id: registro.id,
    tipo: registro.tipo,
    timestamp: registro.timestamp,
    operadorId: registro.operadorId,
    persona: encryptedPersona,
    cedulaBuscada: registro.cedulaBuscada,
    tiempoEstadia: registro.tiempoEstadia,
    encrypted: true
  }
  
  // Agregar campos opcionales
  if (encryptedVehiculo) {
    encryptedRegistro.datosVehiculoSalida = encryptedVehiculo
  }
  
  if (registro.acompanantesSalida && registro.acompanantesSalida.length > 0) {
    encryptedRegistro.acompanantesSalida = registro.acompanantesSalida
  }
  
  if (registro.observaciones) {
    encryptedRegistro.observaciones = registro.observaciones
  }

  return encryptedRegistro
}

/**
 * Descifra un registro de ingreso completo
 */
export async function descifrarRegistroIngreso(
  registroCifrado: RegistroIngresoCifrado,
  sessionKey: string
): Promise<RegistroIngreso> {
  // 1. Descifrar datos de persona
  let datosPersonaCompletos: Record<string, unknown> | null = null
  if (registroCifrado.persona) {
    const personaDescifrada = await encryptionService.decrypt(
      registroCifrado.persona.encrypted,
      sessionKey,
      registroCifrado.persona.salt,
      registroCifrado.persona.iv
    )
    datosPersonaCompletos = JSON.parse(personaDescifrada) as Record<string, unknown>
  }

  // 2. Descifrar datos de vehículo (si existe)
  let datosVehiculo: Record<string, unknown> | null = null
  if (registroCifrado.vehiculo) {
    const vehiculoDescifrado = await encryptionService.decrypt(
      registroCifrado.vehiculo.encrypted,
      sessionKey,
      registroCifrado.vehiculo.salt,
      registroCifrado.vehiculo.iv
    )
    datosVehiculo = JSON.parse(vehiculoDescifrado) as Record<string, unknown>
  }

  // 3. Descifrar acompañantes (si existen)
  let acompanantes: unknown[] = []
  if (registroCifrado.acompanantes) {
    const acompanantesDescifrados = await encryptionService.decrypt(
      registroCifrado.acompanantes.encrypted,
      sessionKey,
      registroCifrado.acompanantes.salt,
      registroCifrado.acompanantes.iv
    )
    acompanantes = JSON.parse(acompanantesDescifrados)
  }

  // 4. Construir registro completo descifrado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const personaData = datosPersonaCompletos as any
  const registroDescifrado: RegistroIngreso = {
    id: registroCifrado.id,
    tipo: 'ingreso',
    timestamp: new Date(registroCifrado.timestamp),
    operadorId: registroCifrado.operadorId,
    datosPersonales: personaData?.datosPersonales || {},
    datosVisita: personaData?.datosVisita || {},
    observaciones: personaData?.observaciones,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    datosVehiculo: datosVehiculo as any || undefined,
    acompanantes: acompanantes.length > 0 ? (acompanantes as DatosAcompanante[]) : undefined
  }

  return registroDescifrado
}

/**
 * Descifra un registro de salida
 */
export async function descifrarRegistroSalida(
  registroCifrado: RegistroSalidaCifrado,
  sessionKey: string
): Promise<RegistroSalida> {
  // Descifrar cédula buscada
  let cedulaBuscada = ''
  if (registroCifrado.persona) {
    cedulaBuscada = await encryptionService.decrypt(
      registroCifrado.persona.encrypted,
      sessionKey,
      registroCifrado.persona.salt,
      registroCifrado.persona.iv
    )
  }

  // ✅ Descifrar datos de vehículo de salida si existen
  let datosVehiculoSalida = undefined
  if (registroCifrado.datosVehiculoSalida) {
    const vehiculoJson = await encryptionService.decrypt(
      registroCifrado.datosVehiculoSalida.encrypted,
      sessionKey,
      registroCifrado.datosVehiculoSalida.salt,
      registroCifrado.datosVehiculoSalida.iv
    )
    datosVehiculoSalida = JSON.parse(vehiculoJson)
  }

  const registroDescifrado: RegistroSalida = {
    id: registroCifrado.id,
    tipo: 'salida',
    timestamp: new Date(registroCifrado.timestamp),
    cedulaBuscada,
    tiempoEstadia: registroCifrado.tiempoEstadia,
    operadorId: registroCifrado.operadorId,
    observaciones: registroCifrado.observaciones,
    datosVehiculoSalida,
    acompanantesSalida: registroCifrado.acompanantesSalida
  }

  return registroDescifrado
}
