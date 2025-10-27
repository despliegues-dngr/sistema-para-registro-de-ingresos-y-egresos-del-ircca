<template>
  <v-card-text class="px-6 py-4" style="max-height: 500px; overflow-y: auto;">
    <!-- Pregunta 0: Rating General -->
    <div class="mb-6">
      <label class="text-subtitle-1 font-weight-bold mb-2 d-block">
        1. ¿Cómo calificarías tu experiencia general con el sistema?
        <span class="text-error">*</span>
      </label>
      <v-rating
        :model-value="formData.rating"
        @update:model-value="emitRating"
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
        :model-value="formData.velocidadScore"
        @update:model-value="emitVelocidad"
        :min="1"
        :max="5"
        :step="1"
        :ticks="tickLabels"
        show-ticks="always"
        tick-size="4"
        color="primary"
        track-color="grey-lighten-2"
        thumb-label
      />
    </div>

    <!-- Pregunta 2: Facilidad -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        3. ¿Qué tan fácil es usar el sistema en tu trabajo diario?
        <span class="text-error">*</span>
      </label>
      <v-slider
        :model-value="formData.facilidadScore"
        @update:model-value="emitFacilidad"
        :min="1"
        :max="5"
        :step="1"
        :ticks="tickLabels"
        show-ticks="always"
        tick-size="4"
        color="primary"
        track-color="grey-lighten-2"
        thumb-label
      />
    </div>

    <!-- Pregunta 3: Confiabilidad -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        4. ¿Qué tan confiable es el sistema cuando no hay internet?
        <span class="text-error">*</span>
      </label>
      <v-slider
        :model-value="formData.confiabilidadScore"
        @update:model-value="emitConfiabilidad"
        :min="1"
        :max="5"
        :step="1"
        :ticks="tickLabels"
        show-ticks="always"
        tick-size="4"
        color="primary"
        track-color="grey-lighten-2"
        thumb-label
      />
    </div>

    <!-- Pregunta 4: Autocompletado -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        5. ¿Qué tan útil es el autocompletado para personas recurrentes?
        <span class="text-error">*</span>
      </label>
      <v-slider
        :model-value="formData.autocompletadoScore"
        @update:model-value="emitAutocompletado"
        :min="1"
        :max="5"
        :step="1"
        :ticks="tickLabels"
        show-ticks="always"
        tick-size="4"
        color="primary"
        track-color="grey-lighten-2"
        thumb-label
      />
    </div>

    <!-- Pregunta 5: Impacto -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        6. ¿Cuánto ha mejorado tu flujo de trabajo vs. planillas manuales?
        <span class="text-error">*</span>
      </label>
      <v-slider
        :model-value="formData.impactoScore"
        @update:model-value="emitImpacto"
        :min="1"
        :max="5"
        :step="1"
        :ticks="tickLabels"
        show-ticks="always"
        tick-size="4"
        color="primary"
        track-color="grey-lighten-2"
        thumb-label
      />
    </div>

    <v-divider class="my-4" />

    <!-- Comentarios opcionales -->
    <div class="mb-2">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        7. ¿Qué podríamos mejorar? ¿Qué te gusta más? (Opcional)
      </label>
      <v-textarea
        :model-value="formData.comentarios"
        @update:model-value="emitComentarios"
        placeholder="Tus comentarios nos ayudan a mejorar el sistema..."
        variant="outlined"
        rows="3"
        counter="500"
        :maxlength="500"
        hide-details="auto"
      />
    </div>
  </v-card-text>
</template>

<script setup lang="ts">
interface FormData {
  rating: number
  velocidadScore: number
  facilidadScore: number
  confiabilidadScore: number
  autocompletadoScore: number
  impactoScore: number
  comentarios: string
}

defineProps<{
  formData: FormData
}>()

const emit = defineEmits<{
  'update:rating': [value: number]
  'update:velocidad-score': [value: number]
  'update:facilidad-score': [value: number]
  'update:confiabilidad-score': [value: number]
  'update:autocompletado-score': [value: number]
  'update:impacto-score': [value: number]
  'update:comentarios': [value: string]
}>()

// Helper functions tipadas para compatibilidad con Vuetify
const emitRating = (value: string | number) => emit('update:rating', Number(value))
const emitVelocidad = (value: string | number) => emit('update:velocidad-score', Number(value))
const emitFacilidad = (value: string | number) => emit('update:facilidad-score', Number(value))
const emitConfiabilidad = (value: string | number) => emit('update:confiabilidad-score', Number(value))
const emitAutocompletado = (value: string | number) => emit('update:autocompletado-score', Number(value))
const emitImpacto = (value: string | number) => emit('update:impacto-score', Number(value))
const emitComentarios = (value: string) => emit('update:comentarios', value)

// Labels para los sliders
const tickLabels: Record<number, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5'
}

/**
 * Obtiene texto descriptivo según el rating
 */
function getRatingText(rating: number): string {
  const texts: Record<number, string> = {
    1: '😞 Necesitamos mejorar mucho',
    2: '😕 Hay bastante por mejorar',
    3: '😐 Está bien, pero puede mejorar',
    4: '😊 ¡Muy buena experiencia!',
    5: '🤩 ¡Excelente! Nos encanta escuchar esto'
  }
  // eslint-disable-next-line security/detect-object-injection
  return texts[rating] || ''
}
</script>

<style scoped>
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
</style>
