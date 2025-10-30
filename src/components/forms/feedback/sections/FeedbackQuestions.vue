<template>
  <v-container fluid class="pa-4">
    <!-- Rating Principal -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="pa-4 bg-primary-lighten-5 feedback-card-title">
        <div class="d-flex align-start w-100">
          <v-icon class="me-3 mt-1" color="primary">mdi-star-outline</v-icon>
          <div class="flex-grow-1">
            <span class="text-h6 d-block">¿Cómo calificarías tu experiencia general?</span>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6 text-center">
        <v-rating
          :model-value="formData.rating"
          @update:model-value="(emit as any)('update:rating', $event)"
          :length="5"
          :size="mobile ? 40 : 48"
          color="warning"
          hover
          class="mb-4"
        />
        <v-chip
          v-if="formData.rating"
          :color="getRatingColor(formData.rating)"
          variant="tonal"
          size="small"
        >
          {{ getRatingText(formData.rating) }}
        </v-chip>
      </v-card-text>
    </v-card>

    <!-- Preguntas Likert -->
    <v-card
      v-for="question in questions"
      :key="question.key"
      class="mb-4"
      elevation="1"
    >
      <v-card-title class="pa-4 bg-grey-lighten-5 feedback-card-title">
        <div class="d-flex align-start w-100">
          <v-icon class="me-3 mt-1" color="primary" :size="mobile ? 18 : 20">
            {{ question.icon }}
          </v-icon>
          <div class="flex-grow-1">
            <span :class="mobile ? 'text-body-1' : 'text-h6'" class="d-block">
              {{ question.title }}
            </span>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <div class="rating-buttons-container">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="rating-button"
            :class="{ 'active': formData[question.key] === n }"
            @click="(emit as any)(question.event, n)"
          >
            <div class="rating-number">{{ n }}</div>
            <div class="rating-label">{{ getLikertLabel(n) }}</div>
          </button>
        </div>
      </v-card-text>
    </v-card>

    <!-- Comentarios -->
    <v-card elevation="1">
      <v-card-title class="pa-4 bg-grey-lighten-5 feedback-card-title">
        <div class="d-flex align-start w-100">
          <v-icon class="me-3 mt-1" color="primary" :size="mobile ? 18 : 20">
            mdi-comment-text
          </v-icon>
          <div class="flex-grow-1">
            <span :class="mobile ? 'text-body-1' : 'text-h6'" class="d-block">
              ¿Qué podríamos mejorar? (Opcional)
            </span>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-textarea
          :model-value="formData.comentarios"
          @update:model-value="(emit as any)('update:comentarios', $event)"
          placeholder="Tus comentarios nos ayudan a mejorar..."
          variant="outlined"
          :rows="mobile ? 3 : 4"
          counter="500"
          :maxlength="500"
          hide-details="auto"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

// Composables de Vuetify para responsividad
const { mobile } = useDisplay()

// Props y eventos
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

const emit = defineEmits({
  'update:rating': (value: number) => typeof value === 'number',
  'update:velocidad-score': (value: number) => typeof value === 'number',
  'update:facilidad-score': (value: number) => typeof value === 'number',
  'update:implementacion-score': (value: number) => typeof value === 'number',
  'update:impacto-score': (value: number) => typeof value === 'number',
  'update:comentarios': (value: string) => typeof value === 'string'
})

// Configuración de preguntas
const questions = [
  {
    key: 'velocidadScore' as keyof FormData,
    title: '¿Qué tan rápido es el sistema?',
    icon: 'mdi-speedometer',
    event: 'update:velocidad-score'
  },
  {
    key: 'facilidadScore' as keyof FormData,
    title: '¿Qué tan fácil es usar el sistema?',
    icon: 'mdi-hand-okay',
    event: 'update:facilidad-score'
  },
  {
    key: 'implementacionScore' as keyof FormData,
    title: '¿Recomienda Implementar en otros servicios?',
    icon: 'mdi-office-building',
    event: 'update:implementacion-score'
  },
  {
    key: 'impactoScore' as keyof FormData,
    title: '¿Qué nivel de mejora tiene comparado con las planillas manuales?',
    icon: 'mdi-chart-line',
    event: 'update:impacto-score'
  }
]

// Funciones auxiliares

function getLikertLabel(value: number): string {
  const labels: Record<number, string> = {
    1: 'Malo',
    2: 'Regular',
    3: 'Bueno',
    4: 'Muy Bueno',
    5: 'Excelente'
  }
  // eslint-disable-next-line security/detect-object-injection
  return labels[value] || ''
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return 'success'
  if (rating === 3) return 'warning'
  return 'error'
}

function getRatingText(rating: number): string {
  const texts: Record<number, string> = {
    1: 'Experiencia deficiente - Necesita mejoras urgentes',
    2: 'Experiencia regular - Hay aspectos importantes por mejorar',
    3: 'Experiencia buena - El sistema funciona adecuadamente',
    4: 'Muy buena experiencia - Sistema satisfactorio',
    5: 'Experiencia excelente - Sistema excepcional'
  }
  // eslint-disable-next-line security/detect-object-injection
  return texts[rating] || ''
}
</script>

<style scoped>
/* Componentes nativos sin dependencias de Vuetify */

/* Contenedor de botones */
.rating-buttons-container {
  display: flex;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

/* Botones nativos */
.rating-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  min-height: 90px;
  background: white;
  border: none;
  border-right: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.rating-button:last-child {
  border-right: none;
}

/* Números */
.rating-number {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  color: #333;
  margin-bottom: 6px;
  display: block;
}

/* Etiquetas */
.rating-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  line-height: 1.2;
  text-align: center;
  display: block;
}

/* Estados interactivos */
.rating-button:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rating-button:hover .rating-number {
  color: #1976d2;
}

.rating-button:hover .rating-label {
  color: #1976d2;
}

/* Estado activo */
.rating-button.active {
  background-color: rgba(25, 118, 210, 0.08);
  border-color: #1976d2;
}

.rating-button.active .rating-number,
.rating-button.active .rating-label {
  color: #1976d2;
}

/* Focus para accesibilidad */
.rating-button:focus {
  outline: 2px solid #1976d2;
  outline-offset: -2px;
}

/* Títulos de cards */
.feedback-card-title {
  line-height: 1.4;
  word-break: break-word;
  white-space: normal;
  word-wrap: break-word;
}

/* Responsive - Tablet */
@media (max-width: 768px) {
  .rating-button {
    padding: 12px 6px;
    min-height: 80px;
  }

  .rating-number {
    font-size: 1.3rem;
    margin-bottom: 4px;
  }

  .rating-label {
    font-size: 0.7rem;
  }
}

/* Responsive - Móvil */
@media (max-width: 480px) {
  .rating-button {
    padding: 10px 4px;
    min-height: 70px;
  }

  .rating-number {
    font-size: 1.2rem;
    margin-bottom: 3px;
  }

  .rating-label {
    font-size: 0.65rem;
  }
}
</style>
