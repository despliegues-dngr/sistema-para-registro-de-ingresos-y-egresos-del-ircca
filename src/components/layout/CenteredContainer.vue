<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <slot />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// Componente para centrar contenido - útil para Login y otros modales
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
