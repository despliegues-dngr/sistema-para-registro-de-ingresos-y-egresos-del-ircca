import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface RegistroEntry {
  id: string
  tipo: 'ingreso' | 'egreso'
  timestamp: Date
  persona?: {
    documento: string
    nombre: string
    apellido: string
    motivo: string
  }
  vehiculo?: {
    matricula: string
    marca: string
    modelo: string
    conductor: string
  }
  observaciones?: string
  operadorId: string
}

export const useRegistroStore = defineStore('registro', () => {
  // State
  const registros = ref<RegistroEntry[]>([])
  const loading = ref(false)
  const lastSync = ref<Date | null>(null)

  // Getters
  const totalRegistros = computed(() => registros.value.length)
  const registrosHoy = computed(() => {
    const hoy = new Date().toDateString()
    return registros.value.filter((r) => new Date(r.timestamp).toDateString() === hoy)
  })

  const ingresosPendientes = computed(() =>
    registros.value.filter(
      (r) =>
        r.tipo === 'ingreso' &&
        !registros.value.some(
          (egreso) =>
            egreso.tipo === 'egreso' &&
            egreso.persona?.documento === r.persona?.documento &&
            egreso.timestamp > r.timestamp,
        ),
    ),
  )

  // Actions
  function addRegistro(registro: Omit<RegistroEntry, 'id' | 'timestamp'>) {
    const newRegistro: RegistroEntry = {
      ...registro,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }
    registros.value.unshift(newRegistro) // Más recientes primero
    // TODO: Guardar en IndexedDB cifrado
  }

  function getRegistrosByDocumento(documento: string) {
    return registros.value.filter((r) => r.persona?.documento === documento)
  }

  function getRegistrosByMatricula(matricula: string) {
    return registros.value.filter((r) => r.vehiculo?.matricula === matricula)
  }

  async function syncData() {
    loading.value = true
    try {
      // TODO: Implementar sincronización con IndexedDB
      lastSync.value = new Date()
    } catch (error) {
      console.error('Error sincronizando datos:', error)
    } finally {
      loading.value = false
    }
  }

  function clearData() {
    registros.value = []
    lastSync.value = null
  }

  return {
    // State
    registros,
    loading,
    lastSync,
    // Getters
    totalRegistros,
    registrosHoy,
    ingresosPendientes,
    // Actions
    addRegistro,
    getRegistrosByDocumento,
    getRegistrosByMatricula,
    syncData,
    clearData,
  }
})
