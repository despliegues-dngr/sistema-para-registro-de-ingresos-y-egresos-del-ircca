<template>
  <div class="d-flex flex-column align-center justify-center py-12">
    <v-icon size="64" color="grey-lighten-2" class="mb-4">{{ icon }}</v-icon>
    <h3 class="text-h6 text-grey-darken-1 mb-2">{{ title }}</h3>
    <p class="text-body-2 text-grey">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
  icon: string
}

defineProps<Props>()
</script>

<style scoped>
/* Componente sin estilos específicos, usa clases de Vuetify */
</style>
