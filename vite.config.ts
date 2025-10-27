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

  // Security Headers - OWASP ZAP Scan Compliance (Actualizado: 26-Oct-2025)
  const securityHeaders = {
    // ⚠️ CSP: unsafe-inline SOLO en style-src (requerido por Vuetify 3)
    // ✅ script-src SIN unsafe-inline (seguridad XSS mantenida)
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'none'; base-uri 'self';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // ✅ Geolocation bloqueada (correcto para app de control de accesos)
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()'
  }

  return {
    // Configuración del servidor de desarrollo
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
      host: process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0',
      headers: securityHeaders
    },

    // Configuración del servidor preview (para testing de builds)
    preview: {
      port: 4173,
      headers: securityHeaders
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
            // Core framework - cargado siempre (todos los usuarios)
            vendor: ['vue', 'vue-router', 'pinia'],

            // UI framework - cargado siempre (todos los usuarios)
            vuetify: ['vuetify'],

            // Utilidades básicas - cargado siempre
            utils: ['@vueuse/core'],

            // 🆕 PDF libraries - lazy load solo para Supervisores (~220 KB)
            // Evita que Operadores (80% usuarios) descarguen código que no usan
            'pdf-libs': ['jspdf', 'jspdf-autotable']
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
        registerType: 'prompt',
        workbox: {
          skipWaiting: false,
          clientsClaim: false,
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
              purpose: 'any'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/manifest-icon-192.maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icons/manifest-icon-512.maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
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
