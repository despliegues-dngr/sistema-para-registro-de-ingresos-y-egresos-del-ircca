import { useDatabase } from './useDatabase'
import { useRegistrosSearch } from './useRegistros'
import type { RegistroEntry } from '@/stores/registro'

/**
 * Composable para exportación de datos de usuarios según derechos ARCO
 * Cumplimiento: Ley 18.331 - Derecho de Acceso
 * 
 * @see docs/03-security/05-arco-rights-procedure.md
 */

export interface UserDataReport {
  metadata: {
    solicitudId?: string
    fechaGeneracion: string
    cedulaSolicitante: string
    tipoSolicitud: 'acceso' | 'rectificacion' | 'cancelacion' | 'oposicion'
    generadoPor: string // userId del admin que genera
  }
  datosPersonales: {
    cedula: string
    nombreCompleto: string
    registrosEncontrados: number
  }
  registrosIngreso: Array<{
    id: string
    fecha: string
    hora: string
    destino: string
    vehiculo?: {
      matricula: string
      marca: string
      modelo: string
    }
    acompanantes?: Array<{
      cedula: string
      nombre: string
      apellido: string
    }>
    operadorRegistro: string
  }>
  registrosSalida: Array<{
    id: string
    fecha: string
    hora: string
    operadorRegistro: string
  }>
  personasConocidas?: {
    existe: boolean
    datosAlmacenados?: {
      cedula: string
      nombre: string
      apellido: string
      destino: string
      vehiculo?: string
      acompanantes?: string[]
    }
  }
  finalidadTratamiento: string
  baseLegal: string
  plazoConservacion: string
  destinatarios: string
  derechosAdicionales: string[]
}

