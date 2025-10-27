<template>
  <v-card elevation="2" class="destinos-manager-card">
    <v-card-title class="text-h6 pb-3 px-6 pt-6 d-flex align-center">
      <v-icon class="mr-3" color="success">mdi-map-marker-multiple</v-icon>
      Gestión de Destinos
    </v-card-title>

    <v-card-text class="px-6 pb-6">
      <!-- Texto informativo -->
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        <div class="text-body-2">
          <strong>Gestione los destinos disponibles en el sistema.</strong> Puede agregar, editar o eliminar empresas
          y ubicaciones dentro del IRCCA. Los cambios realizados estarán disponibles inmediatamente para que los
          operadores en el Puesto N° 1 los seleccionen al registrar el ingreso de personas al instituto.
        </div>
      </v-alert>

      <!-- Lista de destinos actuales -->
      <div class="mb-4">
        <v-chip
          v-for="(destino, index) in destinos"
          :key="index"
          class="ma-2"
          closable
          color="primary"
          variant="tonal"
          @click:close="removeDestino(index)"
        >
          {{ destino }}
        </v-chip>

        <div v-if="destinos.length === 0" class="text-center text-grey-darken-1 py-4">
          <v-icon size="48" color="grey">mdi-alert-circle-outline</v-icon>
          <p class="mt-2">No hay destinos configurados</p>
        </div>
      </div>

      <v-divider class="my-4" />

      <!-- Agregar nuevo destino + Guardar cambios en la misma línea -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="nuevoDestino"
            label="Nuevo Destino"
            prepend-inner-icon="mdi-plus-circle"
            variant="outlined"
            density="comfortable"
            :rules="destinoRules"
            :error-messages="errorMessages"
            @keyup.enter="addDestino"
            @input="errorMessages = []"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn
            color="success"
            block
            size="large"
            prepend-icon="mdi-plus"
            :disabled="!nuevoDestino || destinos.length >= 20"
            @click="addDestino"
          >
            Agregar
          </v-btn>
        </v-col>
        <v-col cols="12" md="3">
          <v-btn
            color="primary"
            block
            size="large"
            prepend-icon="mdi-content-save"
            :loading="saving"
            :disabled="destinos.length === 0"
            @click="guardarCambios"
          >
            Guardar Cambios
          </v-btn>
        </v-col>
      </v-row>

      <!-- Mensaje informativo -->
      <v-alert
        v-if="destinos.length >= 20"
        type="warning"
        variant="tonal"
        class="mt-4"
      >
        Has alcanzado el límite máximo de 20 destinos
      </v-alert>

      <!-- Mensaje de éxito -->
      <v-alert
        v-if="showSuccessMessage"
        type="success"
        variant="tonal"
        class="mt-4"
        closable
        @click:close="showSuccessMessage = false"
      >
        Destinos guardados exitosamente
      </v-alert>

      <!-- Mensaje de error -->
      <v-alert
        v-if="showErrorMessage"
        type="error"
        variant="tonal"
        class="mt-4"
        closable
        @click:close="showErrorMessage = false"
      >
        Error al guardar destinos. Intente nuevamente.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const destinos = ref<string[]>([...appStore.config.destinos])
const nuevoDestino = ref('')
const saving = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const errorMessages = ref<string[]>([])

const destinoRules = [
  (v: string) => !!v || 'El destino no puede estar vacío',
  (v: string) => v.length >= 2 || 'Mínimo 2 caracteres',
  (v: string) => v.length <= 50 || 'Máximo 50 caracteres',
]

const addDestino = () => {
  const trimmed = nuevoDestino.value.trim()

  // Validaciones
  if (!trimmed) {
    errorMessages.value = ['El destino no puede estar vacío']
    return
  }

  if (trimmed.length < 2) {
    errorMessages.value = ['Mínimo 2 caracteres']
    return
  }

  if (trimmed.length > 50) {
    errorMessages.value = ['Máximo 50 caracteres']
    return
  }

  if (destinos.value.includes(trimmed)) {
    errorMessages.value = ['Este destino ya existe']
    return
  }

  if (destinos.value.length >= 20) {
    errorMessages.value = ['Has alcanzado el límite máximo de 20 destinos']
    return
  }

  // Agregar destino
  destinos.value.push(trimmed)
  nuevoDestino.value = ''
  errorMessages.value = []
}

const removeDestino = (index: number) => {
  destinos.value.splice(index, 1)
}

const guardarCambios = async () => {
  saving.value = true
  showSuccessMessage.value = false
  showErrorMessage.value = false

  try {
    // ✅ Convertir a array plano antes de guardar
    const result = await appStore.updateDestinos([...destinos.value])

    if (result.success) {
      showSuccessMessage.value = true

      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 3000)
    } else {
      showErrorMessage.value = true
    }
  } catch (error) {
    console.error('Error al guardar destinos:', error)
    showErrorMessage.value = true
  } finally {
    saving.value = false
  }
}

// Cargar destinos al montar el componente
onMounted(() => {
  destinos.value = [...appStore.config.destinos]
})
</script>

<style scoped>
/* Consistencia con otras cards del supervisor */
.destinos-manager-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Efecto hover en chips */
.v-chip {
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>
