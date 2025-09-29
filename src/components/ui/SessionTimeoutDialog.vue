<template>
  <v-dialog v-model="modelValue" max-width="500" persistent no-click-animation>
    <v-card class="session-timeout-card">
      <!-- Header de advertencia -->
      <v-card-title class="bg-warning pa-4">
        <div class="d-flex align-center">
          <v-icon size="24" color="white" class="mr-3">mdi-clock-alert</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Sesión por Expirar</h3>
            <p class="text-caption text-amber-lighten-4 mb-0">Sistema de Control de Accesos del IRCCA</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6 text-center">
        <v-icon size="64" color="warning" class="mb-4">mdi-timer</v-icon>

        <h4 class="text-h5 mb-3">Su sesión está por expirar</h4>

        <p class="text-body-1 mb-4 text-grey-darken-1">
          Por motivos de seguridad, su sesión se cerrará automáticamente por inactividad.
        </p>

        <div class="session-countdown mb-4">
          <div class="d-flex justify-center align-center">
            <v-icon size="20" color="error" class="mr-2">mdi-clock-outline</v-icon>
            <span class="text-h4 font-weight-bold text-error">
              {{ formattedTime }}
            </span>
          </div>
          <p class="text-caption text-grey mt-1">
            Tiempo restante antes del cierre automático
          </p>
        </div>

        <v-alert
          type="info"
          density="compact"
          variant="tonal"
          class="mb-4 text-start"
        >
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <strong>¿Desea continuar trabajando?</strong><br>
          Haga clic en "Extender Sesión" para continuar o "Cerrar Sesión" para salir del sistema de forma segura.
        </v-alert>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-btn
          color="error"
          variant="outlined"
          @click="$emit('logout')"
          class="flex-grow-1"
          :prepend-icon="'mdi-logout'"
        >
          Cerrar Sesión
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          @click="$emit('extend')"
          class="flex-grow-1 ml-3"
          :prepend-icon="'mdi-clock-plus'"
          elevation="1"
        >
          Extender Sesión
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatRemainingTime } from '@/composables/useSessionTimeout'

interface Props {
  modelValue: boolean
  remainingTime: number // en millisegundos
}

interface Emits {
  'update:modelValue': [value: boolean]
  extend: []
  logout: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed para v-model
const modelValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Computed
const formattedTime = computed(() => formatRemainingTime(props.remainingTime))
</script>

<style scoped>
.session-timeout-card {
  border-top: 3px solid rgb(var(--v-theme-warning));
}

.session-countdown {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}
</style>
