// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon-32x32.png', 'favicon.png', 'logo4.webp', 'icon-192.png', 'icon-512.png', 'notification-badge.png'],
        manifest: {
          name: 'HabitTrack — Monthly Habit Tracker',
          short_name: 'HabitTrack',
          description: 'Track your daily habits month by month',
          theme_color: '#1e293b',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          icons: [
            {
              src: '/logo4.webp',
              sizes: '192x192 512x512',
              type: 'image/webp',
              purpose: 'any maskable',
            },
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  },
});