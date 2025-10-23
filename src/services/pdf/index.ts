/**
 * Barrel export para el módulo PDF
 * Facilita las importaciones desde otros módulos
 */

export { PdfService, default } from './pdfService'
export type { 
  PdfReportOptions, 
  ReportData, 
  RegistroParaPdf, 
  OperadorInfo 
} from './types'
