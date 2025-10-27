/**
 * Data Processor - Módulo de procesamiento de datos para PDFs
 * Responsable de procesar registros, calcular estadísticas y rangos de fechas
 */

import type { RegistroEntry, RegistroIngreso, RegistroSalida } from '@/stores/registro'
import type { 
  PdfReportOptions, 
  RegistroParaPdf, 
  OperadorInfo, 
  DateRangeResult, 
  StatsResult,
  ReportData
} from './types'
import { DatabaseService } from '../databaseService'
import { formatDate, formatTime, formatObservaciones, formatDateForPeriod } from './pdfFormatter'
import { formatResponsable } from '@/utils/gradoUtils'

/**
 * Calcula rango de fechas según opciones
 * ✅ FIX: Manejo correcto de zona horaria para evitar desfase de fechas
 * ✅ NUEVO: Soporte para filtro de hora opcional
 */
export function calculateDateRange(options: PdfReportOptions): DateRangeResult {
  if (options.type === 'current') {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

    return {
      startDate: startOfDay,
      endDate: endOfDay,
      dateRange: formatDateForPeriod(startOfDay) // ✅ Formato profesional
    }
  } else {
    // ✅ FIX: Parsear fecha en hora local, NO en UTC
    // Formato esperado: 'YYYY-MM-DD' desde input type="date"
    const [startYear, startMonth, startDay] = options.startDate!.split('-').map(Number)
    const [endYear, endMonth, endDay] = options.endDate!.split('-').map(Number)

    // ✅ NUEVO: Aplicar filtro de hora si está habilitado
    let startHour = 0, startMinute = 0
    let endHour = 23, endMinute = 59

    if (options.useTimeFilter && options.startTime && options.endTime) {
      const [sH, sM] = options.startTime.split(':').map(Number)
      const [eH, eM] = options.endTime.split(':').map(Number)
      startHour = sH
      startMinute = sM
      endHour = eH
      endMinute = eM
    }

    // Crear fechas en hora local con horarios específicos
    const startDate = new Date(startYear, startMonth - 1, startDay, startHour, startMinute, 0, 0)
    const endDate = new Date(endYear, endMonth - 1, endDay, endHour, endMinute, 59, 999)

    // ✅ Verificar si es el mismo día
    const isSameDay = startYear === endYear && startMonth === endMonth && startDay === endDay

    // ✅ NUEVO: Construir rango de horario si se aplicó filtro
    let timeRange: string | undefined
    if (options.useTimeFilter && options.startTime && options.endTime) {
      timeRange = `${options.startTime} - ${options.endTime}`
    }

    return {
      startDate,
      endDate,
      dateRange: isSameDay
        ? formatDateForPeriod(startDate) // ✅ Fecha única
        : `${formatDateForPeriod(startDate)} al ${formatDateForPeriod(endDate)}`, // ✅ Rango
      timeRange
    }
  }
}

/**
 * Obtiene registros descifrados de la base de datos por rango de fechas
 */
export async function getRegistrosFromDatabase(
  startDate: Date, 
  endDate: Date, 
  dbService: DatabaseService
): Promise<RegistroEntry[]> {
  try {
    // Usar DatabaseService que ya está inicializado y puede descifrar
    const allRegistros = await dbService.getRegistrosDescifrados()

    // Filtrar por rango de fechas
    const filteredRegistros = allRegistros.filter(registro => {
      const timestamp = new Date(registro.timestamp)
      return timestamp >= startDate && timestamp <= endDate
    })

    return filteredRegistros

  } catch {
    return []
  }
}

/**
 * Obtiene información de operadores usando DatabaseService
 */
export async function getOperadoresFromDatabase(dbService: DatabaseService): Promise<OperadorInfo[]> {
  try {
    // Usar el método público del DatabaseService
    const usuarios = await dbService.getUsuarios()
    return usuarios.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      grado: usuario.grado
    }))
  } catch {
    return []
  }
}

/**
 * Procesa registros descifrados para formato PDF
 * ✅ FIX: Asignar número correlativo DESPUÉS de ordenar para mantener secuencia correcta
 */
