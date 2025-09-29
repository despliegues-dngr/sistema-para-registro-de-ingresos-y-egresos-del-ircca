<template>
  <v-card class="test-panel ma-4" variant="outlined">
    <v-card-title class="d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-test-tube</v-icon>
      Panel de Pruebas - Cifrado/Descifrado
      <v-spacer />
      <v-chip 
        :color="sistemaFunciona ? 'success' : 'warning'" 
        variant="tonal"
        size="small"
      >
        {{ sistemaFunciona ? 'Sistema OK' : 'Pendiente' }}
      </v-chip>
    </v-card-title>

    <v-card-text>
      <!-- Estado del sistema -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card variant="tonal" color="info">
            <v-card-text>
              <div class="text-h6 mb-2">📊 Estado del Sistema</div>
              <div class="text-body-2">
                <div><strong>Registros totales:</strong> {{ registroStore.totalRegistros }}</div>
                <div><strong>Personas dentro:</strong> {{ registroStore.personasDentro.length }}</div>
                <div><strong>Última sincronización:</strong> {{ ultimaSinc }}</div>
                <div><strong>Cargando:</strong> {{ registroStore.loading ? 'Sí' : 'No' }}</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="tonal" :color="resultadoPrueba ? 'success' : 'warning'">
            <v-card-text>
              <div class="text-h6 mb-2">🧪 Última Prueba</div>
              <div class="text-body-2">
                <div v-if="resultadoPrueba">
                  <div><strong>Estado:</strong> {{ resultadoPrueba.success ? '✅ Exitosa' : '❌ Falló' }}</div>
                  <div v-if="resultadoPrueba.success">
                    <div><strong>Registro ID:</strong> {{ String(resultadoPrueba.registroId || '').substring(0, 8) }}...</div>
                    <div><strong>Personas detectadas:</strong> {{ resultadoPrueba.personasDentro }}</div>
                  </div>
                  <div v-else>
                    <div class="text-error"><strong>Error:</strong> {{ resultadoPrueba.error }}</div>
                  </div>
                </div>
                <div v-else class="text-medium-emphasis">
                  Ninguna prueba ejecutada aún
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Controles de prueba -->
      <v-divider class="my-4" />
      
      <div class="text-h6 mb-4">🎯 Pruebas Disponibles</div>
      
      <v-row>
        <v-col cols="12" md="6">
          <v-btn 
            color="primary" 
            variant="elevated" 
            size="large"
            block
            :loading="ejecutandoPrueba"
            @click="ejecutarPruebaCompleta"
          >
            <v-icon class="mr-2">mdi-play-circle</v-icon>
            Prueba Completa con Acompañantes
          </v-btn>
          <div class="text-caption mt-2 text-center">
            Registra un caso completo (titular + 3 acompañantes + vehículo)
          </div>
        </v-col>

        <v-col cols="12" md="6">
          <v-btn 
            color="secondary" 
            variant="elevated" 
            size="large"
            block
            :loading="ejecutandoPrueba"
            @click="ejecutarPruebaRendimiento"
          >
            <v-icon class="mr-2">mdi-speedometer</v-icon>
            Prueba de Rendimiento (5 registros)
          </v-btn>
          <div class="text-caption mt-2 text-center">
            Registra múltiples casos para probar velocidad
          </div>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-btn 
            color="info" 
            variant="outlined" 
            block
            :loading="ejecutandoPrueba"
            @click="cargarDatosReales"
          >
            <v-icon class="mr-2">mdi-database-sync</v-icon>
            Cargar Datos Reales de IndexedDB
          </v-btn>
        </v-col>

        <v-col cols="12" md="6">
          <v-btn 
            color="warning" 
            variant="outlined" 
            block
            :loading="ejecutandoPrueba"
            @click="limpiarDatos"
          >
            <v-icon class="mr-2">mdi-broom</v-icon>
            Limpiar Datos de Prueba
          </v-btn>
        </v-col>
      </v-row>

      <!-- Log de consola -->
      <v-divider class="my-4" />
      
      <div class="d-flex align-center mb-2">
        <div class="text-h6">📝 Log de Ejecución</div>
        <v-spacer />
        <v-btn 
          size="small" 
          variant="text" 
          @click="logMessages = []"
        >
          Limpiar Log
        </v-btn>
      </div>
      
      <v-card variant="outlined" class="log-container">
        <v-card-text class="pa-2">
          <div 
            v-if="logMessages.length === 0" 
            class="text-center text-medium-emphasis py-4"
          >
            Los mensajes de ejecución aparecerán aquí...
          </div>
          <div 
            v-for="(msg, index) in logMessages" 
            :key="index"
            class="log-message"
            :class="getLogClass(msg)"
          >
            <small class="text-medium-emphasis mr-2">{{ msg.time }}</small>
            {{ msg.text }}
          </div>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRegistroStore } from '@/stores/registro'
