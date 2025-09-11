// Vuetify Configuration - Following Official Documentation
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Material Design Icons
import '@mdi/font/css/materialdesignicons.css'

// IRCCA Custom Theme - Following Official Theme Structure
export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'ircca',
    themes: {
      ircca: {
        dark: false,
        colors: {
          // Core institutional colors
          primary: '#1565C0',
          secondary: '#424242', 
          accent: '#00695C',
          error: '#C62828',
          info: '#1976D2',
          success: '#2E7D32',
          warning: '#F57C00',
          // Surface and background colors
          background: '#F5F5F5',
          surface: '#FFFFFF',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-background': '#212121',
          'on-surface': '#212121'
        }
      }
    }
  },
  // Global component defaults following Vuetify patterns
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'flat',
      rounded: 'lg'
    },
    VCard: {
      elevation: 2,
      variant: 'flat'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VDialog: {
      maxWidth: '600',
      persistent: false
    },
    VAlert: {
      variant: 'tonal',
      border: 'start',
      closable: true
    },
    VChip: {
      variant: 'outlined',
      size: 'small'
    }
  }
})
