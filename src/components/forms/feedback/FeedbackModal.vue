<template>
  <FullScreenModal
    v-model="modelValue"
    title="Encuesta de Satisfacción"
    subtitle="Sistema de Control de Accesos del IRCCA"
    icon="mdi mdi-comment-question"
    header-color="success"
    :persistent="isSubmitting"
    @close="handleClose"
  >
    <!-- Header con mensaje introductorio -->
    <FeedbackHeader :total-registros="totalRegistros" />

    <!-- Preguntas del formulario -->
    <FeedbackQuestions
      :form-data="formData"
      @update:rating="formData.rating = $event"
      @update:velocidad-score="formData.velocidadScore = $event"
      @update:facilidad-score="formData.facilidadScore = $event"
      @update:confiabilidad-score="formData.confiabilidadScore = $event"
      @update:autocompletado-score="formData.autocompletadoScore = $event"
      @update:impacto-score="formData.impactoScore = $event"
      @update:comentarios="formData.comentarios = $event"
    />

    <!-- Footer con acciones -->
    <template #footer>
      <div class="footer-actions">
        <!-- Botón: No volver a preguntar -->
        <button
          class="btn-text"
          @click="handleDismiss"
          :disabled="isSubmitting"
        >
          <i class="mdi mdi-close-circle"></i>
          No volver a preguntar
        </button>

        <div class="spacer"></div>

        <!-- Botón: Recordarme más tarde -->
        <button
          class="btn-secondary"
          @click="handlePostpone"
          :disabled="isSubmitting"
        >
          <i class="mdi mdi-clock-outline"></i>
          Más tarde
        </button>

        <!-- Botón: Enviar encuesta -->
        <button
          class="btn-primary"
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
        >
          <i class="mdi mdi-send"></i>
          {{ isSubmitting ? 'Enviando...' : 'Enviar Encuesta' }}
        </button>
      </div>
    </template>
  </FullScreenModal>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFeedback } from '@/composables/useFeedback'
import { useAppStore } from '@/stores/app'
import type { StoredUser } from '@/stores/auth'
import { useDatabase } from '@/composables/useDatabase'
import FullScreenModal from '@/components/ui/FullScreenModal.vue'
import FeedbackHeader from './sections/FeedbackHeader.vue'
import FeedbackQuestions from './sections/FeedbackQuestions.vue'

// Props y eventos
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
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
  confiabilidadScore: 3,
  autocompletadoScore: 3,
  impactoScore: 3,
  comentarios: ''
})

const isSubmitting = ref(false)
const totalRegistros = ref(0)

// Computed
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const isFormValid = computed(() => {
  return formData.rating > 0 &&
         formData.velocidadScore > 0 &&
         formData.facilidadScore > 0 &&
         formData.confiabilidadScore > 0 &&
         formData.autocompletadoScore > 0 &&
         formData.impactoScore > 0
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
      formData.confiabilidadScore,
      formData.autocompletadoScore,
      formData.impactoScore,
      formData.comentarios || undefined
    )

    if (result.success) {
      appStore.addNotification('¡Gracias por tu feedback! Nos ayuda a mejorar 🎉', 'info')
      modelValue.value = false
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
  modelValue.value = false
  resetForm()
}

/**
 * Maneja "No volver a preguntar"
 */
async function handleDismiss() {
  await feedbackComposable.handleFeedbackAction({ type: 'dismiss' })
  appStore.addNotification('Entendido, no volveremos a preguntar', 'info')
  modelValue.value = false
  resetForm()
}

/**
 * Maneja el cierre del modal
 */
function handleClose() {
  if (!isSubmitting.value) {
    emit('close')
  }
}

/**
 * Resetea el formulario
 */
function resetForm() {
  formData.rating = 0
  formData.velocidadScore = 3
  formData.facilidadScore = 3
  formData.confiabilidadScore = 3
  formData.autocompletadoScore = 3
  formData.impactoScore = 3
  formData.comentarios = ''
}
</script>

<style scoped>
/* Footer con botones de acción */
.footer-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 16px 0;
}

.spacer {
  flex: 1;
}

/* Botones */
.btn-text,
.btn-secondary,
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-text {
  background: transparent;
  color: #666;
}

.btn-text:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.btn-secondary {
  background: white;
  color: #1976d2;
  border: 2px solid #1976d2;
}

.btn-secondary:hover:not(:disabled) {
  background: #e3f2fd;
}

.btn-primary {
  background: #4caf50;
  color: white;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
}

.btn-text:disabled,
.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive: Stack buttons en móvil */
@media (max-width: 600px) {
  .footer-actions {
    flex-direction: column;
  }
  
  .spacer {
    display: none;
  }
  
  .btn-text,
  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
