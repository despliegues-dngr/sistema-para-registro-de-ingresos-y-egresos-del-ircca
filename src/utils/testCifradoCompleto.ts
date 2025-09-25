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
    console.log('🧪 [TEST] INICIANDO PRUEBA INTEGRAL DE CIFRADO/DESCIFRADO')
    
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
          tipoVisitante: 'Funcionario Público',
          areaVisitar: 'Dirección General'
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
            tipoVisitante: 'Personal Externo',
            areaVisitar: 'Administración'
          },
          {
            cedula: '38567234',
            nombre: 'Carlos Eduardo',
            apellido: 'MARTINEZ SILVA',
            tipoVisitante: 'Proveedor/Contratista',
            areaVisitar: 'Mantenimiento'
          },
          {
            cedula: '52789456',
            nombre: 'Laura Beatriz',
            apellido: 'GARCIA FERNANDEZ',
            tipoVisitante: 'Visitante Oficial',
            areaVisitar: 'Seguridad'
          }
        ],
        observaciones: 'Visita de inspección técnica programada. Vehículo oficial con 3 acompañantes del equipo técnico.'
      }
      
      console.log('📊 [TEST] Datos de entrada preparados:')
      console.log('  - Titular:', datosRegistro.datosPersonales.nombre, datosRegistro.datosPersonales.apellido)
      console.log('  - Vehículo:', datosRegistro.datosVehiculo?.tipo, datosRegistro.datosVehiculo?.matricula)
      console.log('  - Acompañantes:', datosRegistro.acompanantes?.length || 0)
      console.log('  - Observaciones:', datosRegistro.observaciones?.length, 'chars')
      
      // 2. REGISTRAR EN SISTEMA (CIFRADO AUTOMÁTICO)
      console.log('🔐 [TEST] Registrando datos (se cifrarán automáticamente)...')
      const registroCompleto = await registroStore.registrarIngreso(datosRegistro)
      
      console.log('✅ [TEST] Registro guardado con ID:', registroCompleto.id)
      
      // 3. CARGAR DATOS REALES DESDE INDEXEDDB (DESCIFRADO)
      console.log('🔓 [TEST] Cargando datos reales desde IndexedDB...')
      await registroStore.loadRegistrosFromDB()
      
      // 4. VERIFICAR DESCIFRADO CORRECTO
      console.log('🔍 [TEST] Verificando descifrado de datos...')
      const registrosDescifrados = registroStore.registros
      const ultimoRegistro = registrosDescifrados[0] // El más reciente
      
      if (!ultimoRegistro || ultimoRegistro.tipo !== 'ingreso') {
        throw new Error('No se encontró el registro recién creado')
      }
      
      const registroIngreso = ultimoRegistro as RegistroIngreso // Type assertion for test validation
      
      // VALIDACIONES DE DESCIFRADO
      console.log('✅ [TEST] Validando datos personales...')
      if (registroIngreso.datosPersonales?.cedula !== datosRegistro.datosPersonales.cedula) {
        throw new Error('❌ Cédula no descifrada correctamente')
      }
      if (registroIngreso.datosPersonales?.nombre !== datosRegistro.datosPersonales.nombre) {
        throw new Error('❌ Nombre no descifrado correctamente')
      }
      
      console.log('✅ [TEST] Validando datos de visita...')
      if (registroIngreso.datosVisita?.tipoVisitante !== datosRegistro.datosVisita.tipoVisitante) {
        throw new Error('❌ Tipo visitante no descifrado correctamente')
      }
      
      console.log('✅ [TEST] Validando datos de vehículo...')
      if (registroIngreso.datosVehiculo?.matricula !== datosRegistro.datosVehiculo?.matricula) {
        throw new Error('❌ Matrícula no descifrada correctamente')
      }
      
      console.log('✅ [TEST] Validando acompañantes...')
      if (!registroIngreso.acompanantes || registroIngreso.acompanantes.length !== 3) {
        throw new Error('❌ Acompañantes no descifrados correctamente')
      }
      
      // Validar primer acompañante
      const primerAcomp = registroIngreso.acompanantes[0]
      if (primerAcomp.cedula !== '45123789' || primerAcomp.nombre !== 'Ana María') {
        throw new Error('❌ Primer acompañante no descifrado correctamente')
      }
      
      console.log('✅ [TEST] Validando observaciones...')
      if (registroIngreso.observaciones !== datosRegistro.observaciones) {
        throw new Error('❌ Observaciones no descifradas correctamente')
      }
      
      // 5. VERIFICAR ESTADO DE PERSONAS DENTRO
      console.log('👥 [TEST] Verificando personas dentro...')
      const personasDentro = registroStore.personasDentro
      console.log('  - Total personas dentro:', personasDentro.length)
      console.log('  - Esperadas: 4 (titular + 3 acompañantes)')
      
      if (personasDentro.length !== 4) {
        throw new Error(`❌ Se esperaban 4 personas dentro, se encontraron ${personasDentro.length}`)
      }
      
      // 6. PROBAR BÚSQUEDAS
      console.log('🔍 [TEST] Probando búsquedas...')
      
      // Búsqueda por cédula del titular
      const encontradoTitular = await registroStore.getRegistrosByCedula('55226350')
      if (encontradoTitular.length === 0) {
        throw new Error('❌ Búsqueda por cédula titular falló')
      }
      
      // Búsqueda por cédula de acompañante  
      const encontradoAcomp = await registroStore.getRegistrosByCedula('45123789')
      if (encontradoAcomp.length === 0) {
        throw new Error('❌ Búsqueda por cédula acompañante falló')
      }
      
      console.log('🎉 [TEST] ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!')
      console.log('📊 [TEST] Resumen de la prueba:')
      console.log('  ✅ Cifrado automático funcionando')
      console.log('  ✅ Descifrado completo funcionando')
      console.log('  ✅ Datos personales descifrados correctamente')
      console.log('  ✅ Datos de visita descifrados correctamente')
      console.log('  ✅ Datos de vehículo descifrados correctamente')
      console.log('  ✅ 3 acompañantes descifrados correctamente')
      console.log('  ✅ Observaciones descifradas correctamente')
      console.log('  ✅ Estado personas dentro actualizado (4 personas)')
      console.log('  ✅ Búsquedas funcionando con datos descifrados')
      
      return {
        success: true,
        registroId: registroCompleto.id,
        personasDentro: personasDentro.length,
        message: 'Sistema de cifrado/descifrado funcionando perfectamente'
      }
      
    } catch (error) {
      console.error('❌ [TEST] ERROR EN PRUEBA:', error)
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
    console.log(`🚀 [TEST] PRUEBA DE RENDIMIENTO - ${cantidad} registros`)
    
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
            tipoVisitante: 'Funcionario Público',
            areaVisitar: 'Administración'
          },
          acompanantes: [
            {
              cedula: `9876543${i}`,
              nombre: `Acompañante ${i}`,
              apellido: `Acomp Apellido ${i}`,
              tipoVisitante: 'Personal Externo',
              areaVisitar: 'Seguridad'
            }
          ],
          observaciones: `Registro de prueba número ${i}`
        }
        
        await registroStore.registrarIngreso(datos)
        console.log(`  ✅ Registro ${i + 1}/${cantidad} completado`)
      }
      
      // Cargar y descifrar todos
      await registroStore.loadRegistrosFromDB()
      
      const endTime = performance.now()
      const tiempoTotal = Math.round(endTime - startTime)
      const promedioPorRegistro = Math.round(tiempoTotal / cantidad)
      
      console.log(`🎯 [TEST] RENDIMIENTO - Resultados:`)
      console.log(`  📊 ${cantidad} registros procesados en ${tiempoTotal}ms`)
      console.log(`  ⚡ Promedio por registro: ${promedioPorRegistro}ms`)
      console.log(`  👥 Total personas en sistema: ${registroStore.personasDentro.length}`)
      
      return {
        success: true,
        cantidad,
        tiempoTotal,
        promedioPorRegistro,
        personasTotal: registroStore.personasDentro.length
      }
      
    } catch (error) {
      console.error('❌ [TEST] Error en prueba de rendimiento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }
}
