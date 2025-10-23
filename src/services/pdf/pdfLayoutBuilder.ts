/**
 * PDF Layout Builder - Módulo de construcción de layout del PDF
 * Responsable de crear header, footer, summary y tabla
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ReportData } from './types'
import { formatValue } from './pdfFormatter'
import logoGuardiaRepublicana from '@/assets/images/logo-gr.jpg'
import logoIrcca from '@/assets/images/logo-ircca.png'

// ✅ Extend jsPDF to include autoTable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
  }
}

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

/**
 * Agrega header institucional al PDF con logos alineados
 */
export function addPdfHeader(doc: jsPDF, pageWidth: number, margin: number): void {
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
export function addPdfSummary(doc: jsPDF, pageWidth: number, margin: number, data: ReportData): number {
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
 * Agrega tabla de registros al PDF
 */
export function addPdfTable(doc: jsPDF, data: ReportData, summaryY: number, margin: number): void {
  // Preparar datos para la tabla
  const tableColumns = [
    'N°', 'Fecha', 'H. Ingreso', 'Cédula', 'Nombre',
    'Destino', 'Vehículo', 'Matrícula', 'H. Salida', 'Responsable', 'Observ.'
  ]

  const tableRows = data.registros.map(registro => [
    registro.numero.toString(),
    formatValue(registro.fecha),
    formatValue(registro.horaIngreso),
    formatValue(registro.cedula),
    formatValue(registro.nombre),
    formatValue(registro.destino),
    formatValue(registro.vehiculo),
    formatValue(registro.matricula),
    formatValue(registro.horaSalida),
    formatValue(registro.responsable),
    formatValue(registro.observaciones, true) // Observaciones sin guion
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
      0: { cellWidth: 8, halign: 'center' },   // N° - Muy estrecha, centrado
      1: { cellWidth: 20, halign: 'center' },  // Fecha - Reducida (DD/MM/YYYY), centrado
      2: { cellWidth: 18, halign: 'center' },  // H. Ingreso, centrado
      3: { cellWidth: 22, halign: 'center' },  // Cédula - AUMENTADA (18 → 22), centrado
      4: { cellWidth: 40 },  // Nombre - AUMENTADA (35 → 40)
      5: { cellWidth: 22 },  // Destino - Mantener
      6: { cellWidth: 24, halign: 'center' },  // Vehículo, centrado
      7: { cellWidth: 18, halign: 'center' },  // Matrícula, centrado
      8: { cellWidth: 18, halign: 'center' },  // H. Salida, centrado
      9: { cellWidth: 35 },  // Responsable - Mantener
      10: { cellWidth: 25 } // Observ. - REDUCIDA (auto → 25mm fijo)
    }
  })
}

/**
 * Agrega footer simple al PDF
 */
export function addPdfFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
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
