<template>
  <v-dialog
    v-model="modelValue"
    max-width="600"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="pdf-generator-dialog-card">
      <!-- Header institucional -->
      <v-card-title class="bg-success pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-file-pdf-box</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Generar Reporte PDF</h3>
            <p class="text-caption text-green-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Opciones de generación -->
        <v-row>
          <v-col cols="12">
            <h4 class="text-h6 mb-4">Opciones de Reporte</h4>
            
            <!-- Tipo de reporte -->
            <v-radio-group
              v-model="reportType"
              inline
              class="mb-4"
            >
              <v-radio
                label="Reporte Actual (Hoy)"
                value="current"
                color="success"
              />
              <v-radio
                label="Seleccionar Fecha"
                value="date-range"
                color="success"
              />
            </v-radio-group>
          </v-col>
        </v-row>

        <!-- Selección de fechas (solo si se selecciona fecha específica) -->
        <v-row v-if="reportType === 'date-range'">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="startDate"
              label="Fecha Inicio"
              type="date"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-calendar"
              :max="maxDate"
              :rules="dateRules"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="endDate"
              label="Fecha Fin"
              type="date"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-calendar"
              :min="startDate"
              :max="maxDate"
              :rules="dateRules"
            />
          </v-col>
        </v-row>


        <!-- Estado de carga -->
        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular
              indeterminate
              color="success"
              size="48"
              class="mb-4"
            />
            <p class="text-body-2">Generando código QR del reporte...</p>
          </v-col>
        </v-row>

        <!-- Información del PDF generado -->
        <v-row v-if="lastGeneratedPdf">
          <v-col cols="12" class="text-center">
            <v-divider class="my-4" />
            <v-icon size="64" color="success" class="mb-3">mdi-file-pdf-box</v-icon>
            <h5 class="text-subtitle-1 mb-3">PDF Generado Exitosamente</h5>
            <v-card variant="outlined" class="pa-4 mx-auto" style="max-width: 500px;">
              <p class="text-body-2 mb-3">
                📋 <strong>Reporte {{ qrReportInfo }}</strong><br>
                🔒 <strong>Datos seguros:</strong> Se mantienen localmente<br>
                💬 <strong>WhatsApp:</strong> Listo para enviar
              </p>
              
              <!-- Botón de WhatsApp -->
              <v-btn
                v-if="lastGeneratedPdf"
                color="success"
                variant="flat"
                prepend-icon="mdi-whatsapp"
                class="mb-3"
                @click="shareViaWhatsApp"
                :loading="sharingWhatsApp"
              >
                💬 Enviar por WhatsApp
              </v-btn>
              
              <p class="text-caption text-grey-darken-1">
                El PDF se ha generado de forma segura manteniendo todos los datos en el dispositivo local.
                Use el botón de WhatsApp para enviar el archivo.
              </p>
            </v-card>
          </v-col>
        </v-row>


        <!-- Mensaje de resultado -->
        <v-alert
          v-if="message"
          :type="messageType"
          variant="tonal"
          closable
          class="mt-4"
          @click:close="clearMessage"
        >
          {{ message }}
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-2">
        <v-spacer />
        <v-btn
          color="secondary"
          variant="text"
          @click="closeDialog"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          v-if="!lastGeneratedPdf"
          color="success"
          variant="flat"
          prepend-icon="mdi-download"
          @click="generatePdf"
          :disabled="loading || !isFormValid"
          :loading="loading"
        >
          Generar PDF
        </v-btn>
        <v-btn
          v-else
          color="success"
          variant="flat"
          prepend-icon="mdi-refresh"
          @click="regeneratePdf"
          :disabled="loading"
        >
          Generar Nuevo PDF
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PdfService } from '@/services/pdfService'

// Las APIs modernas de PWA ya están declaradas en TypeScript 4.9+
// Solo necesitamos verificaciones de tipo en tiempo de ejecución

// Props y eventos
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'pdf-generated': [message: string]
  'close': []
}>()

// Estado reactivo
const reportType = ref<'current' | 'date-range'>('current')
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const qrReportInfo = ref('')
const lastGeneratedPdf = ref<{ dataUri: string; filename: string } | null>(null)

// Variables WhatsApp
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

