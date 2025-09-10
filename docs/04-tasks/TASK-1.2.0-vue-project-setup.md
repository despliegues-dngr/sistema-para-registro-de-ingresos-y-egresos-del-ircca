# ⚙️ TASK 1.2.0 - SETUP PROYECTO VUE 3 + VUETIFY 3 + PWA

**CÓDIGO EDT:** 1.2.0 (Nuevo - Prerequisito)  
**RESPONSABLE:** Mario BERNI (Gerente de Proyecto)  
**DURACIÓN:** 4-6 horas  
**FECHA:** 09-Sep-2025 (Adelantado)  
**DEPENDE DE:** 1.1.4 (Cronograma Detallado) ✅  
**PREREQUISITO PARA:** 1.2.3 (Diseño UI/UX)

---

## 📋 OBJETIVOS DE LA TAREA

1. **Crear proyecto base** con Vite + Vue 3
2. **Configurar Vuetify 3** con tema gubernamental IRCCA
3. **Implementar PWA** básica funcional
4. **Establecer estructura** de carpetas profesional
5. **Configurar herramientas** de desarrollo y build

---

## 🚀 SUBTAREAS DETALLADAS

### FASE 1: Inicialización Base (1-1.5h) ✅ COMPLETADA
- [x] **1.1** Crear proyecto con Vite + Vue 3 ✅
- [x] **1.2** Configurar package.json con dependencias requeridas ✅
- [x] **1.3** Verificar instalación de Node.js >=20.19.0 ✅
- [x] **1.4** Configurar .gitignore y estructura inicial ✅

### FASE 2: Configuración Vuetify 3 (1-1.5h) ✅ COMPLETADA
- [x] **2.1** Instalar Vuetify 3 + Material Design Icons ✅
- [x] **2.2** Configurar plugin Vuetify con tema IRCCA ✅
- [x] **2.3** Crear paleta de colores gubernamental ✅
- [x] **2.4** Configurar tipografía Roboto ✅
- [x] **2.5** Testear componentes básicos ✅

### FASE 3: Configuración PWA (1h) ✅ COMPLETADA
- [x] **3.1** Instalar vite-plugin-pwa ✅
- [x] **3.2** Configurar manifest.json IRCCA ✅
- [x] **3.3** Generar iconos PWA (192x192, 512x512) ✅
- [x] **3.4** Configurar service worker básico ✅
- [x] **3.5** Testear instalación PWA ✅

### FASE 4: Estructura de Proyecto (1h) ✅
- [x] **4.1** Crear estructura de carpetas según arquitectura ✅
- [x] **4.2** Configurar Pinia para state management ✅  
- [x] **4.3** Configurar Vue Router con guards básicos ✅
- [x] **4.4** Crear composables base ✅
- [x] **4.5** Configurar servicios base (database, encryption) ✅

### FASE 5: Configuración Desarrollo (0.5-1h) ✅
- [x] **5.1** Configurar ESLint + Prettier ✅
- [x] **5.2** Configurar scripts de desarrollo ✅
- [x] **5.3** Configurar variables de entorno ✅
- [x] **5.4** Crear documentación README básica ✅
- [x] **5.5** Documentación y scripts finales ✅

---

## 💻 COMANDOS DE IMPLEMENTACIÓN

### Inicialización
```bash
# Crear proyecto
npm create vue@latest ircca-sistema-pwa
cd ircca-sistema-pwa

# Instalar dependencias core
npm install vue@^3.5.18 vue-router@^4.5.1 pinia@^3.0.3

# Instalar Vuetify 3
npm install vuetify@^3.7.4 @mdi/font@^7.4.47 vite-plugin-vuetify@^2.0.4

# Instalar PWA
npm install vite-plugin-pwa@^1.0.2

# Dependencias adicionales
npm install idb@^8.0.0 crypto-js@^4.2.0 bcryptjs@^2.4.3 uuid@^10.0.0
npm install chart.js@^4.4.0 vue-chartjs@^5.3.0 jspdf@^3.0.1
npm install date-fns@^3.6.0 @vueuse/core@^11.1.0

# DevDependencies
npm install -D sass@^1.81.0 eslint@^9.16.0 prettier@^3.6.2
```

### Configuración Vite
```javascript
// vite.config.js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    vuetify(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'IRCCA - Sistema de Registro de Accesos',
        short_name: 'IRCCA Access',
        description: 'Sistema para registro y control de ingresos y egresos del Instituto de Regulación y Control del Cannabis',
        theme_color: '#2E7D32',
        background_color: '#FFFFFF',
        display: 'fullscreen',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['government', 'security', 'business'],
        lang: 'es-UY',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Registrar Ingreso',
            short_name: 'Ingreso',
            description: 'Registrar ingreso de persona o vehículo',
            url: '/registro/ingreso',
            icons: [{ src: '/icons/ingreso-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Registrar Egreso',
            short_name: 'Egreso',
            description: 'Registrar egreso de persona o vehículo',
            url: '/registro/egreso',
            icons: [{ src: '/icons/egreso-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Consultas',
            short_name: 'Consultas',
            description: 'Consultar registros históricos',
            url: '/consultas',
            icons: [{ src: '/icons/consulta-96x96.png', sizes: '96x96' }]
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
```

---

## 📁 ESTRUCTURA DE CARPETAS TARGET

