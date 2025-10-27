<template>
  <div>
    <!-- Mensaje introductorio -->
    <v-card-text class="px-6 pt-4 pb-0">
      <v-alert
        type="info"
        variant="tonal"
        density="comfortable"
      >
        <template #prepend>
          <v-icon>mdi-information-outline</v-icon>
        </template>
        Has realizado <strong>{{ totalRegistros }} registros</strong> en el sistema.
        Ayúdanos a mejorar compartiendo tu experiencia (toma 2 minutos).
      </v-alert>

      <!-- Mensaje de anonimato -->
      <v-alert
        type="success"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        <template #prepend>
          <v-icon>mdi-shield-check</v-icon>
        </template>
        <strong>Esta encuesta es anónima.</strong> Tus respuestas nos ayudan a mejorar el sistema.
      </v-alert>
    </v-card-text>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalRegistros: number
}>()
</script>