// Función para generar PDF y abrir en nueva ventana
const generatePdf = async () => {
  loading.value = true
  clearMessage()

  try {
    // Preparar opciones para el servicio
    const options = {
      type: reportType.value,
      startDate: startDate.value,
      endDate: endDate.value
    }
    
    qrReportInfo.value = reportType.value === 'current' 
      ? 'de hoy' 
      : `del ${formatDate(startDate.value)} al ${formatDate(endDate.value)}`
    
    console.log('🔍 [Modal] Generando PDF con opciones:', options)
    
    // Generar PDF usando el servicio real
    const result = await PdfService.generateReport(options)
    
    if (result.success && result.dataUri) {
      console.log('📄 [PDF] PDF generado exitosamente')
      console.log('📄 [PDF] Tamaño:', ((result.size || 0) / 1024).toFixed(1), 'KB')
      console.log('📄 [PDF] Archivo:', result.filename)
      
      // ✅ SOLUCIÓN MEJORADA: Usar descarga directa y fallbacks
      console.log('💾 [PDF] Iniciando descarga directa y visualización alternativa...')
      
      // ✅ PDF GENERADO - Preparar para WhatsApp
      console.log('💬 [WhatsApp] PDF generado, preparando para compartir...')
      
      showPdfPreview(result.dataUri, result.filename || 'reporte-ircca.pdf')
      
      emit('pdf-generated', result.message)
    } else {
      message.value = result.message || 'Error al generar el PDF'
      messageType.value = 'error'
    }
    
  } catch (error) {
    message.value = 'Error al generar el reporte PDF. Intente nuevamente.'
    messageType.value = 'error'
    console.error('❌ Error generando PDF:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const closeDialog = () => {
  clearMessage()
  loading.value = false
  lastGeneratedPdf.value = null
  sharingWhatsApp.value = false
  emit('update:modelValue', false)
  emit('close')
}

const clearMessage = () => {
  message.value = ''
}

// Función auxiliar para convertir Data URI a Blob
const dataURItoBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(',')[1])
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  
  return new Blob([ab], { type: mimeString })
}

// Función para mostrar preview del PDF en el modal
const showPdfPreview = (dataUri: string, filename: string) => {
  console.log('🖥️ [PDF] Mostrando preview del PDF en modal')
  
  // Guardar datos del PDF para descarga manual
  lastGeneratedPdf.value = { dataUri, filename }
  
  // Actualizar información para mostrar en el modal
  qrReportInfo.value = reportType.value === 'current' 
    ? 'de hoy' 
    : `del ${formatDate(startDate.value)} al ${formatDate(endDate.value)}`
}

// Función para regenerar PDF (limpia el anterior y genera uno nuevo)
const regeneratePdf = () => {
  lastGeneratedPdf.value = null
  clearMessage()
  generatePdf()
}

// Función para compartir PDF via WhatsApp
const shareViaWhatsApp = async () => {
  if (!lastGeneratedPdf.value) return
  
  try {
    sharingWhatsApp.value = true
    console.log('💬 [WhatsApp] Iniciando envío PDF...')
    
    // Crear blob del PDF
    const blob = dataURItoBlob(lastGeneratedPdf.value.dataUri)
    const file = new File([blob], lastGeneratedPdf.value.filename, { type: 'application/pdf' })
    
    // OPCIÓN 1: Web Share API (si está disponible)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Reporte IRCCA',
          text: `Reporte del Instituto IRCCA - ${qrReportInfo.value}`
        })
        
        console.log('✅ [WhatsApp] PDF compartido exitosamente via Web Share API')
        message.value = '✅ PDF enviado por WhatsApp'
        messageType.value = 'success'
        
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name === 'AbortError') {
          console.log('ℹ️ [WhatsApp] Usuario canceló el compartir')
        } else {
          throw shareError
        }
      }
    } 
    // OPCIÓN 2: URL de WhatsApp Web (fallback)
    else {
      console.log('ℹ️ [WhatsApp] Web Share API no disponible, usando WhatsApp Web')
      
      // Mensaje para WhatsApp
      const text = `📄 *Reporte IRCCA* ${qrReportInfo.value}%0A%0A_El archivo PDF será enviado en el siguiente mensaje_`
      
      // Abrir WhatsApp Web
      const whatsappUrl = `https://wa.me/?text=${text}`
      window.open(whatsappUrl, '_blank')
      
      message.value = 'ℹ️ WhatsApp Web abierto. Envía el PDF manualmente desde tu dispositivo.'
      messageType.value = 'info'
      
      console.log('ℹ️ [WhatsApp] WhatsApp Web abierto')
    }
    
  } catch (error) {
    console.error('❌ [WhatsApp] Error al compartir:', error)
    message.value = '❌ Error al enviar por WhatsApp'
    messageType.value = 'error'
  } finally {
    sharingWhatsApp.value = false
  }
}


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

// Computed para v-model
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Efecto telón (como otros modales)
watch(modelValue, (newVal: boolean) => {
  if (newVal) {
    window.dispatchEvent(new CustomEvent('dialog-opened'))
  } else {
    window.dispatchEvent(new CustomEvent('dialog-closed'))
  }
})

// Efecto telón (como otros modales)
watch(modelValue, (newVal: boolean) => {
  if (newVal) {
    window.dispatchEvent(new CustomEvent('dialog-opened'))
  } else {
    window.dispatchEvent(new CustomEvent('dialog-closed'))
  }
})
</script>

<style scoped>
.pdf-generator-dialog-card {
  border-radius: 12px;
  overflow: hidden;
  border-top: 3px solid rgb(var(--v-theme-success));
}

.v-radio-group :deep(.v-selection-control-group) {
  flex-direction: row;
  gap: 2rem;
}

.v-progress-circular {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.qr-code-image {
  width: 200px;
  height: 200px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}
</style>
