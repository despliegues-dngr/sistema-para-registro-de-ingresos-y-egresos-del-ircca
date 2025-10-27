<template>
  <div>
    <!-- Header -->
    <v-card-title class="text-h5 pb-3 px-6 pt-6 d-flex align-center bg-primary">
      <v-icon color="white" class="mr-3" size="large">mdi-comment-quote-outline</v-icon>
      <span class="text-white">¡Tu opinión es importante!</span>
    </v-card-title>

    <v-divider />

    <!-- Mensaje introductorio -->
    <v-card-text class="px-6 pt-6 pb-0">
      <v-alert
        type="info"
        variant="tonal"
        density="comfortable"
      >
        <template #prepend>
          <v-icon>mdi-information-outline</v-icon>
        </template>
        Has realizado <strong>{{ totalRegistros }} registros</strong> en el sistema. 
        Ayúdanos a mejorar compartiendo tu experiencia (toma ~2 minutos).
      </v-alert>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalRegistros: number
}>()
</script>
