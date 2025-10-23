/**
 * Tipos compartidos para el servicio de base de datos
 * Extraído de databaseService.ts para mejor modularidad
 */

export interface BackupData {
  id: string
  timestamp: Date
  data: unknown
  encrypted: boolean
  size: number
}

export interface RegistroBaseCifrado {
  id: string
  tipo: 'ingreso' | 'salida'
  timestamp: Date
  operadorId: string
  encrypted: boolean
}

export interface RegistroIngresoCifrado extends RegistroBaseCifrado {
  tipo: 'ingreso'
  persona?: {
    encrypted: string
    iv: string
    salt: string
  }
  vehiculo?: {
    encrypted: string
    iv: string
    salt: string
  }
  acompanantes?: {
    encrypted: string
    iv: string
    salt: string
  }
}

export interface RegistroSalidaCifrado extends RegistroBaseCifrado {
  tipo: 'salida'
  cedulaBuscada: string
  tiempoEstadia: number
  observaciones?: string
  datosVehiculoSalida?: {
    encrypted: string
    iv: string
    salt: string
  }
  acompanantesSalida?: string[]
  persona?: {
    encrypted: string
    iv: string
    salt: string
  }
}

export interface DatosEncriptados {
  encrypted: string
  iv: string
  salt: string
}
