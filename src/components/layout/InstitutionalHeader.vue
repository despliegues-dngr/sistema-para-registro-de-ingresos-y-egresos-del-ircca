<template>
  <v-card-item
    class="bg-primary text-center py-6 px-4"
    style="border-bottom: 3px solid rgba(var(--v-theme-on-primary-rgb), 0.2)"
  >
    <div class="d-flex flex-column align-center">
      <div class="mb-4 logo-container">
        <v-img
          src="/icons/iconPWA.png"
          alt="Logo IRCCA"
          width="80"
          height="80"
          class="institutional-icon"
        />
        <div class="shine-effect"></div>
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
.logo-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
}

.institutional-icon {
  position: relative;
  z-index: 1;
}

/* Efecto de brillo que pasa sobre el logo */
.shine-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 30px;
  height: 200%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(25deg);
  animation: shine 3s infinite;
  animation-delay: 1s;
  z-index: 2;
  pointer-events: none;
}

@keyframes shine {
  0% {
    left: -50%;
  }
  80% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}

/* Hover effect - brillo más rápido */
.logo-container:hover .shine-effect {
  animation: shine 1.5s infinite;
  animation-delay: 0s;
}
</style>
