<template>
  <v-card-item class="bg-primary text-center py-6 px-4" style="border-bottom: 3px solid rgb(var(--v-theme-primary));">
    <div class="d-flex flex-column align-center">
      <div class="mb-4">
        <v-avatar size="64" class="institutional-icon">
          <v-icon size="36" color="white">{{ ICONS.AUTH.SECURITY }}</v-icon>
        </v-avatar>
      </div>
      
      <h1 class="text-h6 text-sm-h5 font-weight-bold text-white mb-2 text-center">
        {{ title }}
      </h1>
      <h2 class="text-subtitle-2 font-weight-medium text-blue-lighten-3 mb-1">
        {{ subtitle }}
      </h2>
      <p class="text-caption text-blue-lighten-4">
        {{ country }}
      </p>
    </div>
  </v-card-item>
</template>

<script setup lang="ts">
import { SYSTEM_INFO, ICONS } from '@/config/constants'

interface Props {
  title?: string
  subtitle?: string
  country?: string
}

withDefaults(defineProps<Props>(), {
  title: SYSTEM_INFO.NAME,
  subtitle: 'IRCCA',
  country: SYSTEM_INFO.FULL_NAME
})
</script>

<style scoped>
.institutional-icon {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
</style>
