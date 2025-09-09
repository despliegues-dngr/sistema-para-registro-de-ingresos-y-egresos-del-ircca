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
