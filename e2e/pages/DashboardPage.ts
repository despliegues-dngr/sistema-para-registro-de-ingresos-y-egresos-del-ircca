import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model para la página de Dashboard
 * Encapsula selectores y acciones del dashboard principal
 */
export class DashboardPage {
  readonly page: Page
  
  // Elementos principales
  readonly welcomeHeader: Locator
  readonly userMenu: Locator
  readonly logoutButton: Locator
  readonly peopleInsideCount: Locator
  readonly vehiclesInsideCount: Locator
  
  // Botones de acción
  readonly registroIngresoButton: Locator
  readonly registroSalidaButton: Locator
  
  // Stats cards
  readonly peopleStatsCard: Locator
  readonly vehicleStatsCard: Locator

  constructor(page: Page) {
    this.page = page
    
    // Selectores principales - Usando best practices de Playwright (user-facing attributes)
    // Buscar el header por texto visible constante "IRCCA - Control de Accesos"
    this.welcomeHeader = page.getByText(/IRCCA.*Control de Accesos/i)
    // El avatar del usuario que abre el menú dropdown
    this.userMenu = page.locator('.user-avatar').first()
    // El logout es un v-list-item, no un button - buscar por texto "Cerrar Sesión"
    this.logoutButton = page.getByText('Cerrar Sesión', { exact: true })
    
    // Stats
    this.peopleInsideCount = page.locator('[data-testid="people-inside-count"]').or(
      page.locator('.v-card').filter({ hasText: /personas dentro/i }).locator('.text-h4, .text-h3').first()
    )
    this.vehiclesInsideCount = page.locator('[data-testid="vehicles-inside-count"]').or(
      page.locator('.v-card').filter({ hasText: /vehículos/i }).locator('.text-h4, .text-h3').first()
    )
    
    // Botones de acción
    this.registroIngresoButton = page.getByRole('button', { name: /registrar ingreso/i })
    this.registroSalidaButton = page.getByRole('button', { name: /registrar salida/i })
    
    // Cards
    this.peopleStatsCard = page.locator('.v-card').filter({ hasText: /personas/i })
    this.vehicleStatsCard = page.locator('.v-card').filter({ hasText: /vehículos/i })
  }

  /**
   * Navega directamente al dashboard (requiere estar autenticado)
   */
  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Verifica que el usuario está en el dashboard
   */
  async expectToBeDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/)
    await expect(this.welcomeHeader).toBeVisible()
  }

  /**
   * Hace logout del sistema
   */
  async logout() {
    // Abrir el menú desplegable del usuario haciendo click en el avatar
    await this.userMenu.click()
    
    // ⏱️ WEBKIT FIX: Esperar a que termine la animación de v-menu
    // WebKit renderiza animaciones CSS más lentamente que Chromium
    // La transición de Vuetify toma ~500-800ms en WebKit
    await this.page.waitForTimeout(1000)
    
    // Click en "Cerrar Sesión" dentro del menú
    await this.logoutButton.click()
    
    // Esperar redirección a login
    await this.page.waitForURL(/\/login/, { timeout: 5000 })
  }

  /**
   * Abre el diálogo de registro de ingreso
   */
  async openRegistroIngresoDialog() {
    await this.registroIngresoButton.click()
    // Esperar a que se abra el modal
    await this.page.locator('.v-dialog').waitFor({ state: 'visible' })
  }

  /**
   * Abre el diálogo de registro de salida
   */
  async openRegistroSalidaDialog() {
    await this.registroSalidaButton.click()
    // Esperar a que se abra el modal
    await this.page.locator('.v-dialog').waitFor({ state: 'visible' })
  }

  /**
   * Verifica el número de personas dentro
   */
  async expectPeopleInsideCount(count: number) {
    await expect(this.peopleInsideCount).toContainText(count.toString())
  }

  /**
   * Verifica que las stats cards están visibles
   */
  async expectStatsCardsVisible() {
    await expect(this.peopleStatsCard).toBeVisible()
    await expect(this.vehicleStatsCard).toBeVisible()
  }

  /**
   * Verifica que se muestra un mensaje toast de éxito
   */
  async expectSuccessToast(message?: string) {
    const toast = this.page.locator('.v-snackbar, .v-alert--type-success')
    await expect(toast).toBeVisible({ timeout: 3000 })
    
    if (message) {
      await expect(toast).toContainText(message)
    }
  }
}
