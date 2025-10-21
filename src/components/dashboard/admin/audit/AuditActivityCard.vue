<template>
  <v-card elevation="2" class="mb-8">
    <v-card-title class="bg-primary pa-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="white" size="28" class="mr-3">mdi-chart-box</v-icon>
          <div>
            <h3 class="text-h6 text-white mb-0">Resumen del Sistema de Auditoría</h3>
            <p class="text-caption text-blue-lighten-4 mb-0">
              Datos de los últimos 6 meses
            </p>
          </div>
        </div>
        
        <!-- Estado de carga -->
        <v-chip
          v-if="auditStore.isLoading"
          color="white"
          variant="outlined"
          size="small"
        >
          <v-progress-circular
            indeterminate
            size="16"
            width="2"
            class="mr-2"
          />
          Cargando...
        </v-chip>
      </div>
    </v-card-title>

    <!-- Métricas del sistema -->
    <v-card-text class="pa-4">
      <v-row>
        <!-- Total de Eventos -->
        <v-col cols="6" md="3">
          <div class="stat-box stat-box-primary">
            <v-icon color="primary" size="36">mdi-database</v-icon>
            <div class="text-h3 font-weight-bold mt-2">{{ stats.totalEventos.toLocaleString() }}</div>
            <div class="text-caption text-grey mt-1">Total de Eventos</div>
            <v-divider class="my-2" />
            <div class="text-caption text-primary">En base de datos</div>
          </div>
        </v-col>

        <!-- Eventos de Autenticación -->
        <v-col cols="6" md="3">
          <div class="stat-box stat-box-success">
            <v-icon color="success" size="36">mdi-shield-check</v-icon>
            <div class="text-h3 font-weight-bold mt-2">{{ stats.eventosAuth }}</div>
            <div class="text-caption text-grey mt-1">Eventos de Seguridad</div>
            <v-divider class="my-2" />
            <div class="text-caption">
              <span class="text-success">{{ stats.loginsExitosos }}</span> exitosos · 
              <span class="text-error">{{ stats.loginsFallidos }}</span> fallidos
            </div>
          </div>
        </v-col>

        <!-- Eventos Críticos -->
        <v-col cols="6" md="3">
          <div class="stat-box stat-box-warning">
            <v-icon color="warning" size="36">mdi-alert</v-icon>
            <div class="text-h3 font-weight-bold mt-2">{{ stats.eventosCriticos }}</div>
            <div class="text-caption text-grey mt-1">Eventos Críticos</div>
            <v-divider class="my-2" />
            <div class="text-caption">
              Errores · Bloqueos · Fallos
            </div>
          </div>
        </v-col>

        <!-- Tasa de Éxito -->
        <v-col cols="6" md="3">
          <div class="stat-box stat-box-info">
            <v-icon :color="stats.tasaExito >= 95 ? 'success' : 'warning'" size="36">
              mdi-chart-line
            </v-icon>
            <div class="text-h3 font-weight-bold mt-2">{{ stats.tasaExito }}%</div>
            <div class="text-caption text-grey mt-1">Tasa de Éxito</div>
            <v-divider class="my-2" />
            <v-progress-linear
              :model-value="stats.tasaExito"
              :color="stats.tasaExito >= 95 ? 'success' : 'warning'"
              height="4"
              rounded
            />
          </div>
        </v-col>
      </v-row>

      <!-- Métricas adicionales -->
      <v-row class="mt-2">
        <v-col cols="12" md="4">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center">
              <v-icon color="info" class="mr-3">mdi-account-multiple</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ stats.usuariosUnicos }}</div>
                <div class="text-caption text-grey">Usuarios únicos activos</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center">
              <v-icon color="info" class="mr-3">mdi-file-document-edit</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ stats.operacionesDatos }}</div>
                <div class="text-caption text-grey">Operaciones de datos</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center">
              <v-icon color="info" class="mr-3">mdi-clock-outline</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ stats.eventosDia }}</div>
                <div class="text-caption text-grey">Eventos hoy</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuditStore } from '@/stores/audit'

const auditStore = useAuditStore()

// Estadísticas computadas basadas en TODOS los datos de la BD (6 meses)
const stats = computed(() => {
  const todosLosEventos = auditStore.auditLogs
  const total = todosLosEventos.length

  // Eventos de hoy
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)
  const eventosDia = todosLosEventos.filter(e => {
    const fecha = new Date(e.timestamp)
    return fecha >= hoy && fecha < manana
  }).length

  // Eventos de autenticación
  const eventosAuth = todosLosEventos.filter(e => e.eventType === 'auth').length
  const loginsExitosos = todosLosEventos.filter(e => e.action === 'login.success').length
  const loginsFallidos = todosLosEventos.filter(e => 
    e.action === 'login.failed' || e.action === 'login.blocked'
  ).length

  // Eventos críticos
  const eventosCriticos = todosLosEventos.filter(e => 
    e.eventType === 'system_error' || 
    e.action.includes('failed') || 
    e.action.includes('blocked')
  ).length

  // Tasa de éxito (eventos sin "failed", "error", "blocked")
  const eventosExitosos = todosLosEventos.filter(e => 
    !e.action.includes('failed') && 
    !e.action.includes('error') && 
    !e.action.includes('blocked')
  ).length
  const tasaExito = total > 0 ? Math.round((eventosExitosos / total) * 100) : 100

  // Usuarios únicos
  const usuariosUnicos = new Set(todosLosEventos.map(e => e.userId)).size

  // Operaciones de datos
  const operacionesDatos = todosLosEventos.filter(e => e.eventType === 'data_operation').length

  return {
    totalEventos: total,
    eventosAuth,
    loginsExitosos,
    loginsFallidos,
    eventosCriticos,
    tasaExito,
    usuariosUnicos,
    operacionesDatos,
    eventosDia
  }
})
</script>

<style scoped>
.stat-box {
  text-align: center;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.2s;
}

.stat-box:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.activity-list {
  max-height: 500px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background 0.2s;
}

.activity-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.activity-item:last-child {
  border-bottom: none;
}
</style>
