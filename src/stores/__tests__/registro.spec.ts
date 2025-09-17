import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRegistroStore, type RegistroEntry } from '../registro'

describe('useRegistroStore', () => {
  beforeEach(() => {
    // Configurar Pinia antes de cada prueba
    setActivePinia(createPinia())
    // Mock crypto.randomUUID para pruebas consistentes
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid-123')
    })
  })

  describe('Estado inicial', () => {
    it('debe tener valores iniciales correctos', () => {
      const registroStore = useRegistroStore()

      expect(registroStore.registros).toEqual([])
      expect(registroStore.loading).toBe(false)
      expect(registroStore.lastSync).toBeNull()
    })

    it('getters deben reflejar estado inicial', () => {
      const registroStore = useRegistroStore()

      expect(registroStore.totalRegistros).toBe(0)
      expect(registroStore.registrosHoy).toEqual([])
      expect(registroStore.ingresosPendientes).toEqual([])
    })
  })

  describe('Acción addRegistro()', () => {
    it('debe agregar un nuevo registro de ingreso correctamente', () => {
      const registroStore = useRegistroStore()
      const registroIngreso = {
        tipo: 'ingreso' as const,
        persona: {
          documento: '12345678',
          nombre: 'Juan',
          apellido: 'Pérez',
          motivo: 'Visita oficial'
        },
        operadorId: 'op-001'
      }

      registroStore.addRegistro(registroIngreso)

      expect(registroStore.registros).toHaveLength(1)
      expect(registroStore.registros[0]).toMatchObject({
        id: 'test-uuid-123',
        tipo: 'ingreso',
        persona: registroIngreso.persona,
        operadorId: 'op-001'
      })
      expect(registroStore.registros[0].timestamp).toBeInstanceOf(Date)
    })

    it('debe agregar un nuevo registro de egreso correctamente', () => {
      const registroStore = useRegistroStore()
      const registroEgreso = {
        tipo: 'egreso' as const,
        persona: {
          documento: '87654321',
          nombre: 'María',
          apellido: 'García',
          motivo: 'Fin de visita'
        },
        operadorId: 'op-002',
        observaciones: 'Salida normal'
      }

      registroStore.addRegistro(registroEgreso)

      expect(registroStore.registros).toHaveLength(1)
      expect(registroStore.registros[0]).toMatchObject({
        id: 'test-uuid-123',
        tipo: 'egreso',
        persona: registroEgreso.persona,
        operadorId: 'op-002',
        observaciones: 'Salida normal'
      })
    })

    it('debe agregar registro con información de vehículo', () => {
      const registroStore = useRegistroStore()
      const registroConVehiculo = {
        tipo: 'ingreso' as const,
        persona: {
          documento: '11223344',
          nombre: 'Carlos',
          apellido: 'López',
          motivo: 'Entrega de documentos'
        },
        vehiculo: {
          matricula: 'ABC1234',
          marca: 'Toyota',
          modelo: 'Corolla',
          conductor: 'Carlos López'
        },
        operadorId: 'op-003'
      }

      registroStore.addRegistro(registroConVehiculo)

      expect(registroStore.registros[0].vehiculo).toEqual({
        matricula: 'ABC1234',
        marca: 'Toyota',
        modelo: 'Corolla',
        conductor: 'Carlos López'
      })
    })

    it('debe insertar registros más recientes al principio', () => {
      const registroStore = useRegistroStore()
      
      const primerRegistro = {
        tipo: 'ingreso' as const,
        persona: { documento: '11111111', nombre: 'Primer', apellido: 'Usuario', motivo: 'Motivo 1' },
        operadorId: 'op-001'
      }
      
      const segundoRegistro = {
        tipo: 'ingreso' as const,
        persona: { documento: '22222222', nombre: 'Segundo', apellido: 'Usuario', motivo: 'Motivo 2' },
        operadorId: 'op-001'
      }

      registroStore.addRegistro(primerRegistro)
      registroStore.addRegistro(segundoRegistro)

      expect(registroStore.registros[0].persona?.documento).toBe('22222222') // Más reciente primero
      expect(registroStore.registros[1].persona?.documento).toBe('11111111')
    })
  })

  describe('Getters computados', () => {
    it('totalRegistros debe contar correctamente', () => {
      const registroStore = useRegistroStore()
      
      expect(registroStore.totalRegistros).toBe(0)
      
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '12345678', nombre: 'Test', apellido: 'User', motivo: 'Test' },
        operadorId: 'op-001'
      })
      
      expect(registroStore.totalRegistros).toBe(1)
    })

    it('registrosHoy debe filtrar registros del día actual', () => {
      const registroStore = useRegistroStore()
      
      // Mock fecha para prueba consistente
      const hoy = new Date('2025-09-15T10:00:00Z')
      vi.setSystemTime(hoy)
      
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '12345678', nombre: 'Test', apellido: 'User', motivo: 'Test' },
        operadorId: 'op-001'
      })
      
      expect(registroStore.registrosHoy).toHaveLength(1)
      
      vi.useRealTimers()
    })

    it('ingresosPendientes debe identificar personas sin egreso', () => {
      const registroStore = useRegistroStore()
      
      console.log('📝 DEBUG Registro - Estado inicial:')
      console.log('   Registros totales:', registroStore.registros.length)
      console.log('   Ingresos pendientes:', registroStore.ingresosPendientes.length)
      
      // Agregar ingreso
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '12345678', nombre: 'Juan', apellido: 'Pérez', motivo: 'Visita' },
        operadorId: 'op-001'
      })
      
      console.log('📝 DEBUG Registro - Después del ingreso:')
      console.log('   Registros totales:', registroStore.registros.length)
      console.log('   Registro agregado:', registroStore.registros[0])
      console.log('   Ingresos pendientes:', registroStore.ingresosPendientes.length)
      console.log('   Detalle pendientes:', registroStore.ingresosPendientes.map(r => ({
        id: r.id,
        tipo: r.tipo,
        documento: r.persona?.documento,
        timestamp: r.timestamp
      })))
      
      expect(registroStore.ingresosPendientes).toHaveLength(1)
      expect(registroStore.ingresosPendientes[0].persona?.documento).toBe('12345678')
      
      // Agregar egreso para la misma persona
      registroStore.addRegistro({
        tipo: 'egreso',
        persona: { documento: '12345678', nombre: 'Juan', apellido: 'Pérez', motivo: 'Fin visita' },
        operadorId: 'op-001'
      })
      
      console.log('📝 DEBUG Registro - Después del egreso:')
      console.log('   Registros totales:', registroStore.registros.length)
      console.log('   Todos los registros:', registroStore.registros.map(r => ({
        id: r.id,
        tipo: r.tipo,
        documento: r.persona?.documento,
        timestamp: r.timestamp
      })))
      console.log('   Ingresos pendientes:', registroStore.ingresosPendientes.length)
      console.log('   Detalle pendientes:', registroStore.ingresosPendientes.map(r => ({
        id: r.id,
        tipo: r.tipo,
        documento: r.persona?.documento,
        timestamp: r.timestamp
      })))
      
      expect(registroStore.ingresosPendientes).toHaveLength(0)
    })
  })

  describe('Métodos de búsqueda', () => {
    it('getRegistrosByDocumento debe filtrar por documento', () => {
      const registroStore = useRegistroStore()
      
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '12345678', nombre: 'Juan', apellido: 'Pérez', motivo: 'Visita' },
        operadorId: 'op-001'
      })
      
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '87654321', nombre: 'María', apellido: 'García', motivo: 'Reunión' },
        operadorId: 'op-001'
      })
      
      const registrosJuan = registroStore.getRegistrosByDocumento('12345678')
      expect(registrosJuan).toHaveLength(1)
      expect(registrosJuan[0].persona?.nombre).toBe('Juan')
    })

    it('getRegistrosByMatricula debe filtrar por matrícula de vehículo', () => {
      const registroStore = useRegistroStore()
      
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '12345678', nombre: 'Juan', apellido: 'Pérez', motivo: 'Visita' },
        vehiculo: { matricula: 'ABC1234', marca: 'Toyota', modelo: 'Corolla', conductor: 'Juan Pérez' },
        operadorId: 'op-001'
      })
      
      const registrosPorMatricula = registroStore.getRegistrosByMatricula('ABC1234')
      expect(registrosPorMatricula).toHaveLength(1)
      expect(registrosPorMatricula[0].vehiculo?.matricula).toBe('ABC1234')
    })
  })

  describe('Acciones de gestión', () => {
    it('clearData debe limpiar todos los datos', () => {
      const registroStore = useRegistroStore()
      
      registroStore.addRegistro({
        tipo: 'ingreso',
        persona: { documento: '12345678', nombre: 'Test', apellido: 'User', motivo: 'Test' },
        operadorId: 'op-001'
      })
      
      expect(registroStore.registros).toHaveLength(1)
      
      registroStore.clearData()
      
      expect(registroStore.registros).toHaveLength(0)
      expect(registroStore.lastSync).toBeNull()
    })

    it('syncData debe manejar el estado de carga', async () => {
      const registroStore = useRegistroStore()
      
      expect(registroStore.loading).toBe(false)
      expect(registroStore.lastSync).toBeNull()
      
      await registroStore.syncData()
      
      expect(registroStore.loading).toBe(false) // Al final siempre es false
      expect(registroStore.lastSync).toBeInstanceOf(Date)
    })
  })
})
