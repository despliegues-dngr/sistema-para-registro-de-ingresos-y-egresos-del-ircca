<template>
  <FullScreenModal
    v-model="localValue"
    title="Generar Reporte PDF"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-file-pdf-box"
    header-color="success"
    @close="handleClose"
  >
    <!-- Contenido del modal -->
    <div class="pa-6">
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
        <v-row v-if="reportType === 'date-range'" class="mt-2">
          <v-col cols="6">
            <v-text-field
              ref="startDateInput"
              v-model="startDate"
              label="Fecha Inicio"
              type="date"
              variant="outlined"
              density="comfortable"
              color="success"
              hide-details="auto"
              append-inner-icon="mdi-calendar"
              :max="maxDate"
              :rules="dateRules"
              @click:append-inner="openDatePicker('startDateInput')"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              ref="endDateInput"
              v-model="endDate"
              label="Fecha Fin"
              type="date"
              variant="outlined"
              density="comfortable"
              color="success"
              hide-details="auto"
              append-inner-icon="mdi-calendar"
              :min="startDate"
              :max="maxDate"
              :rules="dateRules"
              @click:append-inner="openDatePicker('endDateInput')"
            />
          </v-col>
        </v-row>

        <!-- Selección de horario (opcional) -->
        <v-row v-if="reportType === 'date-range'" class="mt-2">
          <v-col cols="12">
            <v-checkbox
              v-model="useTimeFilter"
              label="Filtrar por horario específico (opcional)"
              color="success"
              density="comfortable"
              hide-details
            />
          </v-col>
        </v-row>

        <v-row v-if="reportType === 'date-range' && useTimeFilter" class="mt-2">
          <v-col cols="6">
            <v-text-field
              ref="startTimeInput"
              v-model="startTime"
              label="Hora Inicio"
              type="time"
              variant="outlined"
              density="comfortable"
              color="success"
              append-inner-icon="mdi-clock-outline"
              hint="Formato 24 horas"
              persistent-hint
              @click:append-inner="openTimePicker('startTimeInput')"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              ref="endTimeInput"
              v-model="endTime"
              label="Hora Fin"
              type="time"
              variant="outlined"
              density="comfortable"
              color="success"
              append-inner-icon="mdi-clock-outline"
              hint="Formato 24 horas"
              persistent-hint
              @click:append-inner="openTimePicker('endTimeInput')"
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
            
            <!-- ✅ Check verde en lugar de icono PDF -->
            <v-avatar size="80" color="success" class="mb-3">
              <v-icon size="48" color="white">mdi-check-bold</v-icon>
            </v-avatar>
            
            <h5 class="text-h6 mb-2 text-success">PDF Generado Exitosamente</h5>
            <p class="text-body-2 text-grey-darken-1 mb-4">
              📋 Reporte <strong>{{ qrReportInfo }}</strong>
            </p>
            
            <!-- Botón de WhatsApp -->
            <v-btn
              color="success"
              variant="flat"
              size="large"
              prepend-icon="mdi-whatsapp"
              @click="shareViaWhatsApp"
              :loading="sharingWhatsApp"
            >
              Enviar por WhatsApp
            </v-btn>
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
    </div>

    <!-- Footer con acciones -->
    <template #footer>
      <div class="d-flex justify-end ga-2 pa-4">
        <v-btn
          color="secondary"
          variant="text"
          @click="handleClose"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          v-if="!lastGeneratedPdf"
          color="success"
          variant="flat"
          prepend-icon="mdi mdi-download"
          @click="handleGeneratePdf"
          :disabled="loading || !isFormValid"
          :loading="loading"
        >
          Generar PDF
        </v-btn>
        <v-btn
          v-else
          color="success"
          variant="flat"
          prepend-icon="mdi mdi-refresh"
          @click="regeneratePdf"
          :disabled="loading"
        >
          Generar Nuevo PDF
        </v-btn>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FullScreenModal from './FullScreenModal.vue'
import { usePdfGenerator } from '@/composables/usePdfGenerator'

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

// Usar composable para lógica de negocio
const {
  reportType,
  startDate,
  endDate,
  useTimeFilter,
  startTime,
  endTime,
  loading,
  message,
  messageType,
  qrReportInfo,
  lastGeneratedPdf,
  sharingWhatsApp,
  maxDate,
  dateRules,
  isFormValid,
  generatePdf,
  regeneratePdf,
  shareViaWhatsApp,
  clearMessage,
  reset
} = usePdfGenerator()

// Computed para v-model
const localValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Handler para generar PDF y emitir evento
const handleGeneratePdf = async () => {
  const result = await generatePdf()
  if (result.success) {
    emit('pdf-generated', result.message)
  }
}

// Handler para abrir selector de fecha nativo
const openDatePicker = (refName: string) => {
  const inputRef = refName === 'startDateInput' ? startDateInput : endDateInput
  if (inputRef.value) {
    const inputElement = inputRef.value.$el.querySelector('input[type="date"]')
    if (inputElement) {
      inputElement.showPicker()
    }
  }
}

// Handler para abrir selector de hora nativo
const openTimePicker = (refName: string) => {
  const inputRef = refName === 'startTimeInput' ? startTimeInput : endTimeInput
  if (inputRef.value) {
    const inputElement = inputRef.value.$el.querySelector('input[type="time"]')
    if (inputElement) {
      inputElement.showPicker()
    }
  }
}

// Refs para los inputs
const startDateInput = ref()
const endDateInput = ref()
const startTimeInput = ref()
const endTimeInput = ref()

// Handler para cerrar modal
const handleClose = () => {
  reset()
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
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

/* ✅ Ocultar iconos nativos del navegador para evitar duplicación */
:deep(input[type="date"]::-webkit-calendar-picker-indicator),
:deep(input[type="time"]::-webkit-calendar-picker-indicator) {
  display: none;
  -webkit-appearance: none;
}

:deep(input[type="date"]::-webkit-inner-spin-button),
:deep(input[type="date"]::-webkit-outer-spin-button),
:deep(input[type="time"]::-webkit-inner-spin-button),
:deep(input[type="time"]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
</style>
