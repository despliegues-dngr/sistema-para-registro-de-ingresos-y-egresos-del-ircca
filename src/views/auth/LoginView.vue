<template>
  <AuthBackground>
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
  </AuthBackground>

  <!-- Dialog de Ayuda Modular -->
  <HelpDialog 
    v-model="showHelp"
    @close="showHelp = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MESSAGES, ROUTES } from '@/config/constants'

// Componentes modulares
import AuthBackground from '@/components/layout/AuthBackground.vue'
import LoginCard from '@/components/ui/LoginCard.vue'
import InstitutionalHeader from '@/components/layout/InstitutionalHeader.vue'
import LoginForm from '@/components/forms/LoginForm.vue'
import GovernmentFooter from '@/components/layout/GovernmentFooter.vue'
import HelpDialog from '@/components/ui/HelpDialog.vue'

// Composables
const router = useRouter()
const authStore = useAuthStore()

// Estado reactivo
const loading = ref(false)
const showHelp = ref(false)
const message = ref('')

// Métodos
const onSubmit = async (credentials: { username: string; password: string }) => {
  loading.value = true
  message.value = ''
  
  try {
    // Simular autenticación por ahora
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // TODO: Implementar autenticación real con authStore
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      message.value = MESSAGES.AUTH.LOGIN_SUCCESS
      // router.push(ROUTES.DASHBOARD) // TODO: Habilitar cuando se cree DashboardView
    } else {
      message.value = MESSAGES.AUTH.LOGIN_ERROR
    }
  } catch (error) {
    message.value = MESSAGES.AUTH.CONNECTION_ERROR
  } finally {
    loading.value = false
  }
}

const clearMessage = () => {
  message.value = ''
}

const handleRegister = () => {
  // TODO: Implementar navegación al registro de usuarios
  message.value = MESSAGES.SYSTEM.REGISTER_DEVELOPMENT
}
</script>

