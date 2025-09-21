import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { initializeDefaultAdmin } from './utils/initializeAdmin'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

// Inicializar usuario administrador en desarrollo
if (import.meta.env.DEV) {
  initializeDefaultAdmin().catch(console.error)
}

app.mount('#app')
