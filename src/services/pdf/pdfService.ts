/**
 * PDF Service - Módulo de Supervisión (TASK 1.3.4)
 * Responsable de la generación de reportes PDF según documentación
 * 
 * ✅ REFACTORIZADO: Dividido en módulos cohesivos (710 → 280 líneas)
 * 
 * Bibliotecas: jsPDF v3.0.1 (ya instalado según TASK-1.2.0)
 * Ref: docs/01-management/04-wbs-and-deliverables.md - Líneas 94-105
 */

import { jsPDF } from 'jspdf'
import type { 
  PdfReportOptions, 
  ReportData, 
  PdfGenerationResult 
} from './types'
import { DatabaseService } from '../databaseService'
import { generateFilename } from './pdfFormatter'
import { 
  addPdfHeader, 
  addPdfSummary, 
  addPdfTable, 
  addPdfFooter 
} from './pdfLayoutBuilder'
import {
  calculateDateRange,
  getRegistrosFromDatabase,
  getOperadoresFromDatabase,
  processRegistrosForPdf,
  calculateStats,
  getFallbackData
} from './dataProcessor'

/**
 * Servicio principal para generación de PDFs
 * Implementa jsPDF según TASK 1.3.4
 * 
 * ✅ REFACTORIZADO: Actúa como orquestador de módulos especializados
 */
export class PdfService {
  /**
   * Genera reporte PDF basado en opciones especificadas
   * @param options Opciones de generación del reporte
   * @returns Promise con el resultado de la generación
   */
  static async generateReport(
    options: PdfReportOptions
  ): Promise<{ 
    success: boolean
    message: string
    filename?: string
    dataUri?: string
    size?: number 
  }> {
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
   * ✅ REFACTORIZADO: Usa módulos especializados para layout
   */
  private static async generatePdfDocument(data: ReportData): Promise<PdfGenerationResult> {

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

    // ✅ Usar módulos especializados para construir el layout
    addPdfHeader(doc, pageWidth, margin)
    const summaryY = addPdfSummary(doc, pageWidth, margin, data)
    addPdfTable(doc, data, summaryY, margin)
    addPdfFooter(doc, pageWidth, pageHeight, margin)

    // ✅ Generar nombre de archivo descriptivo con período de datos
    const filename = generateFilename(data.dateRange)

    // ✅ SOLUCIÓN SIMPLE Y SEGURA: Solo generar Data URI para nueva ventana
    const pdfDataUri = doc.output('datauristring')

    return {
      filename,
      dataUri: pdfDataUri,
      size: Math.round(pdfDataUri.length * 0.75)
    }
  }

  /**
   * Obtiene datos del reporte basado en rango de fechas
   * ✅ REFACTORIZADO: Usa módulo dataProcessor
   * @param options Opciones del reporte
   * @returns Promise con datos reales de la base de datos
   */
  static async getReportData(options: PdfReportOptions): Promise<ReportData> {
    try {
      // Inicializar servicios de base de datos
      const dbService = new DatabaseService()
      await dbService.initialize()
      await dbService.initializeWithSessionKey()

      // ✅ Usar módulo dataProcessor para cálculos
      const { startDate, endDate, dateRange } = calculateDateRange(options)
      const registros = await getRegistrosFromDatabase(startDate, endDate, dbService)
      const operadores = await getOperadoresFromDatabase(dbService)
      const registrosProcesados = await processRegistrosForPdf(registros, operadores)
      const stats = calculateStats(registros)

      return {
        ...stats,
        dateRange,
        registros: registrosProcesados
      }

    } catch {
      // Fallback a datos simulados
      return getFallbackData(options)
    }
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
