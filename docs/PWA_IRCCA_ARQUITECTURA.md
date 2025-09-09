# 🚀 PWA IRCCA - ARQUITECTURA TÉCNICA
## Progressive Web App + Vue 3 + Vuetify 3

### Versión: 2.0 | Fecha: 2025-09-08
### Framework: Vue 3 + Vuetify 3 + PWA

---

## 📋 ÍNDICE ARQUITECTURA

1. [Stack Tecnológico](#stack-tecnológico)
2. [Configuración del Proyecto](#configuración-del-proyecto)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Configuración PWA](#configuración-pwa)
5. [Configuración Vuetify](#configuración-vuetify)
6. [Sistema de Stores (Pinia)](#sistema-de-stores)
7. [Router y Navegación](#router-y-navegación)
8. [Servicios y Composables](#servicios-y-composables)
9. [Base de Datos IndexedDB](#base-de-datos-indexeddb)
10. [Build y Deploy](#build-y-deploy)

---

## 🛠️ STACK TECNOLÓGICO

### **Dependencias Principales**
```json
{
  "name": "ircca-sistema-pwa",
  "version": "2.0.0",
  "type": "module",
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  },
  "dependencies": {
    "vue": "^3.5.18",
    "vue-router": "^4.5.1", 
    "pinia": "^3.0.3",
    "vuetify": "^3.7.4",
    "@mdi/font": "^7.4.47",
    
    "idb": "^8.0.0",
    "crypto-js": "^4.2.0",
    "bcryptjs": "^2.4.3",
    "uuid": "^10.0.0",
    
    "chart.js": "^4.4.0",
    "vue-chartjs": "^5.3.0",
    "jspdf": "^3.0.1",
    "jspdf-autotable": "^5.0.2",
    
    "date-fns": "^3.6.0",
    "@vueuse/core": "^11.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.1",
    "vite": "^7.0.6",
    "vite-plugin-pwa": "^1.0.2",
    "vite-plugin-vuetify": "^2.0.4",
    "sass": "^1.81.0",
    "eslint": "^9.16.0",
    "prettier": "^3.6.2"
  }
}
```

### **Tecnologías Core**
- **Vue 3:** Framework principal con Composition API
- **Vuetify 3:** UI Framework con Material Design 3
- **Pinia:** State management moderno
- **IndexedDB:** Base de datos local offline
- **PWA:** Progressive Web App nativa

---

## ⚙️ CONFIGURACIÓN DEL PROYECTO

### **1. Vite Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      theme: {
        defaultTheme: 'ircca'
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Sistema IRCCA - Registro de Ingresos y Salidas',
        short_name: 'IRCCA Sistema',
        description: 'Sistema oficial del Instituto de Regulación y Control del Cannabis',
        theme_color: '#1565C0',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### **2. Main.js Setup**
```javascript
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'
import vuetifyConfig from './plugins/vuetify'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetifyConfig)

app.mount('#app')
```

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
ircca-sistema-pwa/
├── public/
│   ├── icons/                   # Iconos PWA
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── assets/
│   │   ├── docs/
│   │   │   └── politica_uso_privacidad.md  # Documento de política
│   │   ├── images/
│   │   │   └── logo-placeholder.svg
│   │   └── styles/
│   │       └── variables.scss
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.vue
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppSidebar.vue
│   │   │   └── AppFooter.vue
│   │   ├── ui/
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseButton.vue
│   │   │   └── StatsCard.vue
│   │   └── forms/
│   │       ├── IngresoForm.vue
│   │       ├── SalidaForm.vue
│   │       └── FeedbackForm.vue            # Nuevo componente
│   │
│   ├── composables/
│   │   ├── useAuth.js
│   │   ├── useRegistros.js
│   │   └── useStats.js
│   │
│   ├── stores/
│   │   ├── auth.js
│   │   ├── registros.js
│   │   └── audit.js
│   │
│   ├── services/
│   │   ├── database.js
│   │   ├── encryption.js
│   │   └── storage.js
│   │
│   ├── router/
│   │   ├── index.js
│   │   └── guards.js
│   │
│   ├── views/
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   └── PersonasDentroView.vue
│   │
│   ├── plugins/
│   │   └── vuetify.js
│   │
│   ├── App.vue
│   └── main.js
```

---

## 📱 CONFIGURACIÓN PWA

### **Manifest.json**
```json
{
  "name": "Sistema IRCCA - Registro de Ingresos y Salidas",
  "short_name": "IRCCA Sistema",
  "description": "Sistema oficial del Instituto de Regulación y Control del Cannabis de Uruguay",
  "theme_color": "#1565C0",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "portrait-primary",
  "lang": "es-UY",
  "categories": ["productivity", "business", "government"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png", 
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Registro de Ingreso",
      "url": "/dashboard?action=ingreso",
      "icons": [{"src": "/icons/icon-96x96.png", "sizes": "96x96"}]
    }
  ]
}
```

### **Service Worker Strategy**
```javascript
// Configuración automática con vite-plugin-pwa
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  runtimeCaching: [{
    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365
      }
    }
  }]
}
```

---

## 🎨 CONFIGURACIÓN VUETIFY

### **Plugin Vuetify**
```javascript
// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const ircaTheme = {
  dark: false,
  colors: {
    primary: '#1565C0',
    secondary: '#424242', 
    accent: '#00695C',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#C62828',
    info: '#1976D2',
    surface: '#FFFFFF',
    background: '#F5F5F5'
  }
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'ircca',
    themes: {
      ircca: ircaTheme
    }
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg'
    },
    VCard: {
      variant: 'flat',
      elevation: 2
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
})
```

---

## 🗃️ SISTEMA DE STORES (PINIA)

### **Store de Autenticación**
```javascript
// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const currentSession = ref(null)
  
  const isAuthenticated = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.rol)
  
  const login = async (username, password) => {
    // Implementación de login
  }
  
  const logout = async () => {
    currentUser.value = null
    currentSession.value = null
  }
  
  const hasPermission = (permission) => {
    const rolePermissions = {
      admin: ['create', 'read', 'update', 'delete', 'manage_users'],
      operador: ['create', 'read', 'update']
    }
    return rolePermissions[userRole.value]?.includes(permission)
  }
  
  return {
    currentUser,
    isAuthenticated, 
    userRole,
    login,
    logout,
    hasPermission
  }
})
```

### **Store de Registros**
```javascript
// src/stores/registros.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRegistrosStore = defineStore('registros', () => {
  const registros = ref([])
  const personasDentro = ref([])
  
  const totalPersonasDentro = computed(() => personasDentro.value.length)
  const ingresosHoy = computed(() => {
    const hoy = new Date().toDateString()
    return registros.value.filter(r => 
      r.tipo === 'ingreso' && 
      new Date(r.timestamp).toDateString() === hoy
    ).length
  })
  
  const registrarIngreso = async (datosPersona) => {
    // Implementación de registro de ingreso
  }
  
  const registrarSalida = async (cedula) => {
    // Implementación de registro de salida
  }
  
  return {
    registros,
    personasDentro,
    totalPersonasDentro,
    ingresosHoy,
    registrarIngreso,
    registrarSalida
  }
})
```

---

## 🛣️ ROUTER Y NAVEGACIÓN

### **Router Configuration**
```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/personas-dentro',
    name: 'PersonasDentro',
    component: () => import('@/views/PersonasDentroView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(authGuard)

export default router
```

### **Guards de Autenticación**
```javascript
// src/router/guards.js
import { useAuthStore } from '@/stores/auth'

export const authGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
}
```

---

## 💾 BASE DE DATOS INDEXEDDB

Para soportar las políticas de retención, purga y las nuevas funcionalidades, la base de datos se versiona a v2 con la siguiente estructura actualizada.

### **Inicialización de DB (Versión 2)**
```javascript
// src/services/database.js
import { openDB } from 'idb';

