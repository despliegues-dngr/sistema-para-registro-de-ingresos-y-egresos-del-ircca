import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    // Configuración del servidor de desarrollo
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
      host: process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0'
    },
    
    // Variables globales para Vercel
    define: {
      __APP_ENV__: JSON.stringify(process.env.VITE_VERCEL_ENV || mode),
      __VERCEL_URL__: JSON.stringify(process.env.VITE_VERCEL_URL || ''),
      __PRODUCTION_URL__: JSON.stringify(process.env.VITE_VERCEL_PROJECT_PRODUCTION_URL || ''),
    },
    
    // Configuración de build optimizada para Vercel
    build: {
      target: 'es2022',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            vuetify: ['vuetify'],
            utils: ['@vueuse/core']
          }
        }
      }
    },
    
    plugins: [
      vue(),
      vueJsx(),
      // Solo DevTools en desarrollo
      ...(isProduction ? [] : [vueDevTools()]),
      vuetify(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
                }
              }
            }
          ]
        },
        manifest: {
          name: 'Sistema de Control de Accesos del IRCCA',
          short_name: 'IRCCA Control',
          description: 'Sistema para registro y control de ingresos y egresos del Instituto de Regulación y Control del Cannabis',
          theme_color: '#1565C0',
          background_color: '#000000',
          display: 'standalone',
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
    
    // Optimizaciones adicionales
    esbuild: {
      // ⚠️ TEMPORALMENTE deshabilitado para debugging de persistencia
      // TODO: Restaurar después de verificar funcionamiento en producción
      drop: isProduction ? ['debugger'] : [], // Solo elimina debugger, mantiene console
    },
  }
})
