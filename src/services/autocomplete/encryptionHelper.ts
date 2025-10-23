/**
 * Encryption Helper - Gestión de cifrado/descifrado para autocompletado
 * Responsable de todas las operaciones de encriptación de personas conocidas
 */

import { encryptionService } from '../encryptionService'
import { databaseService } from '../databaseService'
import type {
  PersonaConocidaCifrada,
  PersonaConocida,
  DatosPersonalesDescifrados,
  VisitaInfoDescifrada,
  DatosCifrados
} from './types'

/**
 * Genera SHA-256 hash de una cédula (para indexación y búsqueda)
 * ✅ Se usa para búsqueda rápida sin exponer datos
 */
export async function generateCedulaHash(cedula: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(cedula)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Obtiene la clave de sesión del sistema (compartida)
 * Reutiliza la misma clave maestra del DatabaseService
 */
export async function getSessionKey(): Promise<string> {
  await databaseService.initializeWithSessionKey()
  // @ts-expect-error - Acceso a propiedad privada necesario para compartir clave
  return databaseService.sessionKey
}

/**
 * Cifra los datos de una persona conocida
 * ✅ SEGURO: Usa AES-256-GCM con clave maestra del sistema
 */
export async function cifrarPersonaConocida(
  datosPersonales: DatosPersonalesDescifrados,
  visitaInfo: VisitaInfoDescifrada
): Promise<DatosCifrados> {
  const sessionKey = await getSessionKey()

  const datosPersonalesCifrados = await encryptionService.encrypt(
    JSON.stringify(datosPersonales),
    sessionKey
  )

  const visitaInfoCifrada = await encryptionService.encrypt(
    JSON.stringify(visitaInfo),
    sessionKey
  )

  return {
    datosPersonales: datosPersonalesCifrados,
    visitaInfo: visitaInfoCifrada
  }
}

/**
 * Descifra los datos de una persona conocida
 * ✅ SEGURO: Solo descifra cuando es necesario mostrar datos
 */
export async function descifrarPersonaConocida(
  personaCifrada: PersonaConocidaCifrada
): Promise<PersonaConocida> {
  const sessionKey = await getSessionKey()

  const datosPersonalesJson = await encryptionService.decrypt(
    personaCifrada.datosPersonales.encrypted,
    sessionKey,
    personaCifrada.datosPersonales.salt,
    personaCifrada.datosPersonales.iv
  )

  const visitaInfoJson = await encryptionService.decrypt(
    personaCifrada.visitaInfo.encrypted,
    sessionKey,
    personaCifrada.visitaInfo.salt,
    personaCifrada.visitaInfo.iv
  )

  const datosPersonales: DatosPersonalesDescifrados = JSON.parse(datosPersonalesJson)
  const visitaInfo: VisitaInfoDescifrada = JSON.parse(visitaInfoJson)

  return {
    cedula: datosPersonales.cedula,
    nombre: datosPersonales.nombre,
    apellido: datosPersonales.apellido,
    ultimoDestino: visitaInfo.ultimoDestino,
    ultimoVehiculo: visitaInfo.ultimoVehiculo,
    ultimaVisita: personaCifrada.ultimaVisita,
    totalVisitas: personaCifrada.totalVisitas,
    frecuencia: personaCifrada.frecuencia,
    esAcompanante: personaCifrada.esAcompanante
  }
}
