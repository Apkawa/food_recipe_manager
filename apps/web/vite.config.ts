import { fileURLToPath, URL } from 'node:url'

import { ConfigEnv, defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import nightwatchPlugin from 'vite-plugin-nightwatch'
// import { ViteFaviconsPlugin } from 'vite-plugin-favicon2'
import checker from 'vite-plugin-checker'
import { VitePWA, VitePWAOptions } from 'vite-plugin-pwa'
import { execSync } from 'child_process'

import packageJson from './package.json'

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
        sizes: '1422x1363',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Основной интерфейс'
      },
      {
        src: 'pwa/screenshot_1_narrow.png',
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Основной интерфейс'
      },
      {
        src: 'pwa/screenshot_2_narrow.png',
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Окно валидации ошибки =3'
      }
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
    ],
    file_handlers: [
      {
        action: './',
        accept: {
          'text/plain': ['.txt']
        }
      }
    ]
  }
}

interface BuildInfo {
  commitHash: string
  isoDate: string
  version: string
  refName: string
}
function getBuildInfo(): BuildInfo | null {
  const parts: string[] = execSync("git show --no-patch --no-notes --pretty='%h;%cI;%D' HEAD")
    .toString()
    .trim()
    .split(';')

  if (parts.length == 3) {
    const [commitHash, isoDate, ref_name] = parts
    return {
      commitHash,
      isoDate,
      version: packageJson.version,
      refName: ref_name.match('HEAD ->.+origin/(.+)')?.[1] || ref_name
    }
  }
  return null
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  const buildInfo = getBuildInfo()
  if (buildInfo) {
    process.env.VITE_GIT_COMMIT_DATE = buildInfo.isoDate
    process.env.VITE_GIT_BRANCH_NAME = buildInfo.refName
    process.env.VITE_GIT_COMMIT_HASH = buildInfo.commitHash
    process.env.VITE_PACKAGE_VERSION = buildInfo.version
  }

  return {
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
  }
})
