<template>
  <v-card-item
    class="bg-primary text-center py-6 px-4"
    style="border-bottom: 3px solid rgba(var(--v-theme-on-primary-rgb), 0.2)"
  >
    <div class="d-flex flex-column align-center">
      <div class="mb-4">
        <v-img
          src="/icons/iconPWA.png"
          alt="Logo IRCCA"
          width="80"
          height="80"
          class="institutional-icon"
        />
      </div>

      <h1 class="text-h6 text-sm-h5 font-weight-bold text-white mb-2 text-center">
        {{ title }}
      </h1>
      <p class="text-caption text-blue-lighten-4">
        {{ country }}
      </p>
    </div>
  </v-card-item>
</template>

<script setup lang="ts">
import { SYSTEM_INFO } from '@/config/constants'

interface Props {
  title?: string
  country?: string
}

withDefaults(defineProps<Props>(), {
  title: SYSTEM_INFO.NAME,
  country: SYSTEM_INFO.FULL_NAME,
})
</script>

<style scoped>
/* Estilos para el logo institucional */
.institutional-icon {
  display: block;
}
</style>
