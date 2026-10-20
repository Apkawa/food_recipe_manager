# 2026-10-19_add-tests: добавление тестов

**Created:** 2026-10-19T23:36:46+03:00

## Scope

В скоуп:
1. **Smoke-тесты** — Playwright-связка «живость маршрутов + ноль ошибок консоли» (по образцу react-fertilizer-calculator): корневой `playwright.config.ts`, `tests/smoke/routes.test.ts`, `tests/helpers.ts` (`trackConsoleErrors`), скрипт `pnpm test:smoke`.
2. **Юнит-тесты калькулятора** — расширение существующей Vitest-связки в core (`tests/unit/core/calculator/`) покрытием непротестированных граничных случаев `calculateScale` и `recipeScale`.
3. **E2E-заготовка** — скелет `tests/e2e/` на том же Playwright: stub-файлы с `test.fixme`/TODO (полные сценарии и a11y — отдельная задача после a11y), скрипт `pnpm test:e2e`.

Не в скоуп:
- Полные e2e-сценарии (отдельная задача после a11y).
- a11y-тесты (axe-core и т.п.).
- Изменения CI: как в референсе, smoke/e2e — local-only. CI уже гоняет `pnpm -r test` (Vitest), новые юнит-тесты подхватываются автоматически, `test:e2e` в CI остаётся закомментированным.

## Approach

Повторяем организацию референса react-fertilizer-calculator, адаптируя под наш monorepo:

- **Два раннера, строго разделённых:** Vitest (юнит, уже настроен в обоих воркспейсах) + Playwright (smoke/e2e, добавляется).
- **Один общий `playwright.config.ts` в корне**; smoke и e2e различаются только путём на CLI (`playwright test tests/smoke` / `tests/e2e`). Настройки как в референсе: 1 worker, без параллелизма, 1 retry, list-репортёр, trace/screenshot при неудаче, `webServer` с `reuseExistingServer: true` (dev-сервер `pnpm -C apps/web-react dev`, baseURL `http://localhost:5173` — стандартный порт Vite).
- **Smoke** = table-driven по 4 маршрутам (`/`, `about`, `favorite`, `helpers`): маркер-текст страницы виден + ноль console/page-ошибок. Заголовки тестов с префиксом `smoke: …`.
- **Юнит-тесты** — расширяем существующие table-driven тесты в `packages/food-recipe-core/tests/unit/core/calculator/` (паттерн `Cases<Arg, Expected>` + `it.each` + `toStrictEqual`), добавляя непротестированные граничные случаи. Тесты ложатся в существующие глобы `tests/**/*.test.ts` — без изменений конфигов и CI.
- **E2E-заготовка** — `tests/e2e/` с stub-файлом(-ами) `test.fixme` и TODO-комментариями о будущих сценариях (главный сценарий, навигация, persistence, a11y — после отдельной задачи).
- Зависимости: `@playwright/test` в root devDependencies; браузеры ставим в `./.cache/` через `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright`.
- Корневые скрипты: `test:smoke` и `test:e2e` (корень не участник `pnpm -r`, `pnpm test` не трогаем).
- Лайнтестов в корне (`tests/`): существующий lint покрывает только `src/` и `tests/` внутри воркспейсов; корневые `tests/` в текущий lint не включаем (как в референсе — там тоже `tsc -p`/biome по папкам packages/apps).

## Constraints

- pnpm 11, Node >=22, monorepo без Turborepo.
- **Vitest 3 уже настроен** в core (`vitest.config.ts`, node env, `globals: true`, алиасы `@app/*`, `@tests/*`) и web-react (jsdom, кастомный env `src/test/env.ts`). 17 существующих тест-файлов, включая `tests/unit/core/calculator/{calculateScale,recipeScale}.test.ts`.
- CI (`.github/workflows/ci.yml`): build → `pnpm run test` → lint; e2e-шаг закомментирован (TODO про Cloudflare). Новые юнит-тесты подхватываются без изменений CI.
- Core без build-шага; тесты импортируют `src` напрямую.
- web-react: hash-роутер, 4 маршрута; `base: "./"` (GitHub Pages).
- Calculator API: ровно две функции — `calculateScale(Ingredient): number | null` и `recipeScale(Recipe, number): Recipe` (in-place мутация, округление до 2 знаков, range-aware).
- Pre-commit хук: `format + check + build` (проходит и через тесты).

## Open questions

- none — все вопросы draft'а закрыты research'ом (раннер, формат smoke, формат e2e-заготовки, существующая инфраструктура).

## Changes

- 2026-10-19T23:36:46+03:00 -- v1, initial spec (draft + research)
