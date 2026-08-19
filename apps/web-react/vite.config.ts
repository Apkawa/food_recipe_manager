import {execSync} from "node:child_process";
import {fileURLToPath} from "node:url";

import react from "@vitejs/plugin-react";
import type {ConfigEnv} from "vite";
import {loadEnv} from "vite";
import {VitePWA, type VitePWAOptions} from "vite-plugin-pwa";
import {defineConfig} from "vitest/config";
import packageJson from "./package.json";

// Port of the PWA options from apps/web/vite.config.ts (same manifest, icons,
// screenshots and .txt file handler).
const PWAOptions: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  // Dev PWA is intentionally enabled (unlike the Vue app config): the dev service worker
  // only precaches static assets from dev-dist/, never the app code, so dev builds stay
  // fresh; autoUpdate keeps the SW current. Verified against vite-plugin-pwa source.
  devOptions: {enabled: true},
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
  },
  includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "maskable-icon-512x512.png"],
  manifest: {
    name: "Кухонный калькулятор",
    short_name: "Кухонный калькулятор",
    description: "Калькулятор рецептов и не только",
    theme_color: "#ffffff",
    screenshots: [
      {
        src: "pwa/screenshot_1_wide.png",
        sizes: "1422x1363",
        type: "image/png",
        form_factor: "wide",
        label: "Основной интерфейс",
      },
      {
        src: "pwa/screenshot_1_narrow.png",
        sizes: "430x932",
        type: "image/png",
        form_factor: "narrow",
        label: "Основной интерфейс",
      },
      {
        src: "pwa/screenshot_2_narrow.png",
        sizes: "430x932",
        type: "image/png",
        form_factor: "narrow",
        label: "Окно валидации ошибки =3",
      },
    ],
    icons: [
      {
        src: "pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    file_handlers: [
      {
        action: "./",
        accept: {
          "text/plain": [".txt"],
        },
      },
    ],
  },
};

interface BuildInfo {
  commitHash: string;
  isoDate: string;
  version: string;
  refName: string;
}

function getBuildInfo(): BuildInfo | null {
  const parts = execSync("git show --no-patch --no-notes --pretty='%h;%cI;%D' HEAD")
    .toString()
    .trim()
    .split(";");

  const [commitHash, isoDate, refName] = parts;
  if (!commitHash || !isoDate || !refName) {
    return null;
  }

  return {
    commitHash,
    isoDate,
    version: packageJson.version,
    refName: refName.match("HEAD ->.+origin/(.+)")?.[1] ?? refName,
  };
}

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  const buildInfo = getBuildInfo();
  if (buildInfo) {
    process.env.VITE_GIT_COMMIT_DATE = buildInfo.isoDate;
    process.env.VITE_GIT_BRANCH_NAME = buildInfo.refName;
    process.env.VITE_GIT_COMMIT_HASH = buildInfo.commitHash;
    process.env.VITE_PACKAGE_VERSION = buildInfo.version;
  }

  return {
    plugins: [react(), VitePWA(PWAOptions)],
    base: "./",
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "jsdom",
    },
  };
});
