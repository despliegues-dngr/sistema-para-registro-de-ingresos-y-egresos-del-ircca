<template>
  <v-card elevation="2" class="arco-export-card">
    <v-card-title class="bg-info pa-4">
      <div class="d-flex align-center">
        <v-icon size="24" color="white" class="mr-3">mdi-shield-account</v-icon>
        <div>
          <h3 class="text-h6 text-white mb-0">Derechos ARCO - Exportación de Datos</h3>
          <p class="text-caption text-blue-lighten-4 mb-0">
            Responder solicitudes de Acceso según Ley 18.331
          </p>
        </div>
      </div>
    </v-card-title>

    <v-card-text class="pa-6">
      <!-- Información sobre el proceso -->
      <v-alert
        type="info"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        <div class="text-body-2">
          <strong>Derecho de Acceso:</strong> Permite al ciudadano conocer qué datos personales
          almacena el sistema. Este reporte incluye todos los registros de ingreso/egreso y
          datos en personas conocidas.
        </div>
      </v-alert>

      <!-- Formulario de búsqueda con autocomplete -->
      <v-row>
        <v-col cols="12" md="8">
          <v-autocomplete
            v-model="cedula"
            v-model:search="searchText"
            :items="sugerenciasFormateadas"
            :loading="buscandoCedula"
            item-title="displayText"
            item-value="searchText"
            label="Documento del Solicitante"
            placeholder="Comienza a escribir el documento..."
            prepend-inner-icon="mdi-card-account-details"
            variant="outlined"
            density="comfortable"
            clearable
            no-filter
            :error-messages="errorMessage"
            @update:search="onSearchUpdate"
            @update:model-value="onCedulaSelect"
            @keyup.enter="buscarDatos"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-avatar color="primary" size="32">
                    <v-icon size="18" color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>
                  <span class="font-weight-medium">{{ item.raw.persona.nombre }} {{ item.raw.persona.apellido }}</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  C.I: {{ item.raw.persona.cedula }}
                </v-list-item-subtitle>
              </v-list-item>
            </template>
            <template #no-data>
              <v-list-item>
                <v-list-item-title class="text-grey">
                  {{ searchText.length > 0 ? 'No se encontraron coincidencias' : 'Comienza a escribir...' }}
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center">
          <v-btn
            color="primary"
            size="large"
            block
            :loading="isLoading"
            :disabled="!cedula || cedula.length !== 8"
            @click="buscarDatos"
          >
            <v-icon class="mr-2">mdi-magnify</v-icon>
            Buscar Datos
          </v-btn>
        </v-col>
      </v-row>

      <!-- Resultados -->
      <v-expand-transition>
        <div v-if="reporte" class="mt-6">
          <v-divider class="mb-4" />

          <!-- Resumen de datos encontrados -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="bg-grey-lighten-4 text-subtitle-1">
              <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
              Datos Encontrados
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="12" md="6">
                  <div class="text-body-2 mb-2">
                    <strong>Documento:</strong> {{ reporte.datosPersonales.cedula }}
                  </div>
                  <div class="text-body-2 mb-2">
                    <strong>Nombre:</strong> {{ reporte.datosPersonales.nombreCompleto }}
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-body-2 mb-2">
                    <strong>Total registros:</strong>
                    <v-chip size="small" color="primary" class="ml-2">
                      {{ reporte.datosPersonales.registrosEncontrados }}
                    </v-chip>
                  </div>
                  <div class="text-body-2 mb-2">
                    <strong>Ingresos:</strong> {{ reporte.registrosIngreso.length }} |
                    <strong>Salidas:</strong> {{ reporte.registrosSalida.length }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Botones de exportación -->
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1 bg-grey-lighten-4">
              <v-icon class="mr-2">mdi-download</v-icon>
              Exportar Reporte
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-btn
                    block
                    color="success"
                    variant="outlined"
                    prepend-icon="mdi-file-document-outline"
                    @click="exportarTexto"
                  >
                    Texto (.txt)
                  </v-btn>
                  <div class="text-caption text-grey-darken-1 mt-1 text-center">
                    Formato legible para email
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn
                    block
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-table"
                    @click="exportarCSV"
                  >
                    Excel (.csv)
                  </v-btn>
                  <div class="text-caption text-grey-darken-1 mt-1 text-center">
                    Tabla de registros
                  </div>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn
                    block
                    color="info"
                    variant="outlined"
                    prepend-icon="mdi-code-json"
                    @click="exportarJSON"
                  >
                    JSON (.json)
                  </v-btn>
                  <div class="text-caption text-grey-darken-1 mt-1 text-center">
                    Formato técnico completo
                  </div>
                </v-col>
              </v-row>

              <!-- Vista previa del reporte en texto -->
              <v-expand-transition>
                <div v-if="mostrarVistaPrevia" class="mt-4">
                  <v-divider class="mb-3" />
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-subtitle-2">Vista Previa del Reporte:</span>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="mostrarVistaPrevia = false"
                    >
                      Ocultar
                    </v-btn>
                  </div>
                  <v-sheet
                    class="pa-4 bg-grey-lighten-5 overflow-auto"
                    style="max-height: 400px"
                  >
                    <pre class="text-body-2" style="white-space: pre-wrap; font-family: monospace;">{{ vistaPrevia }}</pre>
                  </v-sheet>
                </div>
              </v-expand-transition>

              <v-btn
                v-if="!mostrarVistaPrevia"
                block
                variant="text"
                color="grey-darken-1"
                class="mt-3"
                @click="mostrarVistaPrevia = true"
              >
                <v-icon class="mr-2">mdi-eye</v-icon>
                Ver Vista Previa del Reporte
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Botón para nueva búsqueda -->
          <v-btn
            block
            variant="outlined"
            color="grey-darken-1"
            class="mt-4"
            @click="limpiarBusqueda"
          >
            <v-icon class="mr-2">mdi-refresh</v-icon>
            Nueva Búsqueda
          </v-btn>
        </div>
      </v-expand-transition>

      <!-- Estado: Sin resultados -->
      <v-expand-transition>
        <v-alert
          v-if="sinResultados"
          type="warning"
          variant="tonal"
          class="mt-4"
        >
          <div class="text-body-2">
            <strong>No se encontraron datos</strong> para el documento <strong>{{ cedula }}</strong>.
            <br />
            Esto puede significar que la persona nunca ha ingresado al predio del IRCCA.
          </div>
        </v-alert>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useArcoDataExport, type UserDataReport } from '@/composables/useArcoDataExport'
