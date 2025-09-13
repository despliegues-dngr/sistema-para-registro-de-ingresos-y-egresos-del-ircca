<template>
  <div class="auth-background">
    <!-- Capa base del fondo -->
    <div class="background-overlay"></div>

    <!-- Formas geométricas distribuidas por toda la pantalla -->
    <div class="geometric-shapes">
      <!-- Formas grandes -->
      <div class="shape shape-large shape-1"></div>
      <div class="shape shape-large shape-2"></div>
      <div class="shape shape-large shape-3"></div>

      <!-- Formas medianas -->
      <div class="shape shape-medium shape-4"></div>
      <div class="shape shape-medium shape-5"></div>
      <div class="shape shape-medium shape-6"></div>
      <div class="shape shape-medium shape-7"></div>

      <!-- Formas pequeñas -->
      <div class="shape shape-small shape-8"></div>
      <div class="shape shape-small shape-9"></div>
      <div class="shape shape-small shape-10"></div>
      <div class="shape shape-small shape-11"></div>
      <div class="shape shape-small shape-12"></div>

      <!-- Formas con borde únicamente -->
      <div class="shape shape-outline shape-13"></div>
      <div class="shape shape-outline shape-14"></div>
      <div class="shape shape-outline shape-15"></div>
      <div class="shape shape-outline shape-16"></div>
    </div>

    <!-- Contenido principal -->
    <v-container fluid class="fill-height content-container">
      <v-row justify="center" align="center" class="fill-height">
        <v-col cols="12" sm="8" md="6" lg="4" xl="3">
          <slot />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { UI_CONFIG } from '@/config/constants'
// Authentication layout with institutional background design
</script>

<style scoped>
.auth-background {
  position: relative;
  min-height: 100vh;
  background: v-bind('UI_CONFIG.BACKGROUND.GRADIENT_PRIMARY');
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: v-bind('UI_CONFIG.BACKGROUND.GRADIENT_OVERLAY');
  z-index: 1;
  animation: breathe 15s ease-in-out infinite;
}

/* Contenedor de formas geométricas */
.geometric-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
}

/* Estilos base para todas las formas */
.shape {
  position: absolute;
  transform-origin: center;
  transition: all 0.3s ease;
}

/* Formas grandes rellenas */
.shape-large {
  width: 140px;
  height: 140px;
  background: v-bind('UI_CONFIG.BACKGROUND.SHAPE_FILL_PRIMARY');
  border: 2px solid v-bind('UI_CONFIG.BACKGROUND.SHAPE_BORDER_PRIMARY');
  transform: rotate(45deg);
}

/* Formas medianas rellenas */
.shape-medium {
  width: 80px;
  height: 80px;
  background: v-bind('UI_CONFIG.BACKGROUND.SHAPE_FILL_SECONDARY');
  border: 1px solid v-bind('UI_CONFIG.BACKGROUND.SHAPE_BORDER_SECONDARY');
  transform: rotate(45deg);
}

/* Formas pequeñas rellenas */
.shape-small {
  width: 45px;
  height: 45px;
  background: v-bind('UI_CONFIG.BACKGROUND.SHAPE_LIGHT');
  transform: rotate(45deg);
}

/* Formas solo con borde */
.shape-outline {
  width: 100px;
  height: 100px;
  background: transparent;
  border: 2px solid v-bind('UI_CONFIG.BACKGROUND.SHAPE_ACCENT');
  transform: rotate(45deg);
}

/* Posicionamiento específico de cada forma */
/* Formas grandes */
.shape-1 {
  top: 5%;
  left: 10%;
  animation: float-slow 20s ease-in-out infinite;
}

.shape-2 {
  top: 15%;
  right: 8%;
  animation: float-slow 18s ease-in-out infinite 3s;
}

.shape-3 {
  bottom: 20%;
  left: 15%;
  animation: float-slow 22s ease-in-out infinite 6s;
}

