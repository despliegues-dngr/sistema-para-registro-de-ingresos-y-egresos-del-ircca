/**
 * Composable para configuración de seguridad en ambiente kiosko
 * Previene guardado de credenciales y manejo de memoria sensible
 * 
 * PARA TESTING EN DESARROLLO:
 * - Agregar ?kiosk=true a la URL para activar modo kiosko manualmente
 * - Ejemplo: http://localhost:5173/?kiosk=true
 * - En producción se activa automáticamente según el entorno
 */

import { onMounted, onUnmounted } from 'vue'

export function useKioskSecurity() {
  // Detectar si estamos en modo kiosko o ambiente compartido
  const isKioskMode = (): boolean => {
    // En desarrollo, nunca activar modo kiosko a menos que sea explícito
    if (import.meta.env.DEV) {
      // Solo activar en desarrollo si está explícitamente en la URL
      return window.location.href.includes('kiosk=true') || 
             window.location.href.includes('kiosk-mode')
    }
    
    // En producción, detectar indicadores reales de modo kiosko
    const kioskIndicators = [
      // URL específicas de kiosko
      window.location.href.includes('kiosk'),
      // User agent específico de kiosko (tablets institucionales)
      navigator.userAgent.includes('Kiosk') || 
      navigator.userAgent.includes('WebView') ||
      navigator.userAgent.includes('KioskBrowser'),
      // Fullscreen API activo (más específico que screen height)
      document.fullscreenElement !== null,
      // Variables de entorno específicas de kiosko
      window.location.hostname === 'kiosk.ircca.local' ||
      window.location.hostname.includes('tablet')
    ]
    
    return kioskIndicators.some(indicator => indicator)
  }

  // Prevenir guardado de passwords en navegador
  const preventPasswordSaving = () => {
    // Agregar meta tags dinámicamente para prevenir autocompletado
    const preventAutocompleteMeta = document.createElement('meta')
    preventAutocompleteMeta.name = 'autocomplete'
    preventAutocompleteMeta.content = 'off'
    document.head.appendChild(preventAutocompleteMeta)

    // Deshabilitar autocompletado en formularios existentes
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      form.setAttribute('autocomplete', 'off')
    })

    // Interceptar intentos de guardado de passwords
    window.addEventListener('beforeunload', clearSensitiveData)
  }

  // Limpiar datos sensibles de memoria
  const clearSensitiveData = () => {
    // Limpiar localStorage de datos temporales (no la sesión principal)
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('temp') || key?.includes('cache')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))

    // Limpiar campos de password en DOM
    const passwordFields = document.querySelectorAll('input[type="password"]')
    passwordFields.forEach(field => {
      (field as HTMLInputElement).value = ''
    })
  }

  // Configuración específica para modo kiosko
  const configureKioskMode = () => {
    const kioskActive = isKioskMode()
    
    if (kioskActive) {
      // Deshabilitar clic derecho
      document.addEventListener('contextmenu', (e) => e.preventDefault())
      
      // Deshabilitar selección de texto (opcional)
      document.addEventListener('selectstart', (e) => e.preventDefault())
      
      // Deshabilitar drag and drop
      document.addEventListener('dragstart', (e) => e.preventDefault())
      
      // Limpiar datos cada 5 minutos en modo kiosko
      const kioskCleanInterval = setInterval(clearSensitiveData, 5 * 60 * 1000)
      
      return () => clearInterval(kioskCleanInterval)
    }
    return () => {}
  }

  // Configuración anti-autocompletado para campos específicos
  const getSecureFieldAttributes = () => ({
    autocomplete: 'new-password', // Truco para evitar autocompletado
    'data-form-type': 'other',     // Evitar detección de login form
    spellcheck: false,
    autoCorrect: 'off',
    autoCapitalize: 'off',
    readonly: false, // Evitar readonly que algunos navegadores ignoran
  })

  // Lifecycle hooks
  onMounted(() => {
    preventPasswordSaving()
    const cleanupKiosk = configureKioskMode()
    
    // Cleanup al desmontar
    onUnmounted(() => {
      cleanupKiosk()
      clearSensitiveData()
    })
  })

  return {
    isKioskMode: isKioskMode(),
    clearSensitiveData,
    getSecureFieldAttributes,
    preventPasswordSaving,
  }
}
