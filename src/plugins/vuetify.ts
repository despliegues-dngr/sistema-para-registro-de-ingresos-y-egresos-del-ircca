// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

// Tema gubernamental IRCCA
const ircaTheme = {
  dark: false,
  colors: {
    // Colores primarios institucionales
    primary: '#1565C0',        // Azul gubernamental Uruguay
    secondary: '#424242',      // Gris neutro
    accent: '#00695C',         // Verde institucional
    
    // Estados y notificaciones
    success: '#2E7D32',        // Verde éxito
    warning: '#F57C00',        // Naranja advertencia
    error: '#C62828',          // Rojo error
    info: '#1976D2',           // Azul informativo
    
    // Superficies y fondos
    surface: '#FFFFFF',        // Superficie blanca
    background: '#F5F5F5',     // Fondo gris claro
    'on-primary': '#FFFFFF',   // Texto sobre primario
    'on-secondary': '#FFFFFF', // Texto sobre secundario
    'on-surface': '#212121',   // Texto sobre superficie
    'on-background': '#212121' // Texto sobre fondo
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'ircca',
    themes: {
      ircca: ircaTheme
    }
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'flat'
    },
    VAppBar: {
      color: 'primary'
    },
    VCard: {
      elevation: 2
    }
  }
})
