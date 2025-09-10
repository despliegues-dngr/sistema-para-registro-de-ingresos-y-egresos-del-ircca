<template>
  <v-app>
    <v-main class="login-background">
      <v-container fluid class="fill-height">
        <v-row justify="center" align="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">
            
            <!-- Tarjeta Principal de Login -->
            <v-card 
              class="login-card mx-auto" 
              elevation="12"
              rounded="xl"
            >
              
              <!-- Header Institucional -->
              <div class="login-header">
                <div class="institutional-badge">
                  <v-avatar size="64" class="mb-3">
                    <v-icon size="40" color="white">mdi-shield-account</v-icon>
                  </v-avatar>
                  <h1 class="institutional-title">IRCCA</h1>
                  <p class="institutional-subtitle">
                    República Oriental del Uruguay
                  </p>
                </div>
              </div>

              <!-- Título del Sistema -->
              <v-card-text class="text-center pt-6 pb-2">
                <h2 class="text-h5 font-weight-bold text-primary mb-2">
                  Sistema de Control de Acceso
                </h2>
                <p class="text-body-2 text-medium-emphasis">
                  Ingrese sus credenciales para acceder
                </p>
              </v-card-text>

              <!-- Formulario de Login -->
              <v-card-text class="pa-8">
                <v-form 
                  ref="loginForm" 
                  v-model="formValid" 
                  @submit.prevent="handleLogin"
                >
                  
                  <!-- Alert de Estado -->
                  <v-alert
                    v-if="errorMessage"
                    :type="errorMessage.includes('exitoso') ? 'success' : 'error'"
                    variant="tonal"
                    class="mb-6"
                    closable
                    @click:close="errorMessage = ''"
                  >
                    {{ errorMessage }}
                  </v-alert>

                  <!-- Campo Usuario -->
                  <v-text-field
                    v-model="credentials.username"
                    label="Usuario"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    :rules="usernameRules"
                    :disabled="loading"
                    autocomplete="username"
                    autofocus
                  />

                  <!-- Campo Contraseña -->
                  <v-text-field
                    v-model="credentials.password"
                    :type="showPassword ? 'text' : 'password'"
                    label="Contraseña"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="outlined"
                    density="comfortable"
                    class="mb-6"
                    :rules="passwordRules"
                    :disabled="loading"
                    autocomplete="current-password"
                    @click:append-inner="showPassword = !showPassword"
                  />

                  <!-- Botón de Login -->
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    :disabled="!formValid"
                    class="mb-4"
                    rounded="lg"
                  >
                    <v-icon left class="mr-2">mdi-login</v-icon>
                    Ingresar al Sistema
                  </v-btn>
                </v-form>
              </v-card-text>

              <!-- Footer -->
              <v-card-actions class="pa-6 pt-0">
                <v-spacer />
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
                  @click="showHelp = true"
                >
                  ¿Necesita ayuda?
                </v-btn>
                <v-spacer />
              </v-card-actions>
              
            </v-card>

            <!-- Información de Contacto -->
            <div class="contact-info text-center mt-6">
              <p class="text-caption text-medium-emphasis">
                Soporte técnico: gr-depto.infoygc@minterior.gub.uy
              </p>
            </div>

          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Dialog de Ayuda -->
    <v-dialog v-model="showHelp" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">
          <v-icon left class="mr-2">mdi-help-circle</v-icon>
          Ayuda de Acceso
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="mb-4">
            Para acceder al sistema, utilice las credenciales proporcionadas 
            por el administrador del sistema.
          </p>
          
          <h3 class="text-subtitle-1 mb-3">En caso de problemas:</h3>
          <ul class="text-body-2">
            <li>Verifique usuario y contraseña</li>
            <li>Asegúrese de que Caps Lock esté desactivado</li>
            <li>Contacte al administrador si persisten los problemas</li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="primary" 
            variant="text" 
            @click="showHelp = false"
          >
            Entendido
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Estado reactivo
const formValid = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const showHelp = ref(false)
const errorMessage = ref('')

// Datos del formulario
const credentials = ref({
  username: '',
  password: ''
})

// Reglas de validación
const usernameRules = [
  (v: string) => !!v || 'El usuario es requerido',
  (v: string) => v.length >= 3 || 'El usuario debe tener al menos 3 caracteres'
]

const passwordRules = [
  (v: string) => !!v || 'La contraseña es requerida',
  (v: string) => v.length >= 4 || 'La contraseña debe tener al menos 4 caracteres'
]

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Métodos
const handleLogin = async () => {
  if (!formValid.value) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    // Simular autenticación por ahora
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Implementar autenticación real con authStore
    if (credentials.value.username === 'admin' && credentials.value.password === 'admin') {
      // Por ahora redirigir al login hasta crear dashboard
      errorMessage.value = 'Login exitoso! Dashboard en desarrollo...'
      // router.push('/dashboard') // TODO: Habilitar cuando se cree DashboardView
    } else {
      errorMessage.value = 'Credenciales incorrectas. Verifique usuario y contraseña.'
    }
  } catch (error) {
    errorMessage.value = 'Error de conexión. Intente nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-background {
  background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%);
  min-height: 100vh;
  position: relative;
}

.login-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 450px;
  animation: slideInUp 0.6s ease-out;
}

.login-header {
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.login-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E") repeat;
}

.institutional-badge {
  position: relative;
  z-index: 1;
}

.institutional-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 0.1em;
}

.institutional-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
}

.contact-info {
  opacity: 0.7;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

/* Animaciones */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.7;
  }
}

/* Responsive */
@media (max-width: 600px) {
  .login-card {
    margin: 1rem;
    max-width: none;
  }
  
  .login-header {
    padding: 1.5rem;
  }
  
  .institutional-title {
    font-size: 1.25rem;
  }
  
  .institutional-subtitle {
    font-size: 0.8rem;
  }
}

/* Estados hover para elementos interactivos */
.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.v-text-field:hover {
  transition: all 0.3s ease;
}
</style>
