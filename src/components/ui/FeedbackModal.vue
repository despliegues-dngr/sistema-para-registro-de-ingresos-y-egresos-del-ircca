<template>
  <v-dialog
    v-model="localValue"
    max-width="600"
    persistent
    :scrim="true"
  >
    <v-card class="feedback-card">
      <!-- Header -->
      <v-card-title class="text-h5 pb-3 px-6 pt-6 d-flex align-center">
        <v-icon color="primary" class="mr-3" size="large">mdi-comment-quote-outline</v-icon>
        ¡Tu opinión es importante!
      </v-card-title>

      <v-divider />

      <v-card-text class="px-6 py-6">
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
          ¿Podrías ayudarnos a mejorar compartiendo tu experiencia?
        </v-alert>

        <!-- Rating con estrellas -->
        <div class="mb-4">
          <label class="text-subtitle-1 font-weight-medium mb-2 d-block">
            ¿Cómo calificarías tu experiencia con el sistema?
          </label>
          <v-rating
            v-model="rating"
            :length="5"
            :size="48"
            color="warning"
            active-color="warning"
            hover
            class="rating-stars"
          />
          <p v-if="rating" class="text-caption text-grey-darken-1 mt-2">
            {{ getRatingText(rating) }}
          </p>
        </div>

        <!-- Comentarios opcionales -->
        <v-textarea
          v-model="comentarios"
          label="Comentarios (opcional)"
          placeholder="¿Qué podríamos mejorar? ¿Qué te gusta del sistema?"
          variant="outlined"
          rows="3"
          counter="500"
          :maxlength="500"
          hide-details="auto"
        />
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
          :disabled="!rating || isSubmitting"
          :loading="isSubmitting"
        >
          <v-icon start>mdi-send</v-icon>
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
const rating = ref<number>(0)
const comentarios = ref('')
const isSubmitting = ref(false)
const totalRegistros = ref(0)

// Computed
const localValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

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
  if (!rating.value) {
    appStore.addNotification('Por favor selecciona una calificación', 'warning')
    return
  }

  isSubmitting.value = true

  try {
    const result = await feedbackComposable.handleFeedbackAction({
      type: 'complete',
      rating: rating.value,
      comentarios: comentarios.value || undefined
    })

    if (result.success) {
      appStore.addNotification('¡Gracias por tu feedback! 🎉', 'success')
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
  rating.value = 0
  comentarios.value = ''
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
