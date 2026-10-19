# 2026-10-18_pnpm-migration: перевод monorepo на pnpm

**Created:** 2026-10-18T13:00:44+03:00

## Scope

В scope:

- pnpm + pnpm workspaces: `pnpm-workspace.yaml` вместо `workspaces` в `package.json`.
- pnpm catalog: централизация версий зависимостей в `pnpm-workspace.yaml` (catalog), пакеты ссылаются на `catalog:`.
- Удаление пустого `packages/vite-config` (только мусор `node_modules/`, никто не импортирует).
- Удаление Turborepo: `turbo.json`, `.turbo/`, зависимость `turbo`, все упоминания в скриптах и конфиге.
- Корневые скрипты (`build`/`dev`/`test`/`lint`/`format:check`) перевести на `pnpm -r` / `pnpm --filter`.
- CI (`.github/workflows/ci.yml`): `pnpm/action-setup` + `pnpm install` + cache на pnpm store.
- Pre-commit/commit-msg хуки: husky на корневом уровне (`prepare` script), `pnpm run` внутри хуков.
- Удаление `package-lock.json` (корневой + вложенные в `apps/web` и `packages/food-recipe-core`), генерация `pnpm-lock.yaml`.
- `eslint-config`: убрать `eslint-config-turbo` (dep + 2 `extends` + README).
- `.gitignore`: убрать `.turbo`, добавить `.cache/` и `.tmp/` (session conventions).

Вне scope:

- changesets/release-конвенции (KISS).
- `apps/mvp` и `packages/vite-config` — не существуют/пусты; трогать не будем (vite-config можно удалить — см. open questions).
- Пересмотр архитектурной документации (`docs/specs/*`) — только правки, напрямую связанные с миграцией (README, CONTRIBUTING, AGENTS.md).

## Approach

1. `pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]` + `catalog:` с версиями всех повторяющихся dev/runtime deps.
2. Корневой `package.json`: убрать `workspaces`, `turbo`, дубли `react`/`react-dom`; скрипты:
   - `build`: `pnpm -r --filter='!web' build` (core строится первым через порядок зависимостей — pnpm сам выстраивает topological order при `-r`).
   - `dev`: `pnpm -r dev` (persistent, без кешей — как turbo `persistent: true`).
   - `test`/`lint`/`format:check`: `pnpm -r <script>`.
   - `check`/`pre-commit`/`commit`/`release:*` — те же chains, но на `pnpm run`.
3. Удалить `turbo.json`, `.turbo/`, `package-lock.json` ×3; `pnpm install`.
4. Husky: добавить в root devDeps + `"prepare": "husky"`; хуки через `pnpm run`.
5. CI: `pnpm/action-setup@v4` + Node 22 + `pnpm install --frozen-lockfile` + pnpm cache.
6. ESLint: выкинуть `eslint-config-turbo`.
7. Верификация: `pnpm install && pnpm build && pnpm test && pnpm lint` с нуля (свежий install).

## Constraints

- Node >= 22 (engines).
- pnpm 11.22.0 (актуальный в окружении; catalog стабилен с 9.5). `packageManager: "pnpm@11.22.0"`.
- `@repo/*` cross-deps: pnpm по умолчанию не резолвит `"*"` в workspace-пакеты — используем протокол `workspace:` (pnpm-идиома).
- Vite/Webpack/Jest/ESLint конфиги package-manager-agnostic — менять не нужно.
- `apps/web` build использует `npm-run-all2` (`run-p`) — оставить, работает под pnpm.
- CI деплоит `apps/web/dist` в GitHub Pages — путь не меняется.
- Husky в текущем checkout не активен (нет `prepare`, нет `core.hooksPath`) — восстановление через root `prepare` script.

## Open questions

- none

## Changes

- 2026-10-18T13:00:44+03:00 -- v1, initial spec (draft + research)
- 2026-10-18T13:05:00+03:00 -- закрыты open questions: `packages/vite-config` удаляем (пустой), pnpm фиксируем на 11.22.0
- 2026-10-18T15:10:00+03:00 -- `@repo/*` cross-deps: `"*"` → `workspace:` (pnpm не резолвит `*` в workspace-пакеты по умолчанию)
- 2026-10-19T02:07:57+03:00 -- execution-forced: pnpm strict node_modules — добавлены прямые deps (`eslint` в core, `@biomejs/biome` в web-react, `@commitlint/cli`/`ts-node`/`standard-version` в root, `terser-webpack-plugin` в core); `tsconfig` target core `es2017` → `es2022` (named capture groups); `sharp` выключен из postinstall-сборок (нужен libvips, используется только storybook/pwa-утилитами); `allowBuilds` для esbuild/puppeteer и пр.; `vue-tsc` в web `^1.8.27` → `^2.0.0` (1.x ломается на TS 5.9); `jest.config.ts`: убрал прямой путь `../../node_modules/@jest/reporters/build/SummaryReporter.js` (npm-hoisting) → только кастомный репортёр; `@jest/reporters` стал прямым dep core; `apps/web`: 2 SFC (`IngredientLine/{Edit,index}.vue`) — plain `<script>` блок с `export default` → `defineOptions` в `<script setup>` (TS4082 на vue-tsc 2.x).
