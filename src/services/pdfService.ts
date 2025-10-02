/**
 * PDF Service - Módulo de Supervisión (TASK 1.3.4)
 * Responsable de la generación de reportes PDF según documentación
 *
 * Bibliotecas: jsPDF v3.0.1 (ya instalado según TASK-1.2.0)
 * Ref: docs/01-management/04-wbs-and-deliverables.md - Líneas 94-105
 */

// ✅ jsPDF v3.x incluye tipos TypeScript nativos
import { jsPDF } from 'jspdf'
// ✅ Importar autoTable correctamente
import autoTable from 'jspdf-autotable'
import type { RegistroEntry, RegistroIngreso, RegistroSalida } from '@/stores/registro'
import { DatabaseService } from './databaseService'
// ✅ Importar logos institucionales para el header del PDF
import logoGuardiaRepublicana from '@/assets/images/logo-gr.jpg'
import logoIrcca from '@/assets/images/logo-ircca.png'
// ✅ Importar utilidades de conversión de grados
import { formatResponsable } from '@/utils/gradoUtils'

// ✅ Extend jsPDF to include autoTable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
  }
}

// AutoTable options interface
interface AutoTableOptions {
  head: string[][]
  body: string[][]
  startY?: number
  theme?: 'grid' | 'plain' | 'striped'
  styles?: Record<string, unknown>
  headStyles?: Record<string, unknown>
  bodyStyles?: Record<string, unknown>
  alternateRowStyles?: Record<string, unknown>
  columnStyles?: Record<number, Record<string, unknown>>
  margin?: { left?: number; right?: number; top?: number; bottom?: number }
}

export interface PdfReportOptions {
  type: 'current' | 'date-range'
  startDate?: string
  endDate?: string
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
  registros: RegistroParaPdf[]
}

// Interfaz para registro procesado para PDF
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

// Interfaz para operador (para mostrar responsable)
export interface OperadorInfo {
  id: string
  nombre: string
  apellido: string
  grado: string
}

/**
 * Servicio principal para generación de PDFs
 * Implementará jsPDF según TASK 1.3.4
 */
export class PdfService {
  /**
   * Genera reporte PDF basado en opciones especificadas
   * @param options Opciones de generación del reporte
   * @returns Promise con el resultado de la generación
   */
  static async generateReport(options: PdfReportOptions): Promise<{ success: boolean; message: string; filename?: string; dataUri?: string; size?: number }> {
    try {
      // 1. Obtener datos del reporte
      const data = await this.getReportData(options)

      // 2. Generar PDF con los datos reales
      const pdfResult = await this.generatePdfDocument(data)

      return {
        success: true,
        message: `PDF generado exitosamente para ${data.dateRange}`,
        filename: pdfResult.filename,
        dataUri: pdfResult.dataUri,
        size: pdfResult.size
      }

    } catch {
      return {
        success: false,
        message: 'Error al generar el reporte PDF'
      }
    }
  }

