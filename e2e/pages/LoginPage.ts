import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model para la página de Login
 * Encapsula todos los selectores y acciones relacionadas con el login
 */
export class LoginPage {
  readonly page: Page
  
  // Selectores de elementos
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly passwordToggleButton: Locator
  readonly alertMessage: Locator
  readonly successAlert: Locator
  readonly errorAlert: Locator
  readonly loadingIndicator: Locator
  readonly helpButton: Locator
  readonly registerButton: Locator

  constructor(page: Page) {
    this.page = page
    
    // Selectores pragmáticos - CSS específicos (más estables en Vuetify)
    this.usernameInput = page.locator('.v-text-field input[type="text"]').first()
    this.passwordInput = page.locator('.v-text-field input[type="password"]').first()
    this.submitButton = page.locator('button[type="submit"]')
    this.passwordToggleButton = page.locator('.v-field__append-inner .v-icon')
    
    // Alerts - Vuetify v-alert genera role="alert" automáticamente
    this.alertMessage = page.getByRole('alert')
    this.successAlert = page.getByRole('alert') // Detectar cualquier alert visible
    this.errorAlert = page.getByRole('alert')   // Detectar cualquier alert visible
    
    this.loadingIndicator = page.locator('.v-btn--loading')
    this.helpButton = page.getByRole('button', { name: /ayuda/i })
    this.registerButton = page.getByRole('button', { name: /registrar/i })
  }

  /**
   * Navega a la página de login
   */
  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Realiza el proceso completo de login
   * @param username - Usuario (cédula)
   * @param password - Contraseña
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  /**
   * Completa solo el campo de usuario
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username)
  }

  /**
   * Completa solo el campo de contraseña
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  /**
   * Hace clic en el botón de submit
   */
  async clickSubmit() {
    await this.submitButton.click()
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  async togglePasswordVisibility() {
    await this.passwordToggleButton.click()
  }

  /**
   * Espera un mensaje de error específico
   * @param message - Mensaje de error esperado (parcial)
   */
  async expectErrorMessage(message: string) {
    // Esperar a que aparezca el alert (puede tardar por operación async)
    await expect(this.errorAlert).toBeVisible({ timeout: 10000 })
    await expect(this.errorAlert).toContainText(message)
  }

  /**
   * Verifica que se muestra un mensaje de éxito
   */
  async expectSuccessMessage(message: string) {
    await expect(this.successAlert).toBeVisible()
    await expect(this.successAlert).toContainText(message)
  }

  /**
   * Verifica que el botón de submit está deshabilitado
   */
  async expectSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled()
  }

  /**
   * Verifica que el botón de submit está habilitado
   */
  async expectSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled()
  }

  /**
   * Verifica que se muestra el indicador de loading
   */
  async expectLoading() {
    await expect(this.loadingIndicator).toBeVisible()
  }

  /**
   * Espera a que se complete la navegación al dashboard
   */
  async expectNavigationToDashboard() {
    await this.page.waitForURL('**/dashboard', { timeout: 5000 })
    await expect(this.page).toHaveURL(/\/dashboard/)
  }

  /**
   * Verifica que el formulario está en la página
   */
  async expectFormVisible() {
    await expect(this.usernameInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  /**
   * Limpia todos los campos del formulario
   */
  async clearForm() {
    await this.usernameInput.clear()
    await this.passwordInput.clear()
  }

  /**
   * Obtiene el valor actual del campo de usuario
   */
  async getUsernameValue(): Promise<string> {
    return await this.usernameInput.inputValue()
  }

  /**
   * Obtiene el valor actual del campo de contraseña
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue()
  }

  /**
   * Verifica que el campo de usuario tiene autofocus
   */
  async expectUsernameFocused() {
    await expect(this.usernameInput).toBeFocused()
  }
}
