<template>
  <div class="dashboard-footer">
    <v-container fluid class="pa-4">
      <v-divider class="footer-divider mx-auto mb-3" style="width: 120px; opacity: 0.3"></v-divider>
      <p class="footer-text text-caption text-center mb-0">
        {{ SYSTEM_INFO.GOVERNMENT }}
      </p>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { SYSTEM_INFO } from '@/config/constants'
</script>

<style scoped>
.dashboard-footer {
  margin-top: auto;
  padding-top: 2rem;
}

.footer-text {
  color: rgb(var(--v-theme-on-primary));
}

.footer-divider {
  border-color: rgb(var(--v-theme-on-primary));
}
</style>
