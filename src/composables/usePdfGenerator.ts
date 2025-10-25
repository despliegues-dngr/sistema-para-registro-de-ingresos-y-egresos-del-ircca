import { ref, computed, watch } from 'vue'
import { PdfService } from '@/services/pdfService'

/**
 * Composable para gestionar la generación de PDFs y compartir via WhatsApp
 * Extrae lógica de negocio de PdfGeneratorDialog para cumplir Single Responsibility
 */
export function usePdfGenerator() {
  // Estado reactivo
  const reportType = ref<'current' | 'date-range'>('current')
  const startDate = ref('')
  const endDate = ref('')
  const loading = ref(false)
  const message = ref('')
  const messageType = ref<'success' | 'error' | 'warning' | 'info'>('info')
  const qrReportInfo = ref('')
  const lastGeneratedPdf = ref<{ dataUri: string; filename: string } | null>(null)
  const sharingWhatsApp = ref(false)

  // Fecha máxima (hoy)
  const maxDate = computed(() => {
    return new Date().toISOString().split('T')[0]
  })

  // Validaciones
  const dateRules = [
    (v: string) => !!v || 'La fecha es requerida',
    (v: string) => {
      const date = new Date(v)
      const today = new Date()
      return date <= today || 'La fecha no puede ser futura'
    }
  ]

  const isFormValid = computed(() => {
    if (reportType.value === 'current') {
      return true
    }
    return startDate.value && endDate.value && startDate.value <= endDate.value
  })

  // Watch para actualizar endDate mínimo
  watch(startDate, (newStartDate) => {
    if (endDate.value && newStartDate > endDate.value) {
      endDate.value = newStartDate
    }
  })

  // Watch para limpiar PDF al cambiar opciones
  watch(reportType, () => {
    clearMessage()
    lastGeneratedPdf.value = null
  })

  // Watch para limpiar PDF al cambiar fechas
  watch([startDate, endDate], () => {
    if (lastGeneratedPdf.value) {
      lastGeneratedPdf.value = null
    }
  })

  /**
   * Formatea fecha de YYYY-MM-DD a DD/MM/YYYY
   */
  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  /**
   * Limpia mensajes de estado
   */
  const clearMessage = () => {
    message.value = ''
  }

  /**
   * Convierte Data URI a Blob
   */
  const dataURItoBlob = (dataURI: string): Blob => {
    const byteString = atob(dataURI.split(',')[1])
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    
    for (let i = 0; i < byteString.length; i++) {
      // eslint-disable-next-line security/detect-object-injection -- Safe: i is loop-controlled index, ia is typed Uint8Array
      ia[i] = byteString.charCodeAt(i)
    }
    
    return new Blob([ab], { type: mimeString })
  }

  /**
   * Genera PDF usando el servicio
   */
  const generatePdf = async () => {
    loading.value = true
    clearMessage()

    try {
      const options = {
        type: reportType.value,
        startDate: startDate.value,
        endDate: endDate.value
      }
      
      qrReportInfo.value = reportType.value === 'current' 
        ? 'de hoy' 
        : `del ${formatDate(startDate.value)} al ${formatDate(endDate.value)}`
      
      const result = await PdfService.generateReport(options)
      
      if (result.success && result.dataUri) {
        lastGeneratedPdf.value = { 
          dataUri: result.dataUri, 
          filename: result.filename || 'reporte-ircca.pdf' 
        }
        return { success: true, message: result.message }
      } else {
        message.value = result.message || 'Error al generar el PDF'
        messageType.value = 'error'
        return { success: false, message: message.value }
      }
      
    } catch {
      message.value = 'Error al generar el reporte PDF. Intente nuevamente.'
      messageType.value = 'error'
      return { success: false, message: message.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Regenera PDF (limpia el anterior y genera uno nuevo)
   */
  const regeneratePdf = () => {
    lastGeneratedPdf.value = null
    clearMessage()
    return generatePdf()
  }

  /**
   * Comparte PDF via WhatsApp usando Web Share API
   */
  const shareViaWhatsApp = async () => {
    if (!lastGeneratedPdf.value) return
    
    clearMessage()
    
    try {
      sharingWhatsApp.value = true
      
      const blob = dataURItoBlob(lastGeneratedPdf.value.dataUri)
      const file = new File([blob], lastGeneratedPdf.value.filename, { type: 'application/pdf' })
      
      // Verificar si Web Share API está disponible
      if (!navigator.share) {
        message.value = '⚠️ Tu navegador no soporta compartir archivos. Por favor, contacta al administrador del sistema.'
        messageType.value = 'warning'
        return
      }
      
      // Verificar si puede compartir archivos
      if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
        message.value = '⚠️ Tu dispositivo no está configurado para compartir archivos PDF. Asegúrate de tener WhatsApp instalado.'
        messageType.value = 'warning'
        return
      }
      
      // Intentar compartir
      try {
        await navigator.share({
          files: [file],
          title: 'Reporte IRCCA',
          text: `Reporte del Instituto IRCCA - ${qrReportInfo.value}`
        })
        
        message.value = '✅ PDF compartido exitosamente por WhatsApp'
        messageType.value = 'success'
        
      } catch (shareError) {
        if (shareError instanceof Error) {
          console.error('Error al compartir:', shareError.name, shareError.message)
          
          if (shareError.name === 'AbortError') {
            message.value = 'ℹ️ Compartir cancelado. No se envió el PDF.'
            messageType.value = 'info'
          } else if (shareError.name === 'NotAllowedError') {
            message.value = '⚠️ No se pudo compartir. Asegúrate de tener WhatsApp instalado y vinculado en tu dispositivo.'
            messageType.value = 'warning'
          } else if (shareError.name === 'TypeError') {
            message.value = '⚠️ El tipo de archivo no es soportado. Contacta al administrador del sistema.'
            messageType.value = 'warning'
          } else {
            message.value = `❌ Error al compartir: ${shareError.message}. Intenta nuevamente.`
            messageType.value = 'error'
          }
        } else {
          message.value = '❌ Error desconocido al compartir. Intenta nuevamente.'
          messageType.value = 'error'
        }
      }
      
    } catch (error) {
      console.error('Error inesperado:', error)
      message.value = '❌ Error inesperado. Por favor, recarga la página e intenta nuevamente.'
      messageType.value = 'error'
    } finally {
      sharingWhatsApp.value = false
    }
  }

  /**
   * Resetea el estado del composable
   */
  const reset = () => {
    reportType.value = 'current'
    startDate.value = ''
    endDate.value = ''
    loading.value = false
    message.value = ''
    messageType.value = 'info'
    qrReportInfo.value = ''
    lastGeneratedPdf.value = null
    sharingWhatsApp.value = false
  }

  return {
    // Estado
    reportType,
    startDate,
    endDate,
    loading,
    message,
    messageType,
    qrReportInfo,
    lastGeneratedPdf,
    sharingWhatsApp,
    
    // Computed
    maxDate,
    dateRules,
    isFormValid,
    
    // Métodos
    generatePdf,
    regeneratePdf,
    shareViaWhatsApp,
    clearMessage,
    reset
  }
}
