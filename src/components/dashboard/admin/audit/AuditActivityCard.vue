<template>
  <v-card elevation="2" class="mb-8">
    <v-card-title class="bg-primary pa-4">
      <div class="d-flex align-center">
        <v-icon color="white" size="28" class="mr-3">mdi-history</v-icon>
        <div>
          <h3 class="text-h6 text-white mb-0">Actividad del Día</h3>
          <p class="text-caption text-blue-lighten-4 mb-0">
            {{ formatDate(new Date()) }}
          </p>
        </div>
      </div>
    </v-card-title>

    <!-- Resumen numérico -->
    <v-card-text class="pa-4">
      <v-row class="mb-4">
        <v-col cols="6" md="3">
          <div class="stat-box">
            <v-icon color="primary" size="32">mdi-account-multiple</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.usuariosActivos }}</div>
            <div class="text-caption text-grey">Usuarios Activos</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="stat-box">
            <v-icon color="success" size="32">mdi-file-document-edit</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.registrosCreados }}</div>
            <div class="text-caption text-grey">Registros Creados</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="stat-box">
            <v-icon color="warning" size="32">mdi-logout</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.salidasProcesadas }}</div>
            <div class="text-caption text-grey">Salidas Procesadas</div>
          </div>
        </v-col>
        <v-col cols="6" md="3">
          <div class="stat-box">
            <v-icon color="error" size="32">mdi-alert-circle</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.eventosImportantes }}</div>
            <div class="text-caption text-grey">Eventos Importantes</div>
          </div>
        </v-col>
      </v-row>

      <v-divider class="mb-4" />

      <!-- Filtros simples -->
      <v-row class="mb-3">
        <v-col cols="12" md="6">
          <v-btn-toggle
            v-model="filtroTiempo"
            color="primary"
            variant="outlined"
            divided
            mandatory
          >
            <v-btn value="hoy">Hoy</v-btn>
            <v-btn value="ayer">Ayer</v-btn>
            <v-btn value="semana">Última Semana</v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="filtroUsuario"
            :items="usuariosDisponibles"
            label="Filtrar por usuario"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-account-filter"
          />
        </v-col>
      </v-row>

      <!-- Lista de actividades -->
      <div class="activity-list">
        <div
          v-for="evento in eventosMostrados"
          :key="evento.id"
          class="activity-item"
        >
          <v-icon
            :color="getEventoColor(evento.action)"
            size="20"
            class="mr-3"
          >
            {{ getEventoIcon(evento.action) }}
          </v-icon>
          
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <span class="font-weight-medium">
                {{ evento.username }} 
                <span class="text-caption text-grey">
                  ({{ getRoleName(evento.details.role as string) }})
                </span>
              </span>
              <span class="text-caption text-grey">
                {{ formatTime(evento.timestamp) }}
              </span>
            </div>
            <div class="text-body-2 text-grey-darken-1">
              {{ getEventoDescripcion(evento.action) }}
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-if="eventosMostrados.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-information-outline</v-icon>
          <p class="text-h6 text-grey mt-4">No hay actividad registrada</p>
          <p class="text-body-2 text-grey">
            No se encontraron eventos para los filtros seleccionados
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuditStore } from '@/stores/audit'
import { useAuditFilters } from '@/composables/useAuditFilters'

const auditStore = useAuditStore()
const {
  filtroTiempo,
  getRangoTiempo,
  formatTime,
  formatDate,
  getEventoColor,
  getEventoIcon,
  getEventoDescripcion,
  getRoleName
} = useAuditFilters()

// Estado local
const filtroUsuario = ref<string | null>(null)

// Estadísticas computadas del día
const stats = computed(() => {
  const rango = getRangoTiempo('hoy')
  const eventosHoy = auditStore.auditLogs.filter(e => {
    const fecha = new Date(e.timestamp)
    return fecha >= rango.inicio && fecha <= rango.fin
  })

  return {
    usuariosActivos: new Set(eventosHoy.map(e => e.userId)).size,
    registrosCreados: eventosHoy.filter(e => e.action === 'registro.created').length,
    salidasProcesadas: eventosHoy.filter(e => e.action === 'registro.modified').length,
    eventosImportantes: eventosHoy.filter(e => 
      e.action.includes('failed') || e.action.includes('blocked')
    ).length
  }
})

// Usuarios disponibles para filtro
const usuariosDisponibles = computed(() => {
  const usuarios = new Set(auditStore.auditLogs.map(e => e.username))
  return Array.from(usuarios).map(u => ({ title: u, value: u }))
})

// Eventos filtrados y mostrados
const eventosMostrados = computed(() => {
  let eventos = auditStore.auditLogs

  // Filtro por tiempo
  const rango = getRangoTiempo(filtroTiempo.value)
  eventos = eventos.filter(e => {
    const fecha = new Date(e.timestamp)
    return fecha >= rango.inicio && fecha <= rango.fin
  })

  // Filtro por usuario
  if (filtroUsuario.value) {
    eventos = eventos.filter(e => e.username === filtroUsuario.value)
  }

  // Ordenar por más reciente primero y limitar a 20
  return eventos
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
})

// Lifecycle
onMounted(async () => {
  // Cargar logs de las últimas 24 horas
  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  
  await auditStore.loadAuditLogs({
    startDate: ayer,
    endDate: new Date()
  })
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
