<template>
  <v-dialog
    v-model="localValue"
    max-width="700"
    persistent
    :scrim="true"
    scrollable
  >
    <v-card class="feedback-card">
      <!-- Header -->
      <v-card-title class="text-h5 pb-3 px-6 pt-6 d-flex align-center bg-primary">
        <v-icon color="white" class="mr-3" size="large">mdi-comment-quote-outline</v-icon>
        <span class="text-white">¡Tu opinión es importante!</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="px-6 py-6" style="max-height: 600px;">
        <!-- Mensaje introductorio -->
        <v-alert
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-4"
        >
          <template #prepend>
            <v-icon>mdi-information-outline</v-icon>
          </template>
          Has realizado <strong>{{ totalRegistros }} registros</strong> en el sistema.
          Ayúdanos a mejorar compartiendo tu experiencia (toma 2 minutos).
        </v-alert>

        <!-- Pregunta 0: Rating General -->
        <div class="mb-6">
          <label class="text-subtitle-1 font-weight-bold mb-2 d-block">
            1. ¿Cómo calificarías tu experiencia general con el sistema?
            <span class="text-error">*</span>
          </label>
          <v-rating
            v-model="formData.rating"
            :length="5"
            :size="48"
            color="warning"
            active-color="warning"
            hover
            class="rating-stars"
          />
          <p v-if="formData.rating" class="text-caption text-grey-darken-1 mt-2">
            {{ getRatingText(formData.rating) }}
          </p>
        </div>

        <v-divider class="my-4" />

        <!-- Preguntas Específicas -->
        <p class="text-subtitle-2 font-weight-bold mb-4">
          Califica los siguientes aspectos (1 = Muy malo, 5 = Excelente):
        </p>

        <!-- Pregunta 1: Velocidad -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            2. ¿Qué tan rápido es el sistema para registrar ingresos/salidas?
            <span class="text-error">*</span>
          </label>
          <v-slider
            v-model="formData.velocidadScore"
            :min="1"
            :max="5"
            :step="1"
            :ticks="tickLabels"
            show-ticks="always"
            tick-size="4"
            color="primary"
            track-color="grey-lighten-2"
            thumb-label
          >
            <template #thumb-label="{ modelValue }">
              {{ modelValue }}
            </template>
          </v-slider>
        </div>

        <!-- Pregunta 2: Facilidad -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            3. ¿Qué tan fácil es usar el sistema en tu trabajo diario?
            <span class="text-error">*</span>
          </label>
          <v-slider
            v-model="formData.facilidadScore"
            :min="1"
            :max="5"
            :step="1"
            :ticks="tickLabels"
            show-ticks="always"
            tick-size="4"
            color="primary"
            track-color="grey-lighten-2"
            thumb-label
          >
            <template #thumb-label="{ modelValue }">
              {{ modelValue }}
            </template>
          </v-slider>
        </div>

        <!-- Pregunta 3: Implementación -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            4. ¿Qué opinas de implementar este sistema en servicios similares como los portones de ingreso de la Colonia Berro y el INISA?
            <span class="text-error">*</span>
          </label>
          <v-slider
            v-model="formData.implementacionScore"
            :min="1"
            :max="5"
            :step="1"
            :ticks="tickLabels"
            show-ticks="always"
            tick-size="4"
            color="primary"
            track-color="grey-lighten-2"
            thumb-label
          >
            <template #thumb-label="{ modelValue }">
              {{ modelValue }}
            </template>
          </v-slider>
        </div>

        <!-- Pregunta 4: Impacto -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            5. ¿Cuánto ha mejorado tu flujo de trabajo vs. planillas manuales?
            <span class="text-error">*</span>
          </label>
          <v-slider
            v-model="formData.impactoScore"
            :min="1"
            :max="5"
            :step="1"
            :ticks="tickLabels"
            show-ticks="always"
            tick-size="4"
            color="primary"
            track-color="grey-lighten-2"
            thumb-label
          >
            <template #thumb-label="{ modelValue }">
              {{ modelValue }}
            </template>
          </v-slider>
        </div>

        <v-divider class="my-4" />

        <!-- Comentarios opcionales -->
        <div class="mb-2">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            6. ¿Qué podríamos mejorar? Recomendaciones (Opcional)
          </label>
          <v-textarea
            v-model="formData.comentarios"
            placeholder="Tus comentarios nos ayudan a mejorar el sistema..."
            variant="outlined"
            rows="3"
            counter="500"
            :maxlength="500"
            hide-details="auto"
          />
        </div>
      </v-card-text>

      <v-divider />

      <!-- Footer con acciones -->
      <v-card-actions class="px-6 py-4 d-flex flex-column flex-sm-row ga-2">
        <!-- Botón: No volver a preguntar -->
        <v-btn
          variant="text"
          color="grey"
          size="small"
          @click="handleDismiss"
          :disabled="isSubmitting"
        >
          No volver a preguntar
        </v-btn>

        <v-spacer />

        <!-- Botón: Recordarme más tarde -->
        <v-btn
          variant="outlined"
          color="primary"
          @click="handlePostpone"
          :disabled="isSubmitting"
        >
          <v-icon start>mdi-clock-outline</v-icon>
          Más tarde
        </v-btn>

        <!-- Botón: Enviar encuesta -->
        <v-btn
          variant="flat"
          color="success"
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
        >
          <v-icon start>mdi-send</v-icon>
          Enviar Encuesta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFeedback } from '@/composables/useFeedback'
