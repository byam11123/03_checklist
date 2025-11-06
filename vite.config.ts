import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Allow all URLs to be cached for offline access
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-apps-script-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Office Checklist',
        short_name: 'Checklist',
        description: 'Office checklist application for daily tasks',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'src/assets/react.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'src/assets/react.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ],
        start_url: '/',
      },
    })
  ],

})
