# 2026-10-19_tooling-migration: миграция тулинга (webpack→vite, jest→vitest, eslint→biome)

**Created:** 2026-10-19T09:10:17+03:00

## Scope

**В скоупе:**

1. Удаление webpack-сборки из `packages/food-recipe-core` (исследование показало: `dist/` не потребляется никем — оба приложения импортируют `src/` напрямую; решение пользователя — удалять, а не переносить на vite).
2. Замена jest на vitest в `packages/food-recipe-core` (единственный пакет с jest).
3. Удаление ESLint: корневой `.eslintrc.js` (пустая заглушка), `packages/food-recipe-core/.eslintrc.json`, пакет `packages/eslint-config`; линтинг core переходит на biome (biome.json уже покрывает весь репо).
4. CI: деплой `apps/web-react/dist` на GitHub Pages вместо `apps/web/dist`.
5. Удаление `apps/web` (Vue-приложение) и всех связанных зависимостей/конфигов/доков.
6. Prettier → Biome: корневой `format`-скрипт на `biome format apps packages --diagnostic-level=error` + новый `format:fix`; удаление prettier-зависимостей, инлайн-конфига и `.prettierignore` (добавлено по просьбе пользователя).

**Вне скоупа:**

- Изменения бизнес-логики core и UI web-react.
- Исторические документы `docs/specs/*` (записи прошлых задач не правим).
- Prettier-файлы внутри `apps/web` (`.prettierrc.json` и т.п.) — удаляются вместе с приложением, отдельным пунктом не выносятся.
- Деплойные настройки за пределами `ci.yml`.

## Approach

- **Core без сборки:** удалить `webpack.config.ts`, webpack devDeps, скрипты `build`/`build-only`/`dev`; поправить устаревшие `main`/`types` в `package.json` (указать на `src`). Корневой `pnpm -r build` будет собирать только web-react.
- **jest → vitest:** `vitest.config.ts` (node env, алиасы `@app/*`, `@tests/*` по аналогии с moduleNameMapper), удалить `.jest/` (setup-файлы, кастомный reporter на `@jest/reporters`), `jest-expect-message`, `ts-jest*`, `@types/jest`, `@testing-library/jest-dom`, legacy `jsdom-global`; 15 тестов переносятся как есть (jest-специфичных API в них нет).
- **ESLint → biome:** удалить `.eslintrc.*`, пакет `@repo/eslint-config` (его `react-internal.js` уже сирота), все eslint-зависимости и каталог-пины; `lint` в core → `biome check` + сохранённый `tsc --build`.
- **CI:** заменить `folder: apps/web/dist` на `apps/web-react/dist` (drop-in: base `./` и outDir `dist/` уже совместимы с Pages).
- **Prettier → biome:** корневой `format` = `biome format apps packages --diagnostic-level=error`, новый `format:fix` = `pnpm format --fix`; удалить из корня devDep `prettier` и инлайн-`prettier`-блок, `.prettierignore`; из core — `prettier` и `@types/prettier` (проверить использование); из каталога — пины `prettier` и `@types/prettier` (`@vue/eslint-config-prettier` остаётся до удаления apps/web). Ре-форматting не ожидается: prettier форматирует только root-файлы, core и web-react уже на biome.
- **Удаление apps/web:** каталог `apps/web/`, ~25 Vue/Storybook/Nightwatch каталог-пинов, записи в `allowBuilds` (nightwatch, chromedriver, geckodriver, vue-demi), упоминания в AGENTS.md / CONTRIBUTING.md / docs/api / core README.
- Каждое изменение — отдельный коммит по стадиям; в конце: `pnpm install`, `pnpm build`, `pnpm test`, `pnpm lint` — всё зелёное.

## Constraints

- pnpm workspaces, pnpm 11, Node >=22; `pnpm -r` topological build.
- Core = чистый TypeScript без UI-зависимостей; оба приложения импортируют его `src/` напрямую.
- Biome уже установлен репо-wide (корневой `biome.json`: formatter + linter recommended, ширина 100).
- Vitest уже используется в обоих приложениях (каталог `vitest: ^3.0.0`).
- Husky pre-commit = `format + check + build`; CI = `build + test + lint` + деплой Pages (branch → `gh-pages/<branch>`, tag `v*` → `gh-pages/release`).
- Каталог `pnpm-workspace.yaml` — единственный источник версий (`catalog:`).

## Open questions

- none (все вопросы закрыты исследованием и решением пользователя).

## Changes

- 2026-10-19T09:10:17+03:00 -- v1, initial spec (draft + research): сборка core удаляется (потребителей нет), CI деплоит web-react на Pages, jest только в core, eslint убирается полностью в пользу уже установленного biome
- 2026-10-19T13:21:09+03:00 -- пользователь добавил в скоуп: prettier → biome (корневой `format` на `biome format apps packages`, `format:fix`, чистка prettier-зависимостей/конфигов)
