<template>
  <v-card-text class="px-6 py-4" style="max-height: 500px; overflow-y: auto;">
    <!-- Rating General -->
    <div class="mb-5">
      <label class="text-subtitle-1 font-weight-bold mb-3 d-block">
        ¿Cómo calificarías tu experiencia general con el sistema?
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

    <!-- Velocidad -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        <v-icon size="small" class="mr-1" color="primary">mdi-speedometer</v-icon>
        ¿Qué tan rápido es el sistema para registrar ingresos/salidas?
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

    <!-- Facilidad -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        <v-icon size="small" class="mr-1" color="primary">mdi-hand-okay</v-icon>
        ¿Qué tan fácil es usar el sistema en tu trabajo diario?
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

    <!-- Implementación -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        <v-icon size="small" class="mr-1" color="primary">mdi-office-building</v-icon>
        ¿Qué opinas de implementar este sistema en servicios similares como los portones de ingreso de la Colonia Berro y el INISA?
        <span class="text-error">*</span>
      </label>
      <v-slider
        :model-value="formData.implementacionScore"
        @update:model-value="emitImplementacion"
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

    <!-- Impacto -->
    <div class="mb-4">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        <v-icon size="small" class="mr-1" color="primary">mdi-chart-line</v-icon>
        ¿Cuánto ha mejorado tu flujo de trabajo vs. planillas manuales?
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

    <!-- Comentarios al final -->
    <div class="mb-2">
      <label class="text-body-2 font-weight-medium mb-2 d-block">
        <v-icon size="small" class="mr-1" color="primary">mdi-comment-text</v-icon>
        ¿Qué podríamos mejorar? Recomendaciones (Opcional)
      </label>
      <v-textarea
        :model-value="formData.comentarios"
        @update:model-value="emitComentarios"
        placeholder="Tus comentarios nos ayudan a mejorar el sistema..."
        variant="outlined"
        rows="4"
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
  implementacionScore: number
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
  'update:implementacion-score': [value: number]
  'update:impacto-score': [value: number]
  'update:comentarios': [value: string]
}>()

// Helper functions tipadas para compatibilidad con Vuetify
const emitRating = (value: string | number) => emit('update:rating', Number(value))
const emitVelocidad = (value: string | number) => emit('update:velocidad-score', Number(value))
const emitFacilidad = (value: string | number) => emit('update:facilidad-score', Number(value))
const emitImplementacion = (value: string | number) => emit('update:implementacion-score', Number(value))
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
