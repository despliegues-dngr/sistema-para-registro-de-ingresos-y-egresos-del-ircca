/**
 * Tipos compartidos para el servicio de autocompletado
 * Extraído de autocompleteService.ts para mejor modularidad
 */

import type { DatosVehiculo } from '@/stores/registro'

/**
 * Interfaz para datos cifrados en IndexedDB (Compliance Ley 18.331)
 * ✅ SEGURO: Todos los datos personales cifrados con AES-256-GCM
 */
export interface PersonaConocidaCifrada extends Record<string, unknown> {
  id: string // UUID (clave primaria)
  cedulaHash: string // SHA-256 hash (para búsqueda por índice)
  datosPersonales: { // ✅ CIFRADO
    encrypted: string // → { cedula, nombre, apellido }
    iv: string
    salt: string
  }
  visitaInfo: { // ✅ CIFRADO
    encrypted: string // → { ultimoDestino, ultimoVehiculo? }
    iv: string
    salt: string
  }
  ultimaVisita: Date // ⚪ Metadata (no sensible)
  totalVisitas: number // ⚪ Metadata (no sensible)
  frecuencia: 'alta' | 'media' | 'baja' // ⚪ Derivado (no sensible)
  esAcompanante: boolean // ⚪ Metadata (no sensible)
}

/**
 * Interfaz para datos descifrados (uso en aplicación)
 * ✅ Esta es la interfaz pública que usan los componentes
 */
export interface PersonaConocida extends Record<string, unknown> {
  cedula: string
  nombre: string
  apellido: string
  ultimoDestino: string
  ultimoVehiculo?: DatosVehiculo
  ultimaVisita: Date
  totalVisitas: number
  frecuencia: 'alta' | 'media' | 'baja'
  esAcompanante: boolean
}

/**
 * Interfaces internas para cifrado/descifrado
 */
export interface DatosPersonalesDescifrados {
  cedula: string
  nombre: string
  apellido: string
}

export interface VisitaInfoDescifrada {
  ultimoDestino: string
  ultimoVehiculo?: DatosVehiculo
}

/**
 * Estructura de datos cifrados (retorno interno)
 */
export interface DatosCifrados {
  datosPersonales: {
    encrypted: string
    iv: string
    salt: string
  }
  visitaInfo: {
    encrypted: string
    iv: string
    salt: string
  }
}

/**
 * Datos para actualizar persona conocida
 */
export interface ActualizarPersonaData {
  cedula: string
  nombre: string
  apellido: string
  destino: string
  vehiculo?: DatosVehiculo
  esAcompanante?: boolean
}

/**
 * Estadísticas de personas conocidas
 */
export interface EstadisticasPersonas {
  total: number
  frecuentesAlta: number
  frecuentesMedia: number
  visitasEsteAno: number
}