/* Formas medianas */
.shape-4 {
  top: 30%;
  left: 5%;
  animation: float-medium 16s ease-in-out infinite 2s;
}

.shape-5 {
  top: 10%;
  left: 50%;
  animation: float-medium 14s ease-in-out infinite 5s;
}

.shape-6 {
  bottom: 35%;
  right: 12%;
  animation: float-medium 17s ease-in-out infinite 1s;
}

.shape-7 {
  bottom: 10%;
  right: 40%;
  animation: float-medium 19s ease-in-out infinite 4s;
}

/* Formas pequeñas */
.shape-8 {
  top: 25%;
  right: 25%;
  animation: float-fast 12s ease-in-out infinite;
}

.shape-9 {
  top: 60%;
  left: 30%;
  animation: float-fast 10s ease-in-out infinite 2s;
}

.shape-10 {
  bottom: 45%;
  left: 8%;
  animation: float-fast 13s ease-in-out infinite 4s;
}

.shape-11 {
  top: 45%;
  right: 5%;
  animation: float-fast 11s ease-in-out infinite 1s;
}

.shape-12 {
  bottom: 5%;
  left: 45%;
  animation: float-fast 9s ease-in-out infinite 3s;
}

/* Formas con borde */
.shape-13 {
  top: 8%;
  left: 35%;
  animation: pulse-outline 15s ease-in-out infinite;
}

.shape-14 {
  top: 50%;
  right: 20%;
  animation: pulse-outline 18s ease-in-out infinite 4s;
}

.shape-15 {
  bottom: 25%;
  right: 35%;
  animation: pulse-outline 16s ease-in-out infinite 2s;
}

.shape-16 {
  top: 35%;
  left: 70%;
  animation: pulse-outline 14s ease-in-out infinite 6s;
}

.content-container {
  position: relative;
  z-index: 10;
}

.fill-height {
  min-height: 100vh;
}

/* Animaciones sutiles */
@keyframes breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

@keyframes float-slow {
  0%,
  100% {
    transform: rotate(45deg) translateY(0px) scale(1);
  }
  50% {
    transform: rotate(45deg) translateY(-8px) scale(1.02);
  }
}

@keyframes float-medium {
  0%,
  100% {
    transform: rotate(45deg) translateY(0px);
  }
  50% {
    transform: rotate(45deg) translateY(-6px);
  }
}

@keyframes float-fast {
  0%,
  100% {
    transform: rotate(45deg) translateY(0px);
  }
  50% {
    transform: rotate(45deg) translateY(-4px);
  }
}

@keyframes pulse-outline {
  0%,
  100% {
    transform: rotate(45deg) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: rotate(45deg) scale(1.1);
    opacity: 0.8;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .shape-large {
    width: 120px;
    height: 120px;
  }

  .shape-medium {
    width: 70px;
    height: 70px;
  }

  .shape-outline {
    width: 85px;
    height: 85px;
  }
}

@media (max-width: 768px) {
  .shape-large {
    width: 100px;
    height: 100px;
  }

  .shape-medium {
    width: 60px;
    height: 60px;
  }

  .shape-small {
    width: 35px;
    height: 35px;
  }

  .shape-outline {
    width: 70px;
    height: 70px;
  }

  /* Ocultar algunas formas en móviles para no saturar */
  .shape-12,
  .shape-16 {
    display: none;
  }
}

@media (max-width: 480px) {
  .geometric-shapes {
    opacity: 0.7;
  }

  .shape-large {
    width: 80px;
    height: 80px;
  }

  .shape-medium {
    width: 50px;
    height: 50px;
  }

  .shape-small {
    width: 30px;
    height: 30px;
  }

  .shape-outline {
    width: 60px;
    height: 60px;
  }

  /* Ocultar más formas en pantallas muy pequeñas */
  .shape-10,
  .shape-11,
  .shape-14,
  .shape-15 {
    display: none;
  }
}
</style>
