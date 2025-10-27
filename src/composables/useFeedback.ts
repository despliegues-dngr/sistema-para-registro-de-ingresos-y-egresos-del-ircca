/**
 * Composable para gestionar el sistema de feedback de usuarios
 * Maneja lógica de conteo, triggers de encuestas y almacenamiento
 * 
 * ⚠️ SINGLETON: Este composable mantiene estado compartido entre todas las instancias
 */

import { ref, computed } from 'vue'
import { useDatabase } from './useDatabase'
import { useAuthStore } from '@/stores/auth'
import { useAuditStore } from '@/stores/audit'
import type { FeedbackEntry, FeedbackModalAction } from '@/types/feedback'
import type { StoredUser } from '@/stores/auth'
import { FEEDBACK_CONFIG } from '@/config/constants'

// ✅ SINGLETON: Estado compartido fuera de la función
const showFeedbackModal = ref(false)
const isSubmitting = ref(false)

export function useFeedback() {
  const db = useDatabase()
  const authStore = useAuthStore()
  const auditStore = useAuditStore()

  /**
   * Verifica si debe mostrar el modal de feedback
   */
  const deberiasMostrarEncuesta = computed(() => {
    if (!authStore.user) return false

    const userId = authStore.user.id
    
    // Obtener usuario de BD para verificar campos de feedback
    return checkFeedbackTrigger(userId)
  })

  /**
   * Verifica condiciones para mostrar encuesta
   */
  async function checkFeedbackTrigger(userId: string): Promise<boolean> {
    try {
      const usuario = await db.getRecord('usuarios', userId) as StoredUser | undefined
      
      if (!usuario) return false

      // ❌ NO mostrar si ya completó la encuesta
      if (usuario.encuestaCompletada) return false
      
      // ❌ NO mostrar si dijo "No volver a preguntar"
      if (usuario.encuestaDismissed) return false
      
      const totalRegistros = usuario.totalRegistrosRealizados || 0
      
      // ✅ Mostrar si llegó exactamente a 50 registros (primera vez)
      if (totalRegistros === FEEDBACK_CONFIG.THRESHOLD) return true
      
      // ✅ Mostrar cada 10 registros si dijo "Más tarde"
      if (usuario.encuestaPostpuesta && 
          totalRegistros > FEEDBACK_CONFIG.THRESHOLD &&
          totalRegistros % FEEDBACK_CONFIG.REMINDER_INTERVAL === 0 &&
          totalRegistros > (usuario.ultimoRecordatorioEn || 0)) {
        return true
      }
      
      return false
    } catch {
      return false
    }
  }

  /**
   * Incrementa el contador de registros del usuario
   * Se llama automáticamente después de crear un registro
   */
  async function incrementarContadorRegistros(userId: string): Promise<void> {
    try {
      const usuario = await db.getRecord('usuarios', userId) as StoredUser | undefined
      
      if (!usuario) {
        console.warn(`Usuario ${userId} no encontrado para incrementar contador de feedback`)
        return
      }

      // ✅ SIMPLIFICADO: Incrementar contador (campos ya inicializados en creación)
      const nuevoTotal = (usuario.totalRegistrosRealizados || 0) + 1
      
      await db.updateRecord('usuarios', userId, {
        ...usuario,
        totalRegistrosRealizados: nuevoTotal
      })

      // Verificar si debe mostrar encuesta
      const debeMostrar = await checkFeedbackTrigger(userId)
      
      if (debeMostrar) {
        // Delay configurable para mejor UX (default: 2 segundos)
        setTimeout(() => {
          showFeedbackModal.value = true
        }, FEEDBACK_CONFIG.MODAL_DELAY_MS)
      }

    } catch (error) {
      console.error('Error incrementando contador de feedback:', error)
    }
  }

  /**
   * Guarda la respuesta de la encuesta completa con preguntas específicas
   */
  async function guardarEncuestaCompleta(
    rating: number,
    velocidadScore: number,
    facilidadScore: number,
    implementacionScore: number,
    impactoScore: number,
    comentarios?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!authStore.user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    isSubmitting.value = true

    try {
      const userId = authStore.user.id
      const usuario = await db.getRecord('usuarios', userId) as StoredUser | undefined
      
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      // 1. Guardar respuesta en store de feedback
      const feedbackEntry: FeedbackEntry = {
        id: crypto.randomUUID(),
        userId,
        username: usuario.username,
        timestamp: new Date().toISOString(),
        rating,
        velocidadScore,
        facilidadScore,
        implementacionScore,
        impactoScore,
        comentarios,
        totalRegistrosAlMomento: usuario.totalRegistrosRealizados || 0,
        userRole: usuario.role,
        sessionId: crypto.randomUUID()
      }

      await db.addRecord('feedback_usuarios', feedbackEntry as unknown as Record<string, unknown>)
      
      // 2. Marcar encuesta como completada
      await db.updateRecord('usuarios', userId, {
        ...usuario,
        encuestaCompletada: true,
        fechaEncuesta: new Date().toISOString(),
        encuestaPostpuesta: false,
        encuestaDismissed: false
      })
      
      // 3. Registrar en auditoría
      await auditStore.logEvent({
        userId,
        username: usuario.username,
        eventType: 'data_operation',
        action: 'feedback_completed',
        details: { 
          rating,
          velocidadScore,
          facilidadScore,
          implementacionScore,
          impactoScore,
          totalRegistros: usuario.totalRegistrosRealizados,
          tieneComentarios: !!comentarios
        },
        sessionId: feedbackEntry.sessionId || undefined
      })

      showFeedbackModal.value = false
      return { success: true }

    } catch (error) {
      console.error('Error guardando encuesta:', error)
      return { success: false, error: 'Error al guardar la encuesta' }
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Guarda la respuesta de la encuesta (versión simple - retrocompatibilidad)
   */
  async function guardarEncuesta(
    rating: number, 
    comentarios?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!authStore.user) {
      return { success: false, error: 'Usuario no autenticado' }
    }

    isSubmitting.value = true

    try {
      const userId = authStore.user.id
      const usuario = await db.getRecord('usuarios', userId) as StoredUser | undefined
      
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      // 1. Guardar respuesta en store de feedback
      const feedbackEntry: FeedbackEntry = {
        id: crypto.randomUUID(),
        userId,
        username: usuario.username,
        timestamp: new Date().toISOString(),
        rating,
        velocidadScore: 3, // Valor por defecto para retrocompatibilidad
        facilidadScore: 3,
        implementacionScore: 3,
        impactoScore: 3,
        comentarios,
        totalRegistrosAlMomento: usuario.totalRegistrosRealizados || 0,
        userRole: usuario.role,
        sessionId: crypto.randomUUID()
      }

      await db.addRecord('feedback_usuarios', feedbackEntry as unknown as Record<string, unknown>)
      
      // 2. Marcar encuesta como completada
      await db.updateRecord('usuarios', userId, {
        ...usuario,
        encuestaCompletada: true,
        fechaEncuesta: new Date().toISOString(),
        encuestaPostpuesta: false,
        encuestaDismissed: false
      })
      
      // 3. Registrar en auditoría
      await auditStore.logEvent({
        userId,
        username: usuario.username,
        eventType: 'data_operation',
        action: 'feedback_completed',
        details: { 
          rating, 
          totalRegistros: usuario.totalRegistrosRealizados,
          tieneComentarios: !!comentarios
        },
        sessionId: feedbackEntry.sessionId || undefined
      })

      showFeedbackModal.value = false
      return { success: true }

    } catch (error) {
      console.error('Error guardando encuesta:', error)
      return { success: false, error: 'Error al guardar la encuesta' }
    } finally {
      isSubmitting.value = false
    }
  }

  /**
   * Maneja la acción de "Recordarme más tarde"
   */
  async function postponerEncuesta(): Promise<void> {
    if (!authStore.user) return

    try {
      const userId = authStore.user.id
      const usuario = await db.getRecord('usuarios', userId) as StoredUser | undefined
      
      if (!usuario) return

      await db.updateRecord('usuarios', userId, {
        ...usuario,
        encuestaPostpuesta: true,
        ultimoRecordatorioEn: usuario.totalRegistrosRealizados || 0
      })

      // Registrar en auditoría
      await auditStore.logEvent({
        userId,
        username: usuario.username,
        eventType: 'data_operation',
        action: 'feedback_postponed',
        details: { totalRegistros: usuario.totalRegistrosRealizados },
        sessionId: crypto.randomUUID()
      })

      showFeedbackModal.value = false
    } catch (error) {
      console.error('Error postponiendo encuesta:', error)
    }
  }

  /**
   * Maneja la acción de "No volver a preguntar"
   */
  async function dismissEncuesta(): Promise<void> {
    if (!authStore.user) return

    try {
      const userId = authStore.user.id
      const usuario = await db.getRecord('usuarios', userId) as StoredUser | undefined
      
      if (!usuario) return

      await db.updateRecord('usuarios', userId, {
        ...usuario,
        encuestaDismissed: true,
        encuestaPostpuesta: false
      })

      // Registrar en auditoría
      await auditStore.logEvent({
        userId,
        username: usuario.username,
        eventType: 'data_operation',
        action: 'feedback_dismissed',
        details: { totalRegistros: usuario.totalRegistrosRealizados },
        sessionId: crypto.randomUUID()
      })

      showFeedbackModal.value = false
    } catch (error) {
      console.error('Error dismissing encuesta:', error)
    }
  }

  /**
   * Maneja la acción del modal según el tipo
   */
  async function handleFeedbackAction(action: FeedbackModalAction): Promise<{ success: boolean; error?: string }> {
    switch (action.type) {
      case 'complete':
        if (action.rating === undefined) {
          return { success: false, error: 'Rating es requerido' }
        }
        return await guardarEncuesta(action.rating, action.comentarios)
      
      case 'postpone':
        await postponerEncuesta()
        return { success: true }
      
      case 'dismiss':
        await dismissEncuesta()
        return { success: true }
      
      default:
        return { success: false, error: 'Acción no reconocida' }
    }
  }

  /**
   * Obtiene estadísticas de feedback (para admin/supervisor)
   */
  async function getFeedbackStats(): Promise<{
    totalRespuestas: number
    promedioRating: number
    distribucionRatings: Record<number, number>
  }> {
    try {
      const feedbacks = await db.getRecords('feedback_usuarios') as FeedbackEntry[]
      
      if (feedbacks.length === 0) {
        return {
          totalRespuestas: 0,
          promedioRating: 0,
          distribucionRatings: {}
        }
      }

      const distribucionRatings: Record<number, number> = {}
      let sumaRatings = 0

      feedbacks.forEach(feedback => {
        sumaRatings += feedback.rating
        distribucionRatings[feedback.rating] = (distribucionRatings[feedback.rating] || 0) + 1
      })

      return {
        totalRespuestas: feedbacks.length,
        promedioRating: sumaRatings / feedbacks.length,
        distribucionRatings
      }
    } catch {
      return {
        totalRespuestas: 0,
        promedioRating: 0,
        distribucionRatings: {}
      }
    }
  }

  return {
    // State
    showFeedbackModal,
    isSubmitting,
    deberiasMostrarEncuesta,
    // Methods
    incrementarContadorRegistros,
    handleFeedbackAction,
    guardarEncuesta,
    guardarEncuestaCompleta,
    postponerEncuesta,
    dismissEncuesta,
    getFeedbackStats
  }
}
