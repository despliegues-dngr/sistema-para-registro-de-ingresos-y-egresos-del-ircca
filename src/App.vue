<script setup lang="ts">
// App principal - Estructura limpia según arquitectura documentada
// Importamos AuthBackground para aplicar el fondo gubernamental a toda la aplicación
import AuthBackground from '@/components/layout/AuthBackground.vue'
</script>

<template>
  <v-app>
    <v-main>
      <!-- AuthBackground envuelve toda la aplicación para consistencia visual gubernamental -->
      <AuthBackground>
        <router-view />
      </AuthBackground>
    </v-main>
  </v-app>
</template>