const DB_NAME = 'IRCCA_SISTEMA_DB';
const DB_VERSION = 2; // Versión incrementada para reflejar cambios de esquema

export const initDatabase = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Store de registros de ingresos/salidas
      if (!db.objectStoreNames.contains('registros')) {
        const registrosStore = db.createObjectStore('registros', { keyPath: 'id', autoIncrement: true });
        registrosStore.createIndex('cedula', 'cedula');
        // Índice crucial para la purga automática de datos
        registrosStore.createIndex('timestamp', 'timestamp');
      }

      // Store de auditoría
      if (!db.objectStoreNames.contains('auditoria')) {
        const auditoriaStore = db.createObjectStore('auditoria', { keyPath: 'id' });
        // Índice crucial para la purga de logs antiguos
        auditoriaStore.createIndex('timestamp', 'timestamp');
      }
      
      // -- STORES AÑADIDOS EN V2 --
      if (oldVersion < 2) {
        // Store para respaldos automáticos (Niveles 1 y 2 de la estrategia 3-2-1)
        if (!db.objectStoreNames.contains('respaldos_automaticos')) {
          const backupStore = db.createObjectStore('respaldos_automaticos', { keyPath: 'id' });
          backupStore.createIndex('timestamp', 'timestamp');
          backupStore.createIndex('tipo', 'tipo'); // 'diario' o 'semanal'
        }

        // Store para feedback de usuario (anónimo)
        if (!db.objectStoreNames.contains('feedback_usuarios')) {
          db.createObjectStore('feedback_usuarios', { keyPath: 'id', autoIncrement: true });
        }
      }
      
      // Store de usuarios del sistema
      if (!db.objectStoreNames.contains('usuarios')) {
        const userStore = db.createObjectStore('usuarios', { keyPath: 'id' });
        userStore.createIndex('username', 'username', { unique: true });
      }
      
      // Store de personas actualmente dentro
      if (!db.objectStoreNames.contains('personas_dentro')) {
        const personasStore = db.createObjectStore('personas_dentro', { keyPath: 'cedula' });
        personasStore.createIndex('nombre', 'nombre');
        personasStore.createIndex('timestamp_ingreso', 'timestampIngreso');
      }
    }
  });
};
```

---

## 📦 BUILD Y DEPLOY

### **Scripts de Build**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 3000",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix",
    "format": "prettier --write src/"
  }
}
```

### **Configuración de Producción**
```javascript
// Optimizaciones para build
build: {
  target: 'esnext',
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vuetify', 'pinia'],
        crypto: ['crypto-js', 'bcryptjs'],
        charts: ['chart.js', 'vue-chartjs']
      }
    }
  }
}
```

---

## 🔧 COMANDOS DE DESARROLLO

### **Setup Inicial**
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción  
npm run build

# Preview build
npm run preview
```

### **Estructura de Archivos de Configuración**
```
├── vite.config.js          # Configuración Vite + PWA
├── package.json           # Dependencias y scripts
├── .env.example          # Variables de entorno
├── .gitignore           # Archivos ignorados
├── .eslintrc.js        # Configuración ESLint
└── .prettierrc         # Configuración Prettier
```

**🎯 La arquitectura PWA está completa y lista para implementación.**
