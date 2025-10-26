<template>
  <div class="persona-info-card">
    <!-- Formato Texto Limpio -->
    <div class="info-row">
      <span class="info-label">👤 Persona:</span>
      <span class="info-value">{{ persona.nombre }} {{ persona.apellido }}</span>
    </div>

    <div class="info-row">
      <span class="info-label">🆔 Documento:</span>
      <span class="info-value">{{ persona.cedula }}</span>
    </div>

    <div class="info-row">
      <span class="info-label">🏢 Destino:</span>
      <span class="info-value">{{ persona.destino }}</span>
    </div>

    <div class="info-row">
      <span class="info-label">⏱️ Tiempo:</span>
      <span class="info-value">{{ tiempoEstadia }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PersonaDentro } from '@/stores/registro'

interface Props {
  persona: PersonaDentro
}

const props = defineProps<Props>()

const tiempoEstadia = computed(() => {
  const ahora = new Date()
  const ingreso = new Date(props.persona.ingresoTimestamp)
  const diferenciaMs = ahora.getTime() - ingreso.getTime()
  const horas = Math.floor(diferenciaMs / (1000 * 60 * 60))
  const minutos = Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60))

  return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`
})
</script>

<style scoped>
.persona-info-card {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  min-width: 120px;
}

.info-value {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
}
</style>
