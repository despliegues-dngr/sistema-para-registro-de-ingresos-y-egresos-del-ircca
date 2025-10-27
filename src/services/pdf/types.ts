/**
 * Tipos compartidos para el servicio de generación de PDFs
 * Extraído de pdfService.ts para mejor modularidad
 */

import type { RegistroEntry } from '@/stores/registro'

export interface PdfReportOptions {
  type: 'current' | 'date-range'
  startDate?: string
  endDate?: string
  useTimeFilter?: boolean
  startTime?: string // Formato HH:MM
  endTime?: string   // Formato HH:MM
}

export interface ReportData {
  totalRegistros: number // Total de registros (ingresos + salidas)
  ingresos: number // Total de personas (titular + acompañantes)
  salidas: number
  dentro: number
  vehiculos?: {
    autos: number
    motos: number
    camiones: number
    buses: number
  }
  dateRange: string
  timeRange?: string // ✅ NUEVO: Rango de horario si se aplicó filtro
  registros: RegistroParaPdf[]
}

export interface RegistroParaPdf {
  numero: number
  fecha: string
  horaIngreso: string
  cedula: string
  nombre: string
  destino: string
  vehiculo: string // "Auto" | "Moto" | "Acompañante" | ""
  matricula: string
  horaSalida: string
  responsable: string // "Grado Nombre"
  observaciones: string // "Ingreso: ... / Salida: ..."
}

export interface OperadorInfo {
  id: string
  nombre: string
  apellido: string
  grado: string
}

export interface DateRangeResult {
  startDate: Date
  endDate: Date
  dateRange: string
  timeRange?: string // ✅ NUEVO: Rango de horario si se aplicó filtro
}

export interface PdfGenerationResult {
  filename: string
  dataUri: string
  size: number
}

export interface StatsResult {
  totalRegistros: number
  ingresos: number
  salidas: number
  dentro: number
  vehiculos: {
    autos: number
    motos: number
    camiones: number
    buses: number
  }
}

// Re-exportar tipos necesarios de stores
export type { RegistroEntry }
