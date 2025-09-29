<template>
  <div class="auth-background" :class="{ 'auth-background--blurred': isBlurred }">
    <!-- Capa base del fondo -->
    <div class="background-overlay"></div>

    <!-- Rombos en esquinas (6 en total) -->
    <div class="corner-shapes">
      <!-- Esquina superior derecha (3 rombos) -->
      <div class="shape shape-large corner-tr-1"></div>
      <div class="shape shape-medium corner-tr-2"></div>
      <div class="shape shape-small corner-tr-3"></div>
      
      <!-- Esquina inferior izquierda (3 rombos) -->
      <div class="shape shape-large corner-bl-1"></div>
      <div class="shape shape-medium corner-bl-2"></div>
      <div class="shape shape-small corner-bl-3"></div>
    </div>

    <!-- Contenido principal - Flexible para todas las vistas -->
    <div class="content-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UI_CONFIG } from '@/config/constants'

// Estado reactivo para el blur
const isBlurred = ref(false)

// Eventos globales para controlar el blur
const handleDialogOpen = () => {
  isBlurred.value = true
}

const handleDialogClose = () => {
  isBlurred.value = false
}

onMounted(() => {
  // Escuchar eventos globales de diálogos
  window.addEventListener('dialog-opened', handleDialogOpen)
  window.addEventListener('dialog-closed', handleDialogClose)
})

onUnmounted(() => {
  window.removeEventListener('dialog-opened', handleDialogOpen)
  window.removeEventListener('dialog-closed', handleDialogClose)
})
</script>

<style scoped>
.auth-background {
  position: relative;
  min-height: 100vh;
  background: v-bind('UI_CONFIG.BACKGROUND.GRADIENT_PRIMARY');
  overflow: hidden;
  transition: filter 0.3s ease, transform 0.3s ease;
}

.auth-background--blurred {
  filter: blur(4px) saturate(0.3) contrast(0.8);  /* Blur + desaturar + reducir contraste */
  transform: scale(0.95);  /* Alejar ligeramente */
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: v-bind('UI_CONFIG.BACKGROUND.GRADIENT_OVERLAY');
  z-index: 1;
}

/* Contenedor de rombos en esquinas */
.corner-shapes {
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

/* Formas grandes */
.shape-large {
  width: 120px;
  height: 120px;
  background: v-bind('UI_CONFIG.BACKGROUND.SHAPE_FILL_PRIMARY');
  border: 2px solid v-bind('UI_CONFIG.BACKGROUND.SHAPE_BORDER_PRIMARY');
  transform: rotate(45deg);
}

/* Formas medianas */
.shape-medium {
  width: 80px;
  height: 80px;
  background: v-bind('UI_CONFIG.BACKGROUND.SHAPE_FILL_SECONDARY');
  border: 1px solid v-bind('UI_CONFIG.BACKGROUND.SHAPE_BORDER_SECONDARY');
  transform: rotate(45deg);
}

/* Formas pequeñas */
.shape-small {
  width: 45px;
  height: 45px;
  background: v-bind('UI_CONFIG.BACKGROUND.SHAPE_LIGHT');
  transform: rotate(45deg);
}

/* Posicionamiento en esquinas */
/* Esquina superior derecha (3 rombos) */
.corner-tr-1 {
  top: 8%;
  right: 8%;
}

.corner-tr-2 {
  top: 18%;
  right: 15%;
}

.corner-tr-3 {
  top: 12%;
  right: 22%;
}

/* Esquina inferior izquierda (3 rombos) */
.corner-bl-1 {
  bottom: 8%;
  left: 8%;
}

.corner-bl-2 {
  bottom: 18%;
  left: 15%;
}

.corner-bl-3 {
  bottom: 12%;
  left: 22%;
}

.content-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  width: 100%;
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
