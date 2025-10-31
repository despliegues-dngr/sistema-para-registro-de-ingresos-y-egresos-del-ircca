/**
 * Composable para formateo y validación de cédulas uruguayas
 * Formato: 5.522.635-0 (X.XXX.XXX-X)
 */
export function useCedulaFormat() {
  
  /**
   * Formatea una cédula numérica al formato uruguayo X.XXX.XXX-X
   * @param cedula - Cédula como string o number (8 dígitos)
   * @returns Cédula formateada o string vacío si es inválida
   */
  function formatCedula(cedula: string | number): string {
    if (!cedula) return ''
    
    // Convertir a string y limpiar caracteres no numéricos
    const cedulaStr = cedula.toString().replace(/\D/g, '')
    
    // Validar que tenga exactamente 8 dígitos
    if (cedulaStr.length !== 8) return cedulaStr
    
    // Aplicar formato uruguayo: X.XXX.XXX-X
    const formatted = cedulaStr.replace(
      /^(\d{1})(\d{3})(\d{3})(\d{1})$/,
      '$1.$2.$3-$4'
    )
    
    return formatted
  }
  
  /**
   * Limpia una cédula formateada y devuelve solo números
   * @param cedulaFormateada - Cédula con formato X.XXX.XXX-X
   * @returns Solo los 8 dígitos numéricos
   */
  function cleanCedula(cedulaFormateada: string): string {
    if (!cedulaFormateada) return ''
    return cedulaFormateada.replace(/\D/g, '')
  }
  
  /**
   * Valida si una cédula tiene el formato correcto (8 dígitos)
   * @param cedula - Cédula a validar
   * @returns true si es válida
   */
  function isValidCedula(cedula: string | number): boolean {
    if (!cedula) return false
    const cleaned = cedula.toString().replace(/\D/g, '')
    return cleaned.length === 8 && /^\d{8}$/.test(cleaned)
  }
  
  /**
   * Formatea cédula mientras el usuario escribe (para inputs)
   * Permite entrada progresiva: 1 -> 1.2 -> 1.23 -> 1.234 -> 1.234.5 etc.
   * @param value - Valor actual del input
   * @returns Valor formateado progresivamente
   */
  function formatCedulaInput(value: string): string {
    if (!value) return ''
    
    // Limpiar caracteres no numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Limitar a 8 dígitos máximo
    const limited = numbers.slice(0, 8)
    
    // Aplicar formato progresivo
    if (limited.length <= 1) {
      return limited
    } else if (limited.length <= 4) {
      return limited.replace(/^(\d{1})(\d{0,3})/, '$1.$2')
    } else if (limited.length <= 7) {
      return limited.replace(/^(\d{1})(\d{3})(\d{0,3})/, '$1.$2.$3')
    } else {
      return limited.replace(/^(\d{1})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
    }
  }
  
  /**
   * Máscara de input para cédula uruguaya
   * Usar con v-model en inputs para formateo automático
   */
  function createCedulaMask() {
    return {
      mask: '#.###.###-#',
      placeholder: '_',
      definitions: {
        '#': /[0-9]/
      }
    }
  }
  
  return {
    formatCedula,
    cleanCedula,
    isValidCedula,
    formatCedulaInput,
    createCedulaMask
  }
}