import { useAuthStore } from '@/stores/auth'
import { usePersonaAutocomplete } from '@/composables/usePersonaAutocomplete'
import { useAuditStore } from '@/stores/audit'

// Composables
const arcoExport = useArcoDataExport()
const authStore = useAuthStore()
const auditStore = useAuditStore()

// Autocomplete de personas
const {
  searchText,
  sugerenciasFormateadas,
  buscandoCedula,
  onSearchUpdate
} = usePersonaAutocomplete()

// Estado
const cedula = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const reporte = ref<UserDataReport | null>(null)
const sinResultados = ref(false)
const mostrarVistaPrevia = ref(false)
const vistaPrevia = ref('')

/**
 * Busca todos los datos del usuario por cédula
 */
async function buscarDatos() {
  if (!cedula.value || cedula.value.length !== 8) {
    errorMessage.value = 'Ingrese una documento válida de 8 dígitos'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  reporte.value = null
  sinResultados.value = false
  mostrarVistaPrevia.value = false

  try {
    const userId = authStore.user?.id || 'admin'
    const reporteGenerado = await arcoExport.recopilarDatosUsuario(cedula.value, userId, 'acceso')

    // Verificar si hay datos
    if (reporteGenerado.datosPersonales.registrosEncontrados === 0) {
      sinResultados.value = true
    } else {
      reporte.value = reporteGenerado
      vistaPrevia.value = arcoExport.generarReporteTexto(reporteGenerado)
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Error al buscar datos del usuario'
    console.error('Error en búsqueda ARCO:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Limpia la búsqueda actual
 */
function limpiarBusqueda() {
  cedula.value = ''
  searchText.value = ''
  reporte.value = null
  sinResultados.value = false
  errorMessage.value = ''
  mostrarVistaPrevia.value = false
}

/**
 * Maneja selección de cédula del autocomplete
 */
function onCedulaSelect(value: string) {
  cedula.value = value
  errorMessage.value = ''
}

/**
 * Registra la exportación en logs de auditoría
 */
async function registrarExportacion(formato: 'TXT' | 'CSV' | 'JSON') {
  try {
    if (!authStore.user) return

    await auditStore.logEvent({
      userId: authStore.user.id,
      username: authStore.user.username,
      eventType: 'data_operation',
      action: 'arco_data_export',
      details: {
        cedulaSolicitante: cedula.value.substring(0, 4) + '****', // Parcialmente enmascarada
        formato: formato,
        registrosIncluidos: reporte.value?.datosPersonales.registrosEncontrados || 0,
        tipoSolicitud: 'acceso',
        role: authStore.user.role
      },
      sessionId: crypto.randomUUID() // Generar sessionId único para esta operación
    })
  } catch (error) {
    console.error('Error al registrar exportación en auditoría:', error)
    // No bloqueamos la exportación si falla el log
  }
}

/**
 * Exporta a texto
 */
function exportarTexto() {
  if (!reporte.value) return
  arcoExport.exportarTexto(reporte.value)
  registrarExportacion('TXT')
}

/**
 * Exporta a CSV
 */
function exportarCSV() {
  if (!reporte.value) return
  arcoExport.exportarCSV(reporte.value)
  registrarExportacion('CSV')
}

/**
 * Exporta a JSON
 */
function exportarJSON() {
  if (!reporte.value) return
  arcoExport.exportarJSON(reporte.value)
  registrarExportacion('JSON')
}
</script>

<style scoped>
.arco-export-card {
  max-width: 100%;
}

pre {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
