# 2026-10-20_web-redesign: редизайн apps/web-react

**Created:** 2026-10-20T23:02:09+03:00

## Scope

Редизайн `apps/web-react` по мотивам наброска верстки `apps/web-mvp-v2`:

- **В scope:**
  1. Подключение **Tailwind CSS v4** (через `@tailwindcss/vite`) в `apps/web-react`; переход от рукописного global CSS (`assets/main.css`/`base.css`) к утилитам + семантическим токенам.
  2. **Переключение тёмной/светлой темы и выбор цветовой схемы** (6 вариантов: классика + anime, appetite, dos, retro90, win95 — из mockup). Состояние (`dark`, `scheme`) — в zustand-store с persist в localStorage.
  3. **DnD ингредиентов — НЕ реализовывать**; добавить только визуальную «хваталку» (drag handle, grip-иконка с `cursor-grab`) в строках ингредиентов, как в дизайне.
  4. **Сайдбар** по дизайну mockup: навигация (Калькулятор, Избранное, О проекте, Помощник), переключатель темы, селектор цветовой схемы; на мобильном — off-canvas drawer с backdrop.
  5. Новый пакет **`packages/ui`** (`@repo/ui`) с переиспользуемыми компонентами: Button, IconButton, Checkbox, Card, List/Row, Input, Select, Textarea, Badge, ProgressBar, Stepper, DragHandle, Details, Icons + темы (токены и цветовые схемы).
  6. **Остальные разделы** (Избранное, О проекте, Помощник), дизайна которых нет, — сделать по аналогии, из компонентов `@repo/ui`.
  7. **Компонент Modal в `packages/ui`** (`@repo/ui`): оверлей с backdrop + центрированная карточка, максимально реиспользуя существующие `Card` и `Button`/`IconButton` (кнопка закрытия); доступность (`role="dialog"`, `aria-modal`, Escape, фокус внутри).
  8. **Починка модалки шаринга** в `apps/web-react`: текущая модалка шаринга без верстки (текст налезает, нет карточки — см. скриншот в `draft.md`); переделать на компонент Modal; проверить работу в desktop и mobile (Playwright-скриншоты).

- **Out of scope:**
  - Реальная реализация drag-and-drop (только хваталка).
  - Изменения `@repo/food-recipe-core` и логики парсинга/расчёта.
  - Новая логика/маршруты сверх существующих (home, favorite, about, helpers).
  - Изменения PWA-манифеста и CI.

## Approach

