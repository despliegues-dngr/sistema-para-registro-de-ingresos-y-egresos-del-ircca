<template>
  <div class="form-section">
    <v-expansion-panels v-model="internalExpanded" class="form-section-expansion">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div class="d-flex align-center">
            <v-icon size="20" :color="iconColor" class="mr-2">{{ icon }}</v-icon>
            <span class="text-h6">{{ title }}</span>
            <v-chip 
              :color="props.chipColor || 'error'" 
              variant="tonal" 
              size="small" 
              class="ml-2"
            >
              {{ props.chipLabel || 'Obligatorio' }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        
        <v-expansion-panel-text>
          <div class="mt-2">
            <slot />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  icon: string
  expanded?: number | undefined
  iconColor?: string
  chipLabel?: string
  chipColor?: string
}

interface Emits {
  'update:expanded': [value: number | undefined]
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  chipLabel: 'Obligatorio',
  chipColor: 'error'
})

const emit = defineEmits<Emits>()

// Computed para manejo bidireccional del estado expandido
const internalExpanded = computed({
  get: () => props.expanded,
  set: (value: number | undefined) => emit('update:expanded', value)
})

</script>

<style scoped>
.form-section {
  margin-bottom: 1.5rem;
}

/* Estilos consistentes para acordeones */
.form-section-expansion :deep(.v-expansion-panel-title) {
  min-height: 56px;
  font-weight: 500;
}

.form-section-expansion :deep(.v-expansion-panel) {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-left: 3px solid rgb(var(--v-theme-primary));
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  /* ⚡ OPTIMIZADO: Solo transicionar propiedades específicas, no 'all' */
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  /* ⚡ GPU acceleration */
  transform: translateZ(0);
  will-change: auto;
}

.form-section-expansion :deep(.v-expansion-panel:hover) {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* ⚡ NUEVO: Optimizar contenido interno para evitar reflows */
.form-section-expansion :deep(.v-expansion-panel-text__wrapper) {
  /* Usar contain para aislar reflows */
  contain: layout style paint;
}
</style>