export async function processRegistrosForPdf(
  registros: RegistroEntry[], 
  operadores: OperadorInfo[]
): Promise<RegistroParaPdf[]> {
  const registrosProcesados: RegistroParaPdf[] = []

  // Agrupar ingresos con sus salidas correspondientes
  const ingresosMap = new Map<string, RegistroIngreso>()
  const salidas: RegistroSalida[] = []

  // Separar ingresos y salidas
  registros.forEach(registro => {
    if (registro.tipo === 'ingreso') {
      const ingreso = registro as RegistroIngreso
      ingresosMap.set(ingreso.datosPersonales.cedula, ingreso)
    } else {
      salidas.push(registro as RegistroSalida)
    }
  })

  // Procesar cada ingreso (sin asignar número todavía)
  for (const [cedula, ingreso] of ingresosMap) {
    const operador = operadores.find(op => op.id === ingreso.operadorId)
    const salida = salidas.find(s => s.cedulaBuscada === cedula)

    // ✅ Construir campo de observaciones combinado
    const observacionesCombinadas = formatObservaciones(
      ingreso.observaciones,
      salida?.observaciones
    )

    // Registro del titular
    registrosProcesados.push({
      numero: 0, // ✅ Temporal, se asignará después de ordenar
      fecha: formatDate(new Date(ingreso.timestamp)),
      horaIngreso: formatTime(new Date(ingreso.timestamp)),
      cedula: ingreso.datosPersonales.cedula,
      nombre: `${ingreso.datosPersonales.nombre} ${ingreso.datosPersonales.apellido}`,
      destino: ingreso.datosVisita.destino,
      vehiculo: ingreso.datosVehiculo?.tipo || '',
      matricula: ingreso.datosVehiculo?.matricula || '',
      horaSalida: salida ? formatTime(new Date(salida.timestamp)) : '',
      responsable: formatResponsable(operador?.grado, operador?.nombre, operador?.apellido),
      observaciones: observacionesCombinadas
    })

    // Registros de acompañantes (si los hay)
    if (ingreso.acompanantes && ingreso.acompanantes.length > 0) {
      for (const acompanante of ingreso.acompanantes) {
        registrosProcesados.push({
          numero: 0, // ✅ Temporal, se asignará después de ordenar
          fecha: formatDate(new Date(ingreso.timestamp)),
          horaIngreso: formatTime(new Date(ingreso.timestamp)),
          cedula: acompanante.cedula,
          nombre: `${acompanante.nombre} ${acompanante.apellido}`,
          destino: acompanante.destino,
          vehiculo: 'Acompañante',
          matricula: ingreso.datosVehiculo?.matricula || '',
          horaSalida: salida ? formatTime(new Date(salida.timestamp)) : '',
          responsable: formatResponsable(operador?.grado, operador?.nombre, operador?.apellido),
          observaciones: observacionesCombinadas
        })
      }
    }
  }

  // ✅ Ordenar por fecha y hora PRIMERO
  const registrosOrdenados = registrosProcesados.sort((a, b) => {
    const dateA = new Date(`${a.fecha} ${a.horaIngreso}`)
    const dateB = new Date(`${b.fecha} ${b.horaIngreso}`)
    return dateA.getTime() - dateB.getTime()
  })

  // ✅ Asignar números correlativos DESPUÉS de ordenar
  registrosOrdenados.forEach((registro, index) => {
    registro.numero = index + 1
  })

  return registrosOrdenados
}

/**
 * Calcula estadísticas de los registros
 * ✅ FIX: Lógica simplificada según propuesta del usuario
 * - Ingresos personas = cantidad de personas (titular + acompañantes)
 * - Cant. registros = Ingresos personas + cantidad de salidas
 */
export function calculateStats(registros: RegistroEntry[]): StatsResult {
  // Contar registros de ingreso y salida
  const registrosIngreso = registros.filter(r => r.tipo === 'ingreso')
  const registrosSalida = registros.filter(r => r.tipo === 'salida')
  const salidas = registrosSalida.length

  // ✅ Contar PERSONAS individuales (titular + acompañantes) = "Ingresos personas"
  let totalPersonas = 0
  registrosIngreso.forEach(registro => {
    const ingreso = registro as RegistroIngreso
    totalPersonas++ // Contar titular
    if (ingreso.acompanantes && ingreso.acompanantes.length > 0) {
      totalPersonas += ingreso.acompanantes.length // Sumar acompañantes
    }
  })

  // ✅ Total de registros = Ingresos personas + Salidas
  const totalRegistros = totalPersonas + salidas

  const dentro = Math.max(0, totalPersonas - salidas) // Personas que siguen dentro

  // ✅ Contar vehículos (solo registros con vehículo)
  const vehiculos = { autos: 0, motos: 0, camiones: 0, buses: 0 }

  registrosIngreso.forEach(registro => {
    const ingreso = registro as RegistroIngreso
    if (ingreso.datosVehiculo) {
      switch (ingreso.datosVehiculo.tipo.toLowerCase()) {
        case 'auto':
          vehiculos.autos++
          break
        case 'moto':
          vehiculos.motos++
          break
        case 'camión':
          vehiculos.camiones++
          break
        case 'bus':
          vehiculos.buses++
          break
      }
    }
  })

  return { totalRegistros, ingresos: totalPersonas, salidas, dentro, vehiculos }
}

/**
 * Datos de fallback en caso de error
 */
export function getFallbackData(options: PdfReportOptions): ReportData {
  return {
    totalRegistros: 0,
    ingresos: 0,
    salidas: 0,
    dentro: 0,
    vehiculos: { autos: 0, motos: 0, camiones: 0, buses: 0 },
    dateRange: options.type === 'current' ? 'hoy' : `del ${options.startDate} al ${options.endDate}`,
    registros: []
  }
}