- **Tailwind v4** (CSS-first, без tailwind.config.js): `@import "tailwindcss"` в CSS приложения, `@tailwindcss/vite` плагин, class-based dark mode через `@custom-variant dark (&:where(.dark, .dark *))`.
- **Токены вместо хака mockup.** В mockup схемы переопределяют утилиты Tailwind через `!important` — в проекте делать иначе: семантические CSS-переменные (`--page`, `--card`, `--accent`, `--text`, `--border`, `--radius-*`, `--shadow-card`, `--font-sans` и т. д. — набор из mockup) объявляются в `@theme` как токены Tailwind (`--color-page: var(--page)` → утилита `bg-page`). Файлы схем лишь переопределяют переменные под `[data-scheme="…"]` / `.dark[data-scheme="…"]`; «классика» — базовые значения. Никаких `!important`.
- **Темы:** `<html>` получает класс `dark` и атрибут `data-scheme`. Store `useThemeStore` (zustand + persist, localStorage) в `apps/web-react/src/stores/theme.ts`; применяет состояние к DOM небольшой хук в `App.tsx`.
- **`packages/ui`** — workspace-пакет `@repo/ui` по конвенции core: `main`/`types` → `src/index.ts`, без build-шага (Vite компилирует TS напрямую), TSDoc на публичном API, юнит-тесты vitest + testing-library. Компоненты — чистый React + классы Tailwind на токенах; CSS тем (базовые переменные + 5 файлов схем) живёт в `packages/ui/src/theme/` и импортируется приложением.
- **Layout приложения:** `App.tsx` — shell: Sidebar (левый, `w-72`, на mobile — drawer) + колонка контента `max-w-3xl`; header с икон-кнопками; на mobile — sticky-нижняя панель (порции, прогресс, −/+).
- **Разделы:** HomeView (калькулятор) — 1:1 по mockup (карточки ингредиентов с хваталкой и чекбоксами, описание, резюцирование, «Исходный текст» в `<details>`); Favorites/About/Helpers — по аналогии из тех же компонентов (карточки, списки, бейджи).
- **Шрифт:** Manrope (Google Fonts `<link>` в `index.html`), `tabular-nums` для чисел.
- **Modal в `@repo/ui`:** `createPortal` в `document.body`; оверлей `fixed inset-0 z-50` с backdrop; контент — `Card` (padding, заголовок-хедер, body); кнопка закрытия — `IconButton` (ghost/bordered) с `CloseIcon` в углу карточки; a11y переносится из app-модалки: `role="dialog"`, `aria-modal`, Escape, focus-trap, возврат фокуса. App-локальная `components/ui/Modal.tsx` + её `.modal*` CSS удаляются; `RecipeShare` и guard-модалка `RecipeCalculator` переключаются на `@repo/ui` Modal.
- **Модалка шаринга:** Card с хедером «Поделиться рецептом», textarea (mono) со ссылкой и кнопкой закрытия; проверка в desktop и mobile через Playwright-скриншоты.
- **Тестирование:** TDD на каждом этапе — vitest (stores, компоненты UI, views); smoke-тесты Playwright обновляются, если ломается (маркеры по маршрутам).
- **Colocation тестов в `@repo/ui`:** тест каждого компонента лежит рядом с ним — `src/<dir>/<Component>.test.tsx` (например, `badge/Badge.test.tsx`); `index.test.ts` (тест точки входа пакета) остаётся в корне `src/`.

## Constraints

- pnpm workspaces: `apps/*` + `packages/*`; зависимости — `catalog:` (нужно добавить в каталог: `tailwindcss`, `@tailwindcss/vite`), workspace-пакеты — `workspace:`.
- `apps/web-react`: React 19, Vite 5, `base: "./"`, PWA (vite-plugin-pwa, autoUpdate), hash-роутинг, deploy на GitHub Pages (CI деплоит `dist/`).
- Токены/шрифты mockup: Manrope 400–800; радиусы md/lg/xl/2xl/full; отступы `p-4`, `mt-3`, sidebar `w-72`.
- 24 CSS-переменные схем mockup: `--page, --inputd, --card, --card95, --input, --text, --text2, --muted, --muted2, --grip, --gripd, --accent, --accent2, --accentbg, --accentbg2, --accentbg3, --soft, --ring, --accentcontrast, --border, --border2, --divider, --track, --hover`.
- Core (`@repo/food-recipe-core`) — чистый TS, deep-импорты `src/`, без UI-зависимостей; трогать не нужно.
- Biome (root `biome.json`, recommended, width 100), TSDoc на публичных API, conventional commits (commitlint).
- Husky pre-commit: `format + check + build` (медленно, но обязательно зелёным).
- CI: `pnpm -r build/test/lint`; новый пакет автоматически подхватывается `pnpm -r` (скриптов без build у него нет — ок).
- Виталий: `noUncheckedIndexedAccess: false` в web-react.

## Open questions

- none (все вопросы из черновика решены в Approach: набор схем — 6 шт. из mockup; сайдбар — навигация + темы; тесты UI — vitest+testing-library; `packages/ui` — workspace-пакет без build по конвенции core).

## Changes

- 2026-10-20T23:02:09+03:00 -- v1, initial spec (draft + research)
- 2026-10-21T15:12:49+03:00 -- user добавил scope: компонент Modal в `@repo/ui` (на Card + Button/IconButton) и починка модалки шаринга с проверкой desktop/mobile
- 2026-10-21T16:26:50+03:00 -- user добавил требование: тесты компонентов в `packages/ui` должны находиться рядом с соответствующим компонентом (colocation); добавлен stage 9 в план
