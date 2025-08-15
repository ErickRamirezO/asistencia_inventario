import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    injectRegister: false,

    includeAssets: ["logo.png"],
      
    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'asistencia_inventario',
      short_name: 'asistencia_inventario',
      description: 'sistema de control de asistencia e inventario',
      theme_color: '#ffffff',
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: '/index.html',
navigateFallbackAllowlist: [
  /^\/$/, // raíz
  /^\/lista-monitoreo/, // tu vista principal
  /^\/monitoreo-tag/,   // si usas esta también
],

      runtimeCaching: [
        {
          urlPattern: /^\/api\//, // Cambia esto según tu endpoint
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60, // 1 hora
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
     host: '0.0.0.0',
     port: 5173,
     allowedHosts: ['smartcontrol.eastus.cloudapp.azure.com'], //  Agregado aquí
    
    proxy: {
      '/api': {
       target: 'http://localhost:8002',
      //  target: 'http://52.224.111.106:8002',

        changeOrigin: true,
        // Si tu API no tiene '/api' como prefijo, puedes reescribir la ruta
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
  },
})