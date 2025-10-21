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
    // Intentar login usando la lógica real del authStore
    // El bloqueo temporal ahora se maneja automáticamente en la BD
    await authStore.login(credentials.username, credentials.password)
    
    // Login exitoso
    message.value = MESSAGES.AUTH.LOGIN_SUCCESS
    
    // Pequeño delay para mostrar mensaje de éxito antes de redirección
    setTimeout(async () => {
      // Verificar si hay una ruta de redirección pendiente
      const redirect = router.currentRoute.value.query.redirect as string
      await router.push(redirect || ROUTES.DASHBOARD)
    }, 1000)

  } catch (error) {
    // Manejar diferentes tipos de error
    if (error instanceof Error) {
      message.value = error.message
    } else {
      console.error('Error durante el login:', error)
      message.value = MESSAGES.AUTH.CONNECTION_ERROR
    }
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
