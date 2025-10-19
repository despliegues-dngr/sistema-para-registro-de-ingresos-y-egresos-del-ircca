import { ref, computed } from 'vue'
import type { AuditEvent, AuditFilter } from '@/stores/audit'

/**
 * Composable para gestión de filtros de auditoría
 * Centraliza toda la lógica de filtrado, búsqueda y formateo
 */
export function useAuditFilters() {
  // Estado de filtros
  const filtros = ref<{
    fechaInicio: string
    fechaFin: string
    eventType: AuditEvent['eventType'] | null
    userId: string | null
    action: string | null
    soloCriticos: boolean
    soloErrores: boolean
  }>({
    fechaInicio: '',
    fechaFin: '',
    eventType: null,
    userId: null,
    action: null,
    soloCriticos: false,
    soloErrores: false
  })

  // Búsqueda de texto libre
  const busquedaTexto = ref('')

  // Filtro de tiempo rápido (hoy, ayer, semana)
  const filtroTiempo = ref<'hoy' | 'ayer' | 'semana'>('hoy')

  /**
   * Obtiene el rango de fechas según el filtro de tiempo
   */
  function getRangoTiempo(filtro: 'hoy' | 'ayer' | 'semana') {
    const hoy = new Date()
    
    if (filtro === 'hoy') {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
      const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)
      return { inicio, fin }
    } else if (filtro === 'ayer') {
      const ayer = new Date(hoy)
      ayer.setDate(ayer.getDate() - 1)
      return {
        inicio: new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 0, 0, 0),
        fin: new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate(), 23, 59, 59)
      }
    } else { // semana
      const inicio = new Date(hoy)
      inicio.setDate(inicio.getDate() - 7)
      inicio.setHours(0, 0, 0, 0)
      return { inicio, fin: hoy }
    }
  }

  /**
   * Aplica filtros a una lista de eventos
   */
  function aplicarFiltros(eventos: AuditEvent[]): AuditEvent[] {
    let resultado = [...eventos]

    // Filtro por rango de fechas
    if (filtros.value.fechaInicio) {
      const inicio = new Date(filtros.value.fechaInicio)
      inicio.setHours(0, 0, 0, 0)
      resultado = resultado.filter(e => new Date(e.timestamp) >= inicio)
    }

    if (filtros.value.fechaFin) {
      const fin = new Date(filtros.value.fechaFin)
      fin.setHours(23, 59, 59, 999)
      resultado = resultado.filter(e => new Date(e.timestamp) <= fin)
    }

    // Filtro por tipo de evento
    if (filtros.value.eventType) {
      resultado = resultado.filter(e => e.eventType === filtros.value.eventType)
    }

    // Filtro por usuario
    if (filtros.value.userId) {
      resultado = resultado.filter(e => e.userId === filtros.value.userId)
    }

    // Filtro por acción
    if (filtros.value.action) {
      resultado = resultado.filter(e => e.action.includes(filtros.value.action!))
    }

    // Solo críticos
    if (filtros.value.soloCriticos) {
      resultado = resultado.filter(e => 
        e.eventType === 'system_error' || 
        e.action.includes('failed') || 
        e.action.includes('blocked')
      )
    }

    // Solo errores
    if (filtros.value.soloErrores) {
      resultado = resultado.filter(e => 
        e.action.includes('failed') || 
        e.action.includes('error') ||
        e.action.includes('blocked')
      )
    }

    // Búsqueda de texto libre
    if (busquedaTexto.value.trim()) {
      const query = busquedaTexto.value.toLowerCase().trim()
      resultado = resultado.filter(e => {
        const searchableText = [
          e.username,
          e.action,
          e.eventType,
          JSON.stringify(e.details)
        ].join(' ').toLowerCase()
        
        return searchableText.includes(query)
      })
    }

    return resultado
  }

  /**
   * Aplica filtro de tiempo rápido
   */
  function aplicarFiltroTiempo(eventos: AuditEvent[]): AuditEvent[] {
    const rango = getRangoTiempo(filtroTiempo.value)
    return eventos.filter(e => {
      const fecha = new Date(e.timestamp)
      return fecha >= rango.inicio && fecha <= rango.fin
    })
  }

  /**
   * Limpia todos los filtros
   */
  function limpiarFiltros() {
    filtros.value = {
      fechaInicio: '',
      fechaFin: '',
      eventType: null,
      userId: null,
      action: null,
      soloCriticos: false,
      soloErrores: false
    }
    busquedaTexto.value = ''
  }

  /**
   * Convierte filtros a formato AuditFilter para el store
   */
  const filtrosParaStore = computed<AuditFilter>(() => {
    const filter: AuditFilter = {}

    if (filtros.value.fechaInicio) {
      filter.startDate = new Date(filtros.value.fechaInicio)
    }

    if (filtros.value.fechaFin) {
      filter.endDate = new Date(filtros.value.fechaFin)
    }

    if (filtros.value.eventType) {
      filter.eventType = filtros.value.eventType
    }

    if (filtros.value.userId) {
      filter.userId = filtros.value.userId
    }

    if (filtros.value.action) {
      filter.action = filtros.value.action
    }

    return filter
  })

  // Helpers de formateo
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp)
    return date.toLocaleString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('es-UY', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helpers de UI
  function getEventoColor(action: string): string {
    if (action.includes('success')) return 'success'
    if (action.includes('failed') || action.includes('blocked')) return 'error'
    if (action === 'logout') return 'warning'
    if (action.includes('created') || action.includes('modified')) return 'info'
    return 'primary'
  }

  function getEventoIcon(action: string): string {
    if (action.includes('login')) return 'mdi-login'
    if (action === 'logout') return 'mdi-logout'
    if (action.includes('registro')) return 'mdi-file-document-edit'
    if (action.includes('failed')) return 'mdi-alert-circle'
    if (action.includes('user')) return 'mdi-account-cog'
    if (action.includes('backup')) return 'mdi-backup-restore'
    return 'mdi-information'
  }

  function getEventoDescripcion(action: string): string {
    const descripciones: Record<string, string> = {
      'login.success': '✓ Inició sesión',
      'login.failed': '✗ Intento de login fallido',
      'login.blocked': '✗ Cuenta bloqueada por intentos fallidos',
      'logout': 'Cerró sesión',
      'registro.created': '✓ Registró un ingreso',
      'registro.modified': '✓ Registró una salida',
      'user.created': '✓ Creó un usuario',
      'user.modified': '✓ Modificó un usuario',
      'user.deleted': '✗ Eliminó un usuario',
      'backup.created': '✓ Creó un backup',
      'backup.restored': '✓ Restauró un backup'
    }
    // eslint-disable-next-line security/detect-object-injection
    return descripciones[action] || action
  }

  function getEventoTexto(action: string): string {
    const textos: Record<string, string> = {
      'login.success': 'Login Exitoso',
      'login.failed': 'Login Fallido',
      'login.blocked': 'Cuenta Bloqueada',
      'logout': 'Logout',
      'registro.created': 'Ingreso Registrado',
      'registro.modified': 'Salida Registrada',
      'user.created': 'Usuario Creado',
      'user.modified': 'Usuario Modificado',
      'user.deleted': 'Usuario Eliminado',
      'backup.created': 'Backup Creado',
      'backup.restored': 'Backup Restaurado'
    }
    // eslint-disable-next-line security/detect-object-injection
    return textos[action] || action
  }

  function getRoleName(role: string | undefined): string {
    if (!role) return 'N/A'
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'supervisor': 'Supervisor',
      'operador': 'Operador'
    }
    // eslint-disable-next-line security/detect-object-injection
    return roles[role] || role
  }

  function getTipoEventoTexto(eventType: AuditEvent['eventType']): string {
    const tipos: Record<string, string> = {
      'auth': 'Autenticación',
      'user_management': 'Gestión de Usuarios',
      'data_operation': 'Operación de Datos',
      'backup': 'Respaldo',
      'system_error': 'Error del Sistema'
    }
    // eslint-disable-next-line security/detect-object-injection
    return tipos[eventType] || eventType
  }

  // ✅ NUEVAS FUNCIONES DE ENMASCARAMIENTO (Ley 18.331)
  
  /**
   * Enmascara cédula mostrando solo últimos 4 dígitos
   * @param cedula - Cédula completa (ej: "55226350")
   * @returns Cédula enmascarada (ej: "****6350")
   */
  function maskCedula(cedula: string): string {
    if (!cedula || cedula.length < 4) return '****'
    return '****' + cedula.slice(-4)
  }

  /**
   * Enmascara nombre completo mostrando solo iniciales
   * @param nombre - Nombre completo (ej: "Mario Berni")
   * @returns Nombre enmascarado (ej: "M. B.")
   */
  function maskNombre(nombre: string): string {
    if (!nombre) return 'N/A'
    const partes = nombre.trim().split(' ')
    return partes.map(p => p.charAt(0).toUpperCase() + '.').join(' ')
  }

  /**
   * Enmascara userId mostrando solo primeros y últimos 4 caracteres
   * @param userId - ID del usuario (ej: "8W5v5E19EMg0kGk5g-NahA")
   * @returns userId enmascarado (ej: "8W5v***-NahA")
   */
  function maskUserId(userId: string): string {
    if (!userId || userId.length < 8) return '****'
    return userId.slice(0, 4) + '***' + userId.slice(-4)
  }

  /**
   * Verifica si un detalle contiene información sensible que debe enmascararse
   * @param key - Clave del detalle
   * @returns true si debe enmascararse
   */
  function isSensitiveDetail(key: string): boolean {
    const sensitiveKeys = ['nombre', 'cedula', 'documento', 'ci', 'apellido', 'email', 'telefono']
    return sensitiveKeys.some(sk => key.toLowerCase().includes(sk))
  }

  return {
    // Estado
    filtros,
    busquedaTexto,
    filtroTiempo,
    
    // Computed
    filtrosParaStore,
    
    // Métodos de filtrado
    aplicarFiltros,
    aplicarFiltroTiempo,
    limpiarFiltros,
    getRangoTiempo,
    
    // Helpers de formateo
    formatTimestamp,
    formatTime,
    formatDate,
    
    // Helpers de UI
    getEventoColor,
    getEventoIcon,
    getEventoDescripcion,
    getEventoTexto,
    getRoleName,
    getTipoEventoTexto,
    
    // ✅ Helpers de enmascaramiento (Ley 18.331)
    maskCedula,
    maskNombre,
    maskUserId,
    isSensitiveDetail
  }
}