export function useArcoDataExport() {
  const { initDatabase, getRecords } = useDatabase()
  const { searchByCedula } = useRegistrosSearch()

  /**
   * Recopila todos los datos de un usuario específico por cédula
   * Para responder solicitudes de Derecho de Acceso (ARCO)
   */
  async function recopilarDatosUsuario(
    cedula: string,
    generadoPorUserId: string,
    tipoSolicitud: UserDataReport['metadata']['tipoSolicitud'] = 'acceso',
    solicitudId?: string
  ): Promise<UserDataReport> {
    try {
      await initDatabase()

      // Buscar todos los registros de ingreso/egreso por cédula
      const registros = await searchByCedula(cedula)

      // Separar ingresos y salidas
      const ingresos = registros.filter((r) => r.tipo === 'ingreso')
      const salidas = registros.filter((r) => r.tipo === 'salida')

      // Buscar en personas conocidas
      const personasConocidas = await getRecords('personasConocidas')
      const personaConocida = (personasConocidas as Array<{ cedula: string; [key: string]: unknown }>)
        .find((p) => p.cedula === cedula)

      // Obtener nombre completo del primer registro disponible
      let nombreCompleto = 'No disponible'
      if (ingresos.length > 0) {
        const primerIngreso = ingresos[0] as RegistroEntry & {
          datosPersonales?: { nombre?: string; apellido?: string }
        }
        nombreCompleto = `${primerIngreso.datosPersonales?.nombre || ''} ${primerIngreso.datosPersonales?.apellido || ''}`.trim()
      }

      // Construir reporte estructurado
      const reporte: UserDataReport = {
        metadata: {
          solicitudId,
          fechaGeneracion: new Date().toISOString(),
          cedulaSolicitante: cedula,
          tipoSolicitud,
          generadoPor: generadoPorUserId
        },
        datosPersonales: {
          cedula,
          nombreCompleto,
          registrosEncontrados: registros.length
        },
        registrosIngreso: ingresos.map((ingreso) => {
          const ing = ingreso as RegistroEntry & {
            datosPersonales?: {
              nombre?: string
              apellido?: string
            }
            datosVisita?: {
              destino?: string
            }
            datosVehiculo?: {
              matricula?: string
              marca?: string
              modelo?: string
            }
            acompanantes?: Array<{
              cedula: string
              nombre: string
              apellido: string
            }>
            operadorId?: string
          }

          return {
            id: ing.id,
            fecha: new Date(ing.timestamp).toLocaleDateString('es-UY'),
            hora: new Date(ing.timestamp).toLocaleTimeString('es-UY'),
            destino: ing.datosVisita?.destino || 'No especificado',
            vehiculo: ing.datosVehiculo?.matricula
              ? {
                  matricula: ing.datosVehiculo.matricula,
                  marca: ing.datosVehiculo.marca || 'No especificado',
                  modelo: ing.datosVehiculo.modelo || 'No especificado'
                }
              : undefined,
            acompanantes: ing.acompanantes,
            operadorRegistro: ing.operadorId || 'No disponible'
          }
        }),
        registrosSalida: salidas.map((salida) => {
          const sal = salida as RegistroEntry & {
            operadorId?: string
          }

          return {
            id: sal.id,
            fecha: new Date(sal.timestamp).toLocaleDateString('es-UY'),
            hora: new Date(sal.timestamp).toLocaleTimeString('es-UY'),
            operadorRegistro: sal.operadorId || 'No disponible'
          }
        }),
        personasConocidas: {
          existe: !!personaConocida,
          datosAlmacenados: personaConocida
            ? {
                cedula: (personaConocida as { cedula: string }).cedula,
                nombre: (personaConocida as { nombre?: string }).nombre || '',
                apellido: (personaConocida as { apellido?: string }).apellido || '',
                destino: (personaConocida as { destino?: string }).destino || '',
                vehiculo: (personaConocida as { vehiculo?: string }).vehiculo,
                acompanantes: (personaConocida as { acompanantes?: string[] }).acompanantes
              }
            : undefined
        },
        // Información legal según Ley 18.331
        finalidadTratamiento:
          'Control de acceso físico a instalaciones del IRCCA, seguridad del personal y registro de visitantes conforme a normativa de seguridad institucional.',
        baseLegal: 'Ley Orgánica del IRCCA y normativa interna de seguridad.',
        plazoConservacion:
          'En sistema activo: 12 meses. En respaldos: 5 años. Luego: Eliminación segura.',
        destinatarios:
          'Los datos NO se comparten con terceros, excepto obligación legal (ej. orden judicial).',
        derechosAdicionales: [
          'Rectificación: Corregir datos incorrectos',
          'Cancelación: Solicitar eliminación de datos',
          'Oposición: Oponerse al tratamiento en casos justificados',
          'Reclamo a URCDP si no está conforme con la respuesta'
        ]
      }

      return reporte
    } catch (error) {
      console.error('Error recopilando datos de usuario:', error)
      throw new Error(
        `Error al recopilar datos del usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  /**
   * Exporta el reporte a JSON descargable
   */
  function exportarJSON(reporte: UserDataReport, nombreArchivo?: string): void {
    const nombre =
      nombreArchivo ||
      `ARCO_Acceso_${reporte.datosPersonales.cedula}_${new Date().toISOString().split('T')[0]}`

    const jsonString = JSON.stringify(reporte, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${nombre}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Exporta el reporte a CSV simple
   */
  function exportarCSV(reporte: UserDataReport, nombreArchivo?: string): void {
    const nombre =
      nombreArchivo ||
      `ARCO_Acceso_${reporte.datosPersonales.cedula}_${new Date().toISOString().split('T')[0]}`

    // Headers
    const headers = ['Fecha', 'Hora', 'Tipo', 'Destino', 'Vehículo', 'Operador']

    // Filas - Registros de ingreso
    const filasIngresos = reporte.registrosIngreso.map((ing) => [
      ing.fecha,
      ing.hora,
      'INGRESO',
      ing.destino,
      ing.vehiculo?.matricula || 'N/A',
      ing.operadorRegistro
    ])

    // Filas - Registros de salida
    const filasSalidas = reporte.registrosSalida.map((sal) => [
      sal.fecha,
      sal.hora,
      'SALIDA',
      'N/A',
      'N/A',
      sal.operadorRegistro
    ])

    // Combinar todo
    const todasFilas = [...filasIngresos, ...filasSalidas]

    // Construir CSV
    const csvContent = [
      `"Reporte de Datos Personales - IRCCA"`,
      `"Cédula: ${reporte.datosPersonales.cedula}"`,
      `"Nombre: ${reporte.datosPersonales.nombreCompleto}"`,
      `"Total registros: ${reporte.datosPersonales.registrosEncontrados}"`,
      `"Fecha generación: ${new Date(reporte.metadata.fechaGeneracion).toLocaleString('es-UY')}"`,
      '',
      headers.join(','),
      ...todasFilas.map((fila) => fila.map((celda) => `"${celda}"`).join(','))
    ].join('\n')

    // Agregar BOM para UTF-8
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${nombre}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Genera un reporte legible en texto plano
   * Útil para respuestas por email
   */
  function generarReporteTexto(reporte: UserDataReport): string {
    const lineas = [
      '═══════════════════════════════════════════════════════════',
      '  REPORTE DE DATOS PERSONALES - IRCCA',
      '  Respuesta a Solicitud de Derecho de Acceso (ARCO)',
      '═══════════════════════════════════════════════════════════',
      '',
      '📋 DATOS DEL SOLICITANTE:',
      `   Cédula: ${reporte.datosPersonales.cedula}`,
      `   Nombre: ${reporte.datosPersonales.nombreCompleto}`,
      '',
      '📊 RESUMEN:',
      `   Total de registros encontrados: ${reporte.datosPersonales.registrosEncontrados}`,
      `   Registros de ingreso: ${reporte.registrosIngreso.length}`,
      `   Registros de salida: ${reporte.registrosSalida.length}`,
      `   En lista de personas conocidas: ${reporte.personasConocidas?.existe ? 'SÍ' : 'NO'}`,
      '',
      '───────────────────────────────────────────────────────────',
      '📥 DETALLE DE REGISTROS DE INGRESO:',
      '───────────────────────────────────────────────────────────'
    ]

    if (reporte.registrosIngreso.length > 0) {
      reporte.registrosIngreso.forEach((ing, index) => {
        lineas.push(`\n${index + 1}. INGRESO`)
        lineas.push(`   Fecha: ${ing.fecha} ${ing.hora}`)
        lineas.push(`   Destino: ${ing.destino}`)
        if (ing.vehiculo) {
          lineas.push(`   Vehículo: ${ing.vehiculo.matricula} (${ing.vehiculo.marca} ${ing.vehiculo.modelo})`)
        }
        if (ing.acompanantes && ing.acompanantes.length > 0) {
          lineas.push(`   Acompañantes: ${ing.acompanantes.length}`)
        }
        lineas.push(`   Registrado por: ${ing.operadorRegistro}`)
      })
    } else {
      lineas.push('   No hay registros de ingreso.')
    }

    lineas.push('')
    lineas.push('───────────────────────────────────────────────────────────')
    lineas.push('📤 DETALLE DE REGISTROS DE SALIDA:')
    lineas.push('───────────────────────────────────────────────────────────')

    if (reporte.registrosSalida.length > 0) {
      reporte.registrosSalida.forEach((sal, index) => {
        lineas.push(`\n${index + 1}. SALIDA`)
        lineas.push(`   Fecha: ${sal.fecha} ${sal.hora}`)
        lineas.push(`   Registrado por: ${sal.operadorRegistro}`)
      })
    } else {
      lineas.push('   No hay registros de salida.')
    }

    lineas.push('')
    lineas.push('───────────────────────────────────────────────────────────')
    lineas.push('⚖️  INFORMACIÓN LEGAL:')
    lineas.push('───────────────────────────────────────────────────────────')
    lineas.push('')
    lineas.push('FINALIDAD DEL TRATAMIENTO:')
    lineas.push(`   ${reporte.finalidadTratamiento}`)
    lineas.push('')
    lineas.push('BASE LEGAL:')
    lineas.push(`   ${reporte.baseLegal}`)
    lineas.push('')
    lineas.push('PLAZO DE CONSERVACIÓN:')
    lineas.push(`   ${reporte.plazoConservacion}`)
    lineas.push('')
    lineas.push('DESTINATARIOS:')
    lineas.push(`   ${reporte.destinatarios}`)
    lineas.push('')
    lineas.push('DERECHOS ADICIONALES:')
    reporte.derechosAdicionales.forEach((derecho) => {
      lineas.push(`   • ${derecho}`)
    })
    lineas.push('')
    lineas.push('═══════════════════════════════════════════════════════════')
    lineas.push(
      `Reporte generado: ${new Date(reporte.metadata.fechaGeneracion).toLocaleString('es-UY')}`
    )
    lineas.push('═══════════════════════════════════════════════════════════')

    return lineas.join('\n')
  }

  /**
   * Exporta el reporte en formato texto a archivo .txt
   */
  function exportarTexto(reporte: UserDataReport, nombreArchivo?: string): void {
    const nombre =
      nombreArchivo ||
      `ARCO_Acceso_${reporte.datosPersonales.cedula}_${new Date().toISOString().split('T')[0]}`

    const contenido = generarReporteTexto(reporte)
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${nombre}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    recopilarDatosUsuario,
    exportarJSON,
    exportarCSV,
    exportarTexto,
    generarReporteTexto
  }
}
