/**
 * Utilidades para manejo de grados militares
 * Conversión entre formatos completos y códigos numéricos
 */

// Mapeo de grados a códigos numéricos (G1-G10)
export const GRADO_CODES: Record<string, string> = {
  // Valores guardados en BD (snake_case)
  'guardia_republicano': 'G1',
  'cabo': 'G2',
  'sargento': 'G3',
  'sub_oficial': 'G4',
  'alferez': 'G5',
  'teniente': 'G6',
  'tte_primero': 'G7',
  'capitan': 'G8',
  'cte_mayor': 'G9',
  'cte_general': 'G10',
  
  // Valores legacy (texto completo - para compatibilidad)
  'Guardia Republicano': 'G1',
  'Cabo': 'G2',
  'Sargento': 'G3',
  'Sub Oficial': 'G4',
  'Alférez': 'G5',
  'Alferez': 'G5', // Sin tilde
  'Teniente': 'G6',
  'Tte. 1°': 'G7',
  'Capitán': 'G8',
  'Capitan': 'G8', // Sin tilde
  'Cte. Mayor': 'G9',
  'Cte. General': 'G10',
  
  // Casos especiales
  'Encargado': 'ENC', // Para supervisores no militares
  'encargado': 'ENC',
}

// Mapeo inverso: códigos a nombres completos
export const CODE_TO_GRADO: Record<string, string> = {
  'G1': 'Guardia Republicano',
  'G2': 'Cabo',
  'G3': 'Sargento',
  'G4': 'Sub Oficial',
  'G5': 'Alférez',
  'G6': 'Teniente',
  'G7': 'Tte. 1°',
  'G8': 'Capitán',
  'G9': 'Cte. Mayor',
  'G10': 'Cte. General',
  'ENC': 'Encargado',
}

/**
 * Convierte un grado (value o title) a su código numérico
 * @param grado - Grado en cualquier formato
 * @returns Código de grado (G1-G10) o el grado original si no se encuentra
 * 
 * @example
 * gradoToCode('guardia_republicano') // 'G1'
 * gradoToCode('Guardia Republicano') // 'G1'
 * gradoToCode('cabo') // 'G2'
 */
export function gradoToCode(grado: string): string {
  if (!grado) return '?'
  
  // Buscar en el mapeo
  // eslint-disable-next-line security/detect-object-injection -- Safe: GRADO_CODES is a typed Record, grado is validated string
  const code = GRADO_CODES[grado]
  
  // Si no se encuentra, intentar normalizar (quitar tildes, mayúsculas)
  if (!code) {
    const normalized = grado
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .toLowerCase()
      .replace(/\s+/g, '_') // Espacios a guiones bajos
    
    // eslint-disable-next-line security/detect-object-injection -- Safe: normalized is sanitized string, GRADO_CODES is typed Record
    return GRADO_CODES[normalized] || grado // Fallback al grado original
  }
  
  return code
}

/**
 * Convierte un código de grado a su nombre completo
 * @param code - Código de grado (G1-G10)
 * @returns Nombre completo del grado
 * 
 * @example
 * codeToGrado('G1') // 'Guardia Republicano'
 * codeToGrado('G5') // 'Alférez'
 */
export function codeToGrado(code: string): string {
  return CODE_TO_GRADO[code.toUpperCase()] || code
}

/**
 * Formatea el responsable para el PDF (código + nombre + apellido)
 * @param grado - Grado del operador
 * @param nombre - Nombre del operador
 * @param apellido - Apellido del operador (opcional)
 * @returns String formateado "G1 Mario Berni" o "Desconocido"
 * 
 * @example
 * formatResponsable('guardia_republicano', 'Mario', 'Berni') // 'G1 Mario Berni'
 * formatResponsable('Cabo', 'Juan', 'Pérez') // 'G2 Juan Pérez'
 */
export function formatResponsable(grado: string | undefined, nombre: string | undefined, apellido?: string): string {
  if (!grado || !nombre) return 'Desconocido'
  
  const code = gradoToCode(grado)
  const fullName = apellido ? `${nombre} ${apellido}` : nombre
  return `${code} ${fullName}`
}
