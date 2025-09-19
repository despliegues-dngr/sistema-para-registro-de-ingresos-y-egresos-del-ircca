<template>
  <CenteredContainer>
    <LoginCard>
      <InstitutionalHeader />

      <v-card-text class="pa-8">
        <LoginForm
          :loading="loading"
          :message="message"
          @submit="onSubmit"
          @clear-message="clearMessage"
        />
      </v-card-text>

      <GovernmentFooter @help="showHelp = true" @register="handleRegister" />
    </LoginCard>
  </CenteredContainer>

  <!-- Dialog de Ayuda Modular -->
  <HelpDialog v-model="showHelp" @close="showHelp = false" />

  <!-- Dialog de Registro Modular -->
  <RegistrationDialog 
    v-model="showRegister" 
    @close="showRegister = false"
    @success="onRegistrationSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MESSAGES, ROUTES } from '@/config/constants'

// Componentes modulares
import CenteredContainer from '@/components/layout/CenteredContainer.vue'
import LoginCard from '@/components/ui/LoginCard.vue'
import InstitutionalHeader from '@/components/layout/InstitutionalHeader.vue'
import LoginForm from '@/components/forms/LoginForm.vue'
import GovernmentFooter from '@/components/layout/GovernmentFooter.vue'
import HelpDialog from '@/components/ui/HelpDialog.vue'
import RegistrationDialog from '@/components/ui/RegistrationDialog.vue'

// Composables
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Estado reactivo
const loading = ref(false)
const showHelp = ref(false)
const showRegister = ref(false)
const message = ref('')

// Métodos
const onSubmit = async (credentials: { username: string; password: string }) => {
  loading.value = true
  message.value = ''

  try {
    // Verificar si aún puede intentar login
    if (!authStore.canAttemptLogin) {
      message.value = MESSAGES.AUTH.ACCOUNT_LOCKED
      return
    }

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Lógica de autenticación simplificada para desarrollo
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      // Login exitoso - crear usuario y actualizar store
      const userData = {
        id: '1',
        username: credentials.username,
        role: 'admin' as const,
        lastLogin: new Date()
      }
      
      authStore.login(userData)
      message.value = MESSAGES.AUTH.LOGIN_SUCCESS
      
      // Redirigir al dashboard
      await router.push(ROUTES.DASHBOARD)
    } else {
      // Login fallido - incrementar intentos
      authStore.incrementLoginAttempts()
      message.value = MESSAGES.AUTH.LOGIN_ERROR
    }
  } catch (error) {
    console.error('Error durante el login:', error)
    message.value = MESSAGES.AUTH.CONNECTION_ERROR
  } finally {
    loading.value = false
  }
}

const clearMessage = () => {
  message.value = ''
}

const handleRegister = () => {
  showRegister.value = true
}

const onRegistrationSuccess = (successMessage: string) => {
  message.value = successMessage
  showRegister.value = false
}
</script>