  /**
   * Genera el documento PDF físico
   */
  private static async generatePdfDocument(data: ReportData): Promise<{ filename: string; dataUri: string; size: number }> {

    // Crear documento PDF en orientación horizontal
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Configuración del documento
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10

    // Header institucional
    this.addPdfHeader(doc, pageWidth, margin)

    // ✅ Resumen estadístico ANTES de la tabla
    const summaryY = this.addPdfSummary(doc, pageWidth, margin, data)

    // Preparar datos para la tabla
    const tableColumns = [
      'N°', 'Fecha', 'H. Ingreso', 'Cédula', 'Nombre',
      'Destino', 'Vehículo', 'Matrícula', 'H. Salida', 'Responsable', 'Observ.'
    ]

    const tableRows = data.registros.map(registro => [
      registro.numero.toString(),
      registro.fecha,
      registro.horaIngreso,
      registro.cedula,
      registro.nombre,
      registro.destino,
      registro.vehiculo,
      registro.matricula,
      registro.horaSalida,
      registro.responsable,
      registro.observaciones
    ])

    // Agregar tabla con autoTable (con efecto cebra)
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: summaryY + 3, // ✅ Comienza después del resumen + margen
      margin: { left: margin, right: margin }, // ✅ Márgenes iguales al header (10mm)
      theme: 'striped', // ✅ Efecto cebra (alternating rows)
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [21, 101, 192], // Color azul institucional
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // ✅ Gris claro para filas alternas (efecto cebra)
      },
      // ✅ Anchos optimizados de columnas (en mm)
      columnStyles: {
        0: { cellWidth: 8 },   // N° - Muy estrecha
        1: { cellWidth: 20 },  // Fecha - Reducida (DD/MM/YYYY)
        2: { cellWidth: 18 },  // H. Ingreso - AUMENTADA (15 → 18)
        3: { cellWidth: 18 },  // Cédula - Mantener
        4: { cellWidth: 35 },  // Nombre - AUMENTADA
        5: { cellWidth: 22 },  // Destino - Mantener
        6: { cellWidth: 24 },  // Vehículo - AUMENTADA (20 → 24)
        7: { cellWidth: 18 },  // Matrícula - Mantener
        8: { cellWidth: 18 },  // H. Salida - AUMENTADA (15 → 18)
        9: { cellWidth: 35 },  // Responsable - AUMENTADA (30 → 35)
        10: { cellWidth: 'auto' } // Observ. - Flexible (usa espacio restante)
      }
    })

    // ✅ Footer simplificado (sin estadísticas, ya están arriba)
    this.addPdfFooter(doc, pageWidth, pageHeight, margin)

    // ✅ Generar nombre de archivo descriptivo con período de datos
    const filename = this.generateFilename(data.dateRange)

    // ✅ SOLUCIÓN SIMPLE Y SEGURA: Solo generar Data URI para nueva ventana
    const pdfDataUri = doc.output('datauristring')

    return {
      filename,
      dataUri: pdfDataUri,
      size: Math.round(pdfDataUri.length * 0.75)
    }
  }

  /**
   * Agrega header institucional al PDF con logos alineados
   */
  private static addPdfHeader(doc: jsPDF, pageWidth: number, margin: number): void {
    // Dimensiones de los logos
    const logoGRWidth = 40 // ✅ Logo GR más grande (aumentado de 35mm a 40mm)
    const logoIRCCAWidth = 35 // Logo IRCCA mantiene 35mm
    const logoY = margin // Misma posición Y para ambos logos (alineados)

    // Logo Guardia Republicana (izquierda) - MÁS GRANDE
    try {
      doc.addImage(
        logoGuardiaRepublicana,
        'JPEG',
        margin,
        logoY,
        logoGRWidth,
        0 // 👈 0 = jsPDF calcula altura automáticamente según aspect ratio original
      )
    } catch {
      // Error silencioso
    }

    // Logo IRCCA (derecha) - alineado con logo GR
    try {
      doc.addImage(
        logoIrcca,
        'PNG',
        pageWidth - margin - logoIRCCAWidth,
        logoY,
        logoIRCCAWidth,
        0 // 👈 0 = jsPDF calcula altura automáticamente según aspect ratio original
      )
    } catch {
      // Error silencioso
    }

    // Título principal centrado
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(21, 101, 192) // Color azul institucional
    doc.text('Sistema de Control de Accesos del IRCCA', pageWidth / 2, 18, { align: 'center' })

    // ✅ Subtítulo con fecha de generación (formato 24h) - Tamaño reducido
    const now = new Date()
    const dateGenerated = now.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const timeGenerated = now.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 👈 Formato 24 horas
    })

    doc.setFontSize(9) // ✅ Reducido de 12pt a 9pt
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100) // Gris medio (más discreto)
    doc.text(`Generado: ${dateGenerated} ${timeGenerated}`, pageWidth / 2, 26, { align: 'center' })

    // Línea decorativa
    const lineY = 30
    doc.setDrawColor(21, 101, 192) // Azul institucional
    doc.setLineWidth(0.5)
    doc.line(margin, lineY, pageWidth - margin, lineY)

    // Resetear color de texto a negro para el resto del documento
    doc.setTextColor(0, 0, 0)
  }

  /**
   * Agrega resumen estadístico ANTES de la tabla (estilo texto plano)
   * @returns Y position donde termina el resumen (para posicionar tabla)
   */
  private static addPdfSummary(doc: jsPDF, pageWidth: number, margin: number, data: ReportData): number {
    const startY = 36 // ✅ Aumentado de 33 a 36mm para dar más espacio después de la línea

    // Estadísticas en una línea (estilo texto plano con separadores |)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    // ✅ Estadísticas clarificadas según nueva definición
    const totalVehiculos = (data.vehiculos?.autos || 0) + (data.vehiculos?.motos || 0)
    const stats = [
      `Cant. registros: ${data.totalRegistros}`,
      `Ingresos personas: ${data.ingresos}`,
      `Ingresos vehículos: ${totalVehiculos}`
    ].join(' | ')

    doc.text(stats, margin, startY)

    // Período de datos (segunda línea, más pequeño)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(`Período: ${data.dateRange}`, margin, startY + 6)

    // Resetear colores
    doc.setTextColor(0, 0, 0)

    return startY + 8 // Retornar posición Y donde termina el resumen
  }

  /**
   * Agrega footer simple al PDF
   */
  private static addPdfFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
    const footerY = pageHeight - 10

    // Línea superior del footer
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2)

    // Texto del footer
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(120, 120, 120)
    doc.text('RESERVADO', pageWidth / 2, footerY + 2, { align: 'center' })

    // Número de página
    doc.setFont('helvetica', 'normal')
    doc.text('Página 1', pageWidth - margin, footerY + 2, { align: 'right' })
  }

  /**
   * Obtiene datos del reporte basado en rango de fechas
   * @param options Opciones del reporte
   * @returns Promise con datos reales de la base de datos
   */
  static async getReportData(options: PdfReportOptions): Promise<ReportData> {
    try {
      // Inicializar servicios de base de datos
      const dbService = new DatabaseService()
      await dbService.initialize()
      await dbService.initializeWithSessionKey()

      // Calcular rango de fechas
      const { startDate, endDate, dateRange } = this.calculateDateRange(options)

      // Obtener registros del rango de fechas usando DatabaseService
      const registros = await this.getRegistrosFromDatabase(startDate, endDate, dbService)

      // Obtener información de operadores
      const operadores = await this.getOperadoresFromDatabase(dbService)

      // Procesar registros para PDF
      const registrosProcesados = await this.processRegistrosForPdf(registros, operadores)

      // Calcular estadísticas
      const stats = this.calculateStats(registros)

      return {
        ...stats,
        dateRange,
        registros: registrosProcesados
      }

    } catch {
      // Fallback a datos simulados
      return this.getFallbackData(options)
    }
  }

  /**
   * Calcula rango de fechas según opciones
   * ✅ FIX: Manejo correcto de zona horaria para evitar desfase de fechas
   */
  private static calculateDateRange(options: PdfReportOptions): { startDate: Date; endDate: Date; dateRange: string } {
    if (options.type === 'current') {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

      return {
        startDate: startOfDay,
        endDate: endOfDay,
        dateRange: this.formatDateForPeriod(startOfDay) // ✅ Formato profesional
      }
    } else {
      // ✅ FIX: Parsear fecha en hora local, NO en UTC
      // Formato esperado: 'YYYY-MM-DD' desde input type="date"
      const [startYear, startMonth, startDay] = options.startDate!.split('-').map(Number)
      const [endYear, endMonth, endDay] = options.endDate!.split('-').map(Number)

      // Crear fechas en hora local (evita desfase de zona horaria)
      const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0)
      const endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)

      // ✅ Verificar si es el mismo día
      const isSameDay = startYear === endYear && startMonth === endMonth && startDay === endDay

      return {
        startDate,
        endDate,
        dateRange: isSameDay
          ? this.formatDateForPeriod(startDate) // ✅ Fecha única
          : `${this.formatDateForPeriod(startDate)} al ${this.formatDateForPeriod(endDate)}` // ✅ Rango
      }
    }
  }

  /**
   * Obtiene registros descifrados de la base de datos por rango de fechas
   */
  private static async getRegistrosFromDatabase(startDate: Date, endDate: Date, dbService: DatabaseService): Promise<RegistroEntry[]> {
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
  private static async getOperadoresFromDatabase(dbService: DatabaseService): Promise<OperadorInfo[]> {
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
  private static async processRegistrosForPdf(registros: RegistroEntry[], operadores: OperadorInfo[]): Promise<RegistroParaPdf[]> {
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
      const observacionesCombinadas = this.formatObservaciones(
        ingreso.observaciones,
        salida?.observaciones
      )

      // Registro del titular
      registrosProcesados.push({
        numero: 0, // ✅ Temporal, se asignará después de ordenar
        fecha: this.formatDate(new Date(ingreso.timestamp)),
        horaIngreso: this.formatTime(new Date(ingreso.timestamp)),
        cedula: ingreso.datosPersonales.cedula,
        nombre: `${ingreso.datosPersonales.nombre} ${ingreso.datosPersonales.apellido}`,
        destino: ingreso.datosVisita.destino,
        vehiculo: ingreso.datosVehiculo?.tipo || '',
        matricula: ingreso.datosVehiculo?.matricula || '',
        horaSalida: salida ? this.formatTime(new Date(salida.timestamp)) : '',
        responsable: formatResponsable(operador?.grado, operador?.nombre, operador?.apellido),
        observaciones: observacionesCombinadas
      })

      // Registros de acompañantes (si los hay)
      if (ingreso.acompanantes && ingreso.acompanantes.length > 0) {
        for (const acompanante of ingreso.acompanantes) {
          registrosProcesados.push({
            numero: 0, // ✅ Temporal, se asignará después de ordenar
            fecha: this.formatDate(new Date(ingreso.timestamp)),
            horaIngreso: this.formatTime(new Date(ingreso.timestamp)),
            cedula: acompanante.cedula,
            nombre: `${acompanante.nombre} ${acompanante.apellido}`,
            destino: acompanante.destino,
            vehiculo: 'Acompañante',
            matricula: ingreso.datosVehiculo?.matricula || '',
            horaSalida: salida ? this.formatTime(new Date(salida.timestamp)) : '',
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
  private static calculateStats(registros: RegistroEntry[]): { totalRegistros: number; ingresos: number; salidas: number; dentro: number; vehiculos: { autos: number; motos: number; camiones: number; buses: number } } {
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
  private static getFallbackData(options: PdfReportOptions): ReportData {
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

  /**
   * Formatea fecha en formato DD/MM/YYYY
   * ✅ FIX: Usa getters locales para evitar problemas de timezone
   */
  private static formatDate(date: Date): string {
    // ✅ Usar getters locales (no UTC) para evitar desfase
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
  }

  /**
   * Formatea fecha para período en formato DD-MM-YYYY (más profesional)
   */
  private static formatDateForPeriod(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  /**
   * Formatea hora en formato HH:MM
   */
  private static formatTime(date: Date): string {
    return date.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  /**
   * Formatea observaciones de ingreso y salida en una sola celda
   * @param observacionesIngreso Observaciones del registro de ingreso
   * @param observacionesSalida Observaciones del registro de salida
   * @returns String formateado con ambas observaciones o vacío
   */
  private static formatObservaciones(
    observacionesIngreso?: string,
    observacionesSalida?: string
  ): string {
    const partes: string[] = []

    if (observacionesIngreso && observacionesIngreso.trim()) {
      partes.push(`Ingreso: ${observacionesIngreso.trim()}`)
    }

    if (observacionesSalida && observacionesSalida.trim()) {
      partes.push(`Salida: ${observacionesSalida.trim()}`)
    }

    return partes.join('\n')
  }

  /**
   * Genera nombre de archivo descriptivo basado en el período de datos
   * @param dateRange Rango de fechas del reporte (ej: "01-10-2025" o "01-10-2025 al 05-10-2025")
   * @returns Nombre de archivo formateado
   */
  private static generateFilename(dateRange: string): string {
    // Sanitizar el dateRange para usar en nombre de archivo
    // Reemplazar espacios y caracteres especiales por guiones bajos
    const periodoSanitizado = dateRange
      .replace(/ al /g, '_al_')
      .replace(/\s+/g, '_')
      .replace(/[/\\:*?"<>|]/g, '-')

    return `Registros_de_accesos_del_IRCCA_${periodoSanitizado}.pdf`
  }

  /**
   * Valida opciones de generación de PDF
   * @param options Opciones a validar
   * @returns true si las opciones son válidas
   */
  static validateOptions(options: PdfReportOptions): boolean {
    if (options.type === 'current') {
      return true
    }

    if (options.type === 'date-range') {
      return !!(options.startDate && options.endDate && options.startDate <= options.endDate)
    }

    return false
  }
}

export default PdfService