```
ircca-sistema-pwa/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── forms/
│   ├── composables/
│   ├── stores/
│   ├── services/
│   ├── router/
│   ├── views/
│   ├── plugins/
│   │   └── vuetify.js
│   ├── assets/
│   ├── App.vue
│   └── main.js
├── docs/
├── vite.config.js
├── package.json
└── README.md
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Funcionales
- [ ] Proyecto Vue 3 inicia correctamente con `npm run dev`
- [ ] Vuetify 3 renderiza componentes con tema IRCCA
- [ ] PWA se instala correctamente en navegador
- [ ] Paleta de colores gubernamental aplicada
- [ ] Estructura de carpetas implementada

### Técnicos
- [ ] Build de producción exitoso con `npm run build`
- [ ] Service worker registrado correctamente
- [ ] Manifest.json válido para PWA
- [ ] ESLint sin errores
- [ ] Git inicializado con primer commit

### Validación
- [ ] Demo básico funcionando con componente Vuetify
- [ ] PWA instalable desde navegador
- [ ] Colores IRCCA aplicados correctamente

---

## 🎨 TEMA GUBERNAMENTAL IRCCA

### Configuración Vuetify
```javascript
// src/plugins/vuetify.js
const ircaTheme = {
  dark: false,
  colors: {
    primary: '#1565C0',      // Azul institucional
    secondary: '#424242',    // Gris carbón
    accent: '#00695C',       // Verde gubernamental
    success: '#2E7D32',      // Verde éxito
    warning: '#F57C00',      // Naranja advertencia
    error: '#C62828',        // Rojo error
    info: '#1976D2',         // Azul información
    surface: '#FFFFFF',      // Superficie
    background: '#F5F5F5'    // Fondo general
  }
}
```

---

## 🚨 RIESGOS Y MITIGACIONES

### Riesgos Técnicos
- **Medio:** Conflictos de versiones entre dependencias
  - **Mitigación:** Usar versiones específicas documentadas
- **Bajo:** Problemas de configuración PWA
  - **Mitigación:** Testear en múltiples navegadores

### Dependencias
- **Node.js:** >=20.19.0 requerido
- **NPM:** Versión actualizada
- **Conexión:** Para descarga de dependencias

---

## 📝 LOG DE PROGRESO

### 09-Sep-2025
- [x] **Inicio:** 12:07
- [x] **FASE 1 Completada:** 12:26 ✅
- [x] **FASE 2 Completada:** 14:47 ✅
- [x] **FASE 3 Completada:** 15:18 ✅
- [x] **FASE 4 Completada:** 15:32 ✅
- [x] **FASE 5 Completada:** 15:36 ✅
- [x] **Fin:** 15:36 ✅

### Notas del Proceso
- **Stack seleccionado:** TypeScript + JSX + Router + Pinia + Vitest + Playwright + ESLint + Prettier
- **Decisión clave:** Incluir TypeScript y testing completo para calidad gubernamental
- **Vuetify instalado:** v3.9.7 + vite-plugin-vuetify v2.1.2 + @mdi/font v7.4.47 + sass v1.92.1
- **Tema gubernamental:** Colores institucionales IRCCA aplicados correctamente
- **Problema encontrado:** Warning de pnpm global (no crítico para el proyecto)
- **Servidor funcionando:** http://localhost:5173/ ✅
- **Tiempo FASE 1:** 19 minutos (estimado: 1-1.5h) - MUY EFICIENTE
- **Tiempo FASE 2:** 2h 40min total - Vuetify + Tema IRCCA completado y verificado
- **Tiempo FASE 3:** 31 minutos - PWA configuración completada exitosamente
- **Tiempo FASE 4:** 14 minutos - Estructura proyecto + stores + router + composables
- **Tiempo FASE 5:** 4 minutos - Scripts + variables entorno + README
- **TIEMPO TOTAL:** 3h 29min (estimado: 4-6h) - ADELANTADO AL CRONOGRAMA ✅

### Entregables Completados
- ✅ **Base técnica completa:** Vue 3 + TypeScript + Pinia + Vuetify
- ✅ **PWA funcional:** Service workers, manifest, iconos
- ✅ **Arquitectura de seguridad:** Cifrado AES-256, autenticación, guards
- ✅ **Estructura escalable:** Stores, composables, servicios, componentes
- ✅ **Documentación completa:** README profesional, variables entorno
- ✅ **Scripts optimizados:** Desarrollo, testing, producción, kiosco

### Próximos Pasos Recomendados
1. **PRIORITARIO:** TASK 1.2.3 - Diseño UI/UX (10-11 Sep)
2. TASK 1.2.1 - Diseño Arquitectura Técnica  
3. TASK 1.2.2 - Diseño Base de Datos IndexedDB
4. Desarrollo de vistas (login, dashboard, registro, consultas)
- **Repositorio Git:** Listo para subir a https://github.com/despliegues-dngr/sistema-para-registro-de-ingresos-y-egresos-del-ircca.git

---

## 🔗 SIGUIENTES PASOS

Una vez completado este setup:
1. **TASK 1.2.3** Diseño UI/UX directamente en componentes Vue
2. **TASK 1.2.1** Diseño de Arquitectura Técnica (refinamiento)
3. **TASK 1.2.2** Diseño de Base de Datos (implementación)

---

**🎯 STATUS:** ⏳ Listo para iniciar  
**⏰ PRÓXIMA ACCIÓN:** Verificar Node.js y crear proyecto Vite  
**📊 PROGRESO:** 0/25 subtareas (0%)  
**⏱️ TIEMPO ESTIMADO:** 4-6 horas
