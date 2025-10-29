/**
 * Definiciones de TypeScript para Fully Kiosk Browser JavaScript Interface
 * 
 * Documentación oficial: https://www.fully-kiosk.com/en/#javascript
 * 
 * Solo incluye los métodos que usamos en el proyecto.
 * Agregar más métodos según sea necesario.
 */

interface FullyKiosk {
  /**
   * Establece el brillo de la pantalla
   * @param value Valor de brillo (0-255)
   */
  setScreenBrightness(value: number): void

  /**
   * Obtiene el brillo actual de la pantalla
   * @returns Valor de brillo (0-255)
   */
  getScreenBrightness(): number

  /**
   * Inicia una aplicación de Android
   * @param packageName Nombre del paquete de la aplicación
   * @param action Acción opcional (ej: 'android.settings.WIFI_SETTINGS')
   */
  startApplication(packageName: string, action?: string): void

  /**
   * Obtiene información del dispositivo
   * @returns Información del dispositivo en formato JSON
   */
  getDeviceInfo(): string

  /**
   * Obtiene la versión de Fully Kiosk
   * @returns Versión de Fully Kiosk
   */
  getFullyVersion(): string

  /**
   * Verifica si tiene licencia PLUS
   * @returns true si tiene licencia PLUS
   */
  isPlus(): boolean

  /**
   * Reproduce un sonido
   * @param url URL del archivo de sonido
   */
  playSound(url: string): void

  /**
   * Detiene la reproducción de sonido
   */
  stopSound(): void

  /**
   * Vibra el dispositivo
   * @param duration Duración en milisegundos
   */
  vibrate(duration: number): void

  /**
   * Muestra un toast (mensaje temporal)
   * @param message Mensaje a mostrar
   */
  showToast(message: string): void

  /**
   * Obtiene la dirección IP del dispositivo
   * @returns Dirección IP
   */
  getIp4Address(): string

  /**
   * Obtiene el nivel de batería
   * @returns Nivel de batería (0-100)
   */
  getBatteryLevel(): number

  /**
   * Verifica si está cargando
   * @returns true si está conectado a cargador
   */
  isPlugged(): boolean

  /**
   * Bloquea la pantalla
   */
  lockScreen(): void

  /**
   * Desbloquea la pantalla
   */
  unlockScreen(): void

  /**
   * Apaga la pantalla
   */
  screenOff(): void

  /**
   * Enciende la pantalla
   */
  screenOn(): void

  /**
   * Reinicia la aplicación
   */
  restartApp(): void

  /**
   * Sale de la aplicación
   */
  exitApp(): void

  /**
   * Obtiene el ID del dispositivo
   * @returns ID único del dispositivo
   */
  getDeviceId(): string
}

/**
 * Extensión de la interfaz Window para incluir Fully Kiosk
 */
declare global {
  interface Window {
    /**
     * Objeto Fully Kiosk (solo disponible en Fully Kiosk Browser)
     */
    fully?: FullyKiosk
  }
}

export {}
