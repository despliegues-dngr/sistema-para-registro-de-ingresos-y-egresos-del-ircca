/**
 * PDF Service - Re-export desde módulo refactorizado
 *
 * ✅ REFACTORIZADO (710 → 280 líneas):
 * El código ha sido modularizado en src/services/pdf/
 * Este archivo mantiene compatibilidad con imports existentes
 *
 * Ref: docs/01-management/04-wbs-and-deliverables.md - Líneas 94-105
 */

// ✅ Re-exportar desde módulo refactorizado
export { PdfService, default } from './pdf/pdfService'
export type { PdfReportOptions, ReportData, RegistroParaPdf, OperadorInfo } from './pdf/types'
