/**
 * ✅ PRUEBA COMPLETA DEL SISTEMA DE CIFRADO/DESCIFRADO
 *
 * Este archivo contiene pruebas integrales para validar:
 * 1. Guardado cifrado completo (persona + vehículo + acompañantes)
 * 2. Descifrado correcto de todos los datos
 * 3. Sincronización con store
 * 4. Búsquedas funcionando con datos reales
 */

import { useRegistroStore } from '@/stores/registro'
import type { RegistroIngresoData, RegistroIngreso } from '@/stores/registro'

export class TestCifradoCompleto {

  /**
   * 🧪 PRUEBA INTEGRAL: Registro completo con acompañantes
   */
  static async pruebaRegistroCompletoConAcompanantes() {
    try {
      const registroStore = useRegistroStore()

      // 1. CREAR DATOS DE PRUEBA REALISTAS
      const datosRegistro: RegistroIngresoData = {
        datosPersonales: {
          cedula: '55226350',
          nombre: 'Mario Alberto',
          apellido: 'BERNI GONZALEZ'
        },
        datosVisita: {
          destino: 'IRCCA'
        },
        datosVehiculo: {
          tipo: 'Camioneta',
          matricula: 'SGI2024'
        },
        acompanantes: [
          {
            cedula: '45123789',
            nombre: 'Ana María',
            apellido: 'RODRIGUEZ LOPEZ',
            destino: 'Ligeral'
          },
          {
            cedula: '38567234',
            nombre: 'Carlos Eduardo',
            apellido: 'MARTINEZ SILVA',
            destino: 'Simbiosys'
          },
          {
            cedula: '52789456',
            nombre: 'Laura Beatriz',
            apellido: 'GARCIA FERNANDEZ',
            destino: 'Jabelor'
          }
        ],
        observaciones: 'Visita de inspección técnica programada. Vehículo oficial con 3 acompañantes del equipo técnico.'
      }

      // 2. REGISTRAR EN SISTEMA (CIFRADO AUTOMÁTICO)
      const registroCompleto = await registroStore.registrarIngreso(datosRegistro)

      // 3. CARGAR DATOS REALES DESDE INDEXEDDB (DESCIFRADO)
      await registroStore.loadRegistrosFromDB()

      // 4. VERIFICAR DESCIFRADO CORRECTO
      const registrosDescifrados = registroStore.registros
      const ultimoRegistro = registrosDescifrados[0] // El más reciente

      if (!ultimoRegistro || ultimoRegistro.tipo !== 'ingreso') {
        throw new Error('No se encontró el registro recién creado')
      }

      const registroIngreso = ultimoRegistro as RegistroIngreso // Type assertion for test validation

      // VALIDACIONES DE DESCIFRADO
      if (registroIngreso.datosPersonales?.cedula !== datosRegistro.datosPersonales.cedula) {
        throw new Error('❌ Documento no descifrado correctamente')
      }
      if (registroIngreso.datosPersonales?.nombre !== datosRegistro.datosPersonales.nombre) {
        throw new Error('❌ Nombre no descifrado correctamente')
      }

      if (registroIngreso.datosVehiculo?.matricula !== datosRegistro.datosVehiculo?.matricula) {
        throw new Error('❌ Matrícula no descifrada correctamente')
      }

      if (!registroIngreso.acompanantes || registroIngreso.acompanantes.length !== 3) {
        throw new Error('❌ Acompañantes no descifrados correctamente')
      }

      // Validar primer acompañante
      const primerAcomp = registroIngreso.acompanantes[0]
      if (primerAcomp.cedula !== '45123789' || primerAcomp.nombre !== 'Ana María') {
        throw new Error('❌ Primer acompañante no descifrado correctamente')
      }

      if (registroIngreso.observaciones !== datosRegistro.observaciones) {
        throw new Error('❌ Observaciones no descifradas correctamente')
      }

      // 5. VERIFICAR ESTADO DE PERSONAS DENTRO
      const personasDentro = registroStore.personasDentro

      if (personasDentro.length !== 4) {
        throw new Error(`❌ Se esperaban 4 personas dentro, se encontraron ${personasDentro.length}`)
      }

      // 6. PROBAR BÚSQUEDAS
      // Búsqueda por cédula del titular
      const encontradoTitular = await registroStore.getRegistrosByCedula('55226350')
      if (encontradoTitular.length === 0) {
        throw new Error('❌ Búsqueda por documento titular falló')
      }

      // Búsqueda por cédula de acompañante
      const encontradoAcomp = await registroStore.getRegistrosByCedula('45123789')
      if (encontradoAcomp.length === 0) {
        throw new Error('❌ Búsqueda por documento acompañante falló')
      }

      return {
        success: true,
        registroId: registroCompleto.id,
        personasDentro: personasDentro.length,
        message: 'Sistema de cifrado/descifrado funcionando perfectamente'
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * 🧪 PRUEBA DE RENDIMIENTO: Múltiples registros
   */
  static async pruebaRendimientoMultiplesRegistros(cantidad: number = 5) {
    const startTime = performance.now()
    const registroStore = useRegistroStore()

    try {
      for (let i = 0; i < cantidad; i++) {
        const datos: RegistroIngresoData = {
          datosPersonales: {
            cedula: `1234567${i}`,
            nombre: `Persona ${i}`,
            apellido: `Apellido ${i}`
          },
          datosVisita: {
            destino: 'IRCCA'
          },
          acompanantes: [
            {
              cedula: `9876543${i}`,
              nombre: `Acompañante ${i}`,
              apellido: `Acomp Apellido ${i}`,
              destino: 'Otra'
            }
          ],
          observaciones: `Registro de prueba número ${i}`
        }

        await registroStore.registrarIngreso(datos)
      }

      // Cargar y descifrar todos
      await registroStore.loadRegistrosFromDB()

      const endTime = performance.now()
      const tiempoTotal = Math.round(endTime - startTime)
      const promedioPorRegistro = Math.round(tiempoTotal / cantidad)

      return {
        success: true,
        cantidad,
        tiempoTotal,
        promedioPorRegistro,
        personasTotal: registroStore.personasDentro.length
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
}
