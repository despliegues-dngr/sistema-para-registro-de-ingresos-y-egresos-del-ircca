<template>
  <!-- Solo renderizar si está en tablet -->
  <v-menu v-if="isTablet" offset-y :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        color="white"
        class="brightness-control-btn"
        :aria-label="`Brillo: ${brightnessPercent}%`"
      >
        <v-icon color="white">{{ brightnessIcon }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Brillo: {{ brightnessPercent }}%
        </v-tooltip>
      </v-btn>
    </template>

    <v-card min-width="300" max-width="350">
      <v-card-title class="d-flex align-center py-3">
        <v-icon left class="mr-2">mdi-brightness-6</v-icon>
        <span>Brillo de Pantalla</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="py-4">
        <!-- Slider de brillo -->
        <div class="d-flex align-center mb-2">
          <v-btn
            icon
            size="small"
            variant="text"
            :disabled="brightness <= MIN_BRIGHTNESS"
            @click="decreaseBrightness"
            aria-label="Reducir brillo"
          >
            <v-icon>mdi-brightness-5</v-icon>
          </v-btn>

          <v-slider
            :model-value="brightness"
            :min="MIN_BRIGHTNESS"
            :max="MAX_BRIGHTNESS"
            :step="10"
            thumb-label="always"
            color="primary"
            class="mx-3"
            hide-details
            @update:model-value="setBrightness"
          >
            <template #thumb-label="{ modelValue }">
              {{ Math.round((modelValue / MAX_BRIGHTNESS) * 100) }}%
            </template>
          </v-slider>

          <v-btn
            icon
            size="small"
            variant="text"
            :disabled="brightness >= MAX_BRIGHTNESS"
            @click="increaseBrightness"
            aria-label="Aumentar brillo"
          >
            <v-icon>mdi-brightness-7</v-icon>
          </v-btn>
        </div>

        <!-- Indicador de porcentaje -->
        <div class="text-center text-h6 font-weight-bold primary--text mt-2">
          {{ brightnessPercent }}%
        </div>

        <!-- Presets rápidos -->
        <div class="d-flex justify-space-between mt-4 gap-2">
          <v-btn
            size="small"
            variant="outlined"
            @click="setBrightness(100)"
            :class="{ 'v-btn--active': brightness === 100 }"
          >
            <v-icon left size="small">mdi-brightness-4</v-icon>
            Bajo
          </v-btn>

          <v-btn
            size="small"
            variant="outlined"
            @click="setBrightness(180)"
            :class="{ 'v-btn--active': brightness === 180 }"
          >
            <v-icon left size="small">mdi-brightness-5</v-icon>
            Medio
          </v-btn>

          <v-btn
            size="small"
            variant="outlined"
            @click="setBrightness(255)"
            :class="{ 'v-btn--active': brightness === 255 }"
          >
            <v-icon left size="small">mdi-brightness-7</v-icon>
            Alto
          </v-btn>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn
          size="small"
          variant="text"
          prepend-icon="mdi-restore"
          @click="resetBrightness"
        >
          Restablecer (70%)
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTabletBrightness } from '@/composables/useTabletBrightness'

const {
  brightness,
  brightnessPercent,
  isTablet,
  MIN_BRIGHTNESS,
  MAX_BRIGHTNESS,
  setBrightness,
  increaseBrightness,
  decreaseBrightness,
  resetBrightness,
} = useTabletBrightness()

const brightnessIcon = computed(() => {
  const percent = brightnessPercent.value
  if (percent <= 30) return 'mdi-brightness-4'
  if (percent <= 70) return 'mdi-brightness-5'
  return 'mdi-brightness-7'
})
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}

.v-btn--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
  border-color: rgb(var(--v-theme-primary));
}

/* Estilos para el botón de control de brillo en navbar */
.brightness-control-btn {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.brightness-control-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Asegurar que el ícono sea visible en el navbar verde */
.brightness-control-btn :deep(.v-icon) {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
</style>