import { TestCifradoCompleto } from '@/utils/testCifradoCompleto'

// Estado reactivo
const registroStore = useRegistroStore()
const ejecutandoPrueba = ref(false)
const resultadoPrueba = ref<Record<string, unknown> | null>(null)
const logMessages = ref<Array<{ time: string; text: string; type: string }>>([])

// Computeds
const ultimaSinc = computed(() => {
  if (!registroStore.lastSync) return 'Nunca'
  return new Date(registroStore.lastSync).toLocaleTimeString('es-UY', { hour12: false })
})

const sistemaFunciona = computed(() => {
  return resultadoPrueba.value?.success === true
})

// Métodos de logging
function addLog(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const time = new Date().toLocaleTimeString('es-UY', { hour12: false })
  logMessages.value.push({ time, text: message, type })
  
  // Mantener solo los últimos 50 mensajes
  if (logMessages.value.length > 50) {
    logMessages.value = logMessages.value.slice(-50)
  }
}

function getLogClass(msg: { type: string }) {
  const classes = {
    success: 'text-success',
    error: 'text-error', 
    warning: 'text-warning',
    info: 'text-primary'
  }
  return classes[msg.type as keyof typeof classes] || 'text-primary'
}

// Hook del console.log para capturar mensajes
const originalConsoleLog = console.log
const originalConsoleError = console.error

onMounted(() => {
  // Interceptar console.log para mostrar en UI
  console.log = (...args) => {
    originalConsoleLog(...args)
    const message = args.join(' ')
    
    let type: 'info' | 'success' | 'error' | 'warning' = 'info'
    if (message.includes('✅') || message.includes('SUCCESS')) type = 'success'
    else if (message.includes('❌') || message.includes('ERROR')) type = 'error'
    else if (message.includes('⚠️') || message.includes('WARNING')) type = 'warning'
    
    addLog(message, type)
  }
  
  console.error = (...args) => {
    originalConsoleError(...args)
    addLog(args.join(' '), 'error')
  }
})

// Métodos de prueba
async function ejecutarPruebaCompleta() {
  try {
    ejecutandoPrueba.value = true
    addLog('🧪 Iniciando prueba completa...', 'info')
    
    const resultado = await TestCifradoCompleto.pruebaRegistroCompletoConAcompanantes()
    resultadoPrueba.value = resultado
    
    if (resultado.success) {
      addLog('🎉 Prueba completa exitosa!', 'success')
    } else {
      addLog(`❌ Prueba falló: ${resultado.error}`, 'error')
    }
    
  } catch (error) {
    addLog(`💥 Error ejecutando prueba: ${error}`, 'error')
    resultadoPrueba.value = { success: false, error: String(error) }
  } finally {
    ejecutandoPrueba.value = false
  }
}

async function ejecutarPruebaRendimiento() {
  try {
    ejecutandoPrueba.value = true
    addLog('🚀 Iniciando prueba de rendimiento...', 'info')
    
    const resultado = await TestCifradoCompleto.pruebaRendimientoMultiplesRegistros(5)
    
    if (resultado.success) {
      addLog(`⚡ Rendimiento: ${resultado.cantidad} registros en ${resultado.tiempoTotal}ms`, 'success')
    } else {
      addLog(`❌ Prueba de rendimiento falló: ${resultado.error}`, 'error')
    }
    
  } catch (error) {
    addLog(`💥 Error en prueba de rendimiento: ${error}`, 'error')
  } finally {
    ejecutandoPrueba.value = false
  }
}

async function cargarDatosReales() {
  try {
    ejecutandoPrueba.value = true
    addLog('🔄 Cargando datos reales desde IndexedDB...', 'info')
    
    await registroStore.loadRegistrosFromDB()
    
    addLog('✅ Datos reales cargados exitosamente', 'success') 
    addLog(`📊 Total registros: ${registroStore.totalRegistros}`, 'info')
    addLog(`👥 Personas dentro: ${registroStore.personasDentro.length}`, 'info')
    
  } catch (error) {
    addLog(`❌ Error cargando datos: ${error}`, 'error')
  } finally {
    ejecutandoPrueba.value = false
  }
}

async function limpiarDatos() {
  try {
    ejecutandoPrueba.value = true
    addLog('🧹 Limpiando datos de prueba...', 'warning')
    
    await registroStore.clearData()
    resultadoPrueba.value = null
    
    addLog('✅ Datos limpiados', 'success')
    
  } catch (error) {
    addLog(`❌ Error limpiando datos: ${error}`, 'error')
  } finally {
    ejecutandoPrueba.value = false
  }
}
</script>

<style scoped>
.test-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
}

.log-message {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  margin-bottom: 2px;
  padding: 2px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.log-message:hover {
  background-color: rgba(0,0,0,0.02);
}
</style>
