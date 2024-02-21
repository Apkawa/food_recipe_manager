import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import nightwatchPlugin from 'vite-plugin-nightwatch'
// import { ViteFaviconsPlugin } from 'vite-plugin-favicon2'
import checker from 'vite-plugin-checker'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'

const PWAOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}']
  },
  includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'maskable-icon-512x512.png'],
  manifest: {
    name: 'Кухонный калькулятор',
    short_name: 'Кухонный калькулятор',
    description: 'Калькулятор рецептов и не только',
    theme_color: '#ffffff',
    screenshots: [
      {
        src: 'pwa/screenshot_1_wide.png',
        sizes: "1422x1363",
        type: "image/png",
        form_factor:"wide",
        label: "Основной интерфейс"
      },
      {
        src: 'pwa/screenshot_1_narrow.png',
        sizes: "430x932",
        type: "image/png",
        form_factor:"narrow",
        label: "Основной интерфейс"
      },
      {
        src: 'pwa/screenshot_2_narrow.png',
        sizes: "430x932",
        type: "image/png",
        form_factor:"narrow",
        label: "Окно валидации ошибки =3"
      },
    ],
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    nightwatchPlugin(),
    checker({ typescript: true }),
    // ViteFaviconsPlugin('./public/food_recipe_calculator_icon.png'),
    VitePWA(PWAOptions)

  ],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
