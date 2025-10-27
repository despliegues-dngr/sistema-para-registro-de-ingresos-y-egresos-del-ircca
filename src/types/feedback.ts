/**
 * Tipos para el sistema de feedback de usuarios
 * Version 5 - Sistema de encuestas contextuales
 */

export interface FeedbackEntry {
  id: string  // UUID
  userId: string  // ID del usuario que completó la encuesta
  username: string  // Cédula (para auditoría)
  timestamp: string  // ISO date cuando completó
  rating: number  // 1-5 estrellas (rating general)
  // ✅ Preguntas específicas (escala 1-5)
  velocidadScore: number  // Velocidad y rendimiento
  facilidadScore: number  // Facilidad de uso
  implementacionScore: number  // Opinión sobre implementación en otros servicios
  impactoScore: number  // Impacto en flujo de trabajo
  comentarios?: string  // Comentarios opcionales del usuario
  totalRegistrosAlMomento: number  // Cuántos registros tenía cuando completó
  // Metadatos adicionales
  userRole: string  // Rol del usuario (operador, supervisor, admin)
  sessionId?: string  // ID de sesión para tracking
}

export interface FeedbackModalAction {
  type: 'complete' | 'postpone' | 'dismiss'
  rating?: number
  comentarios?: string
}

export interface FeedbackStats {
  totalRespuestas: number
  promedioRating: number
  distribucionRatings: Record<number, number>  // { 1: 5, 2: 10, 3: 15, 4: 20, 5: 50 }
  ultimaEncuesta: string | null
}
