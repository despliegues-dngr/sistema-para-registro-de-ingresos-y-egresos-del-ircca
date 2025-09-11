<template>
  <v-card 
    class="mx-auto" 
    :max-width="UI_CONFIG.LOGIN_CARD_MAX_WIDTH"
  >
    <slot />
  </v-card>
</template>

<script setup lang="ts">
import { UI_CONFIG } from '@/config/constants'
// Login card using Vuetify defaults from theme configuration
</script>
