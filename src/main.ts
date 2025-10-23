import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { initializeDefaultAdmin, initializeDefaultSupervisor } from './utils/initializeAdmin'

// ⚡ PERFORMANCE: Importar optimizaciones CSS para tablets
import './assets/styles/performance-optimizations.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// ✅ SOLUCIÓN: Inicializar usuarios por defecto en TODOS los entornos
// Se ejecuta solo si no existen (verificación interna en las funciones)
initializeDefaultAdmin().catch(console.error)
initializeDefaultSupervisor().catch(console.error)

// ✅ FIX: Asegurar que el DOM esté completamente cargado antes de montar
// Previene errores de getBoundingClientRect en producción minificada
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.mount('#app'))
} else {
  app.mount('#app')
}