import { useAppStore } from '@/stores/app'
import type { StoredUser } from '@/stores/auth'
import { useDatabase } from '@/composables/useDatabase'

// Props y eventos
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Composables
const authStore = useAuthStore()
const feedbackComposable = useFeedback()
const appStore = useAppStore()
const db = useDatabase()

// State
const formData = reactive({
  rating: 0,
  velocidadScore: 3,
  facilidadScore: 3,
  implementacionScore: 3,
  impactoScore: 3,
  comentarios: ''
})

const isSubmitting = ref(false)
const totalRegistros = ref(0)

// Computed
const localValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const isFormValid = computed(() => {
  return formData.rating > 0 &&
         formData.velocidadScore > 0 &&
         formData.facilidadScore > 0 &&
         formData.implementacionScore > 0 &&
         formData.impactoScore > 0
})

// Labels para los sliders
const tickLabels: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5'
}

// Cargar total de registros del usuario
const loadUserStats = async () => {
  if (!authStore.user) return

  try {
    const usuario = await db.getRecord('usuarios', authStore.user.id) as StoredUser | undefined
    if (usuario) {
      totalRegistros.value = usuario.totalRegistrosRealizados || 0
    }
  } catch {
    // Error silencioso
  }
}

// Cargar stats al montar
loadUserStats()

/**
 * Mapa de textos descriptivos según el rating
 */
const ratingTextMap = new Map<number, string>([
  [1, '😞 Necesitamos mejorar mucho'],
  [2, '😕 Hay bastante por mejorar'],
  [3, '😐 Está bien, pero puede mejorar'],
  [4, '😊 ¡Muy buena experiencia!'],
  [5, '🤩 ¡Excelente! Nos encanta escuchar esto']
])

/**
 * Obtiene texto descriptivo según el rating
 */
function getRatingText(rating: number): string {
  return ratingTextMap.get(rating) || ''
}

/**
 * Maneja el envío de la encuesta
 */
async function handleSubmit() {
  if (!isFormValid.value) {
    appStore.addNotification('Por favor completa todas las preguntas obligatorias', 'warning')
    return
  }

  isSubmitting.value = true

  try {
    const result = await feedbackComposable.guardarEncuestaCompleta(
      formData.rating,
      formData.velocidadScore,
      formData.facilidadScore,
      formData.implementacionScore,
      formData.impactoScore,
      formData.comentarios || undefined
    )

    if (result.success) {
      appStore.addNotification('¡Gracias por tu feedback! Nos ayuda a mejorar 🎉', 'success')
      localValue.value = false
      resetForm()
    } else {
      appStore.addNotification(result.error || 'Error al enviar feedback', 'error')
    }
  } catch {
    appStore.addNotification('Error al enviar feedback', 'error')
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Maneja "Recordarme más tarde"
 */
async function handlePostpone() {
  await feedbackComposable.handleFeedbackAction({ type: 'postpone' })
  appStore.addNotification('Te recordaremos en unos registros más', 'info')
  localValue.value = false
  resetForm()
}

/**
 * Maneja "No volver a preguntar"
 */
async function handleDismiss() {
  await feedbackComposable.handleFeedbackAction({ type: 'dismiss' })
  appStore.addNotification('Entendido, no volveremos a preguntar', 'info')
  localValue.value = false
  resetForm()
}

/**
 * Resetea el formulario
 */
function resetForm() {
  formData.rating = 0
  formData.velocidadScore = 3
  formData.facilidadScore = 3
  formData.implementacionScore = 3
  formData.impactoScore = 3
  formData.comentarios = ''
}
</script>

<style scoped>
.feedback-card {
  border-radius: 12px;
}

.rating-stars {
  display: flex;
  justify-content: center;
}

/* Animación suave para las estrellas */
.rating-stars :deep(.v-rating__item) {
  transition: transform 0.2s ease;
}

.rating-stars :deep(.v-rating__item:hover) {
  transform: scale(1.1);
}

/* Estilos para sliders */
:deep(.v-slider__tick-label) {
  font-size: 0.75rem;
}

/* Responsive: Stack buttons en móvil */
@media (max-width: 600px) {
  .v-card-actions {
    flex-direction: column;
  }

  .v-card-actions .v-btn {
    width: 100%;
  }
}
</style>
