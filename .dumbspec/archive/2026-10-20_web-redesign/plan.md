# 2026-10-20_web-redesign: implementation plan (redesign apps/web-react)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan
- [x] Draft captured (`draft.md`)
- [x] Research: web-react current state, web-mvp-v2 design reference, monorepo conventions (`research.md`)
- [x] Spec v1 written, open questions resolved (`spec.md`)
- [x] Plan written (`plan.md`)

**Criterion:** draft/research/spec/plan exist in `.dumbspec/current/2026-10-20_web-redesign/`; spec v1 has Created + Changes.
**Commit:** `docs(spec): web-react redesign spec, research and plan`

## Stage 1 — Tailwind v4 in `apps/web-react`
- [x] Tailwind v4 setup: add `tailwindcss` + `@tailwindcss/vite` to catalog, install in app, register `@tailwindcss/vite` in `vite.config.ts`
- [x] `src/assets/main.css`: `@import "tailwindcss"`, `@custom-variant dark (&:where(.dark, .dark *))`, base `@theme` tokens (classic palette from mockup: `--page, --card, --text, --accent, --border, --radius-*, --shadow-card, --font-sans, …`); old global CSS kept for now (replaced in stage 5)
- [x] Red→green test: theme tokens present in app CSS (import css as string); `pnpm -r build/test/lint` green

**Criterion:** build/typecheck/tests green with Tailwind active; tokens defined.
**Commit:** `feat(web): add tailwindcss v4 with semantic theme tokens`

## Stage 2 — `packages/ui` (`@repo/ui`) package + components
- [x] Scaffold `@repo/ui`: `package.json` (main/types → `src/index.ts`, scripts `test`=vitest run, `lint`), `tsconfig.json` (extends `@repo/typescript-config/vite-react.json`), vitest config (jsdom + testing-library), `src/index.ts`
- [x] `Icons` — inline SVG set (close, calendar, heart, info, sun, moon, menu, share, check, pencil, grip-dots) + tests
- [x] `Button` (primary/secondary/ghost), `IconButton` (circular/square/ghost), `Stepper` (− / +) + tests
- [x] `Checkbox`, `Badge`, `DragHandle` (grip, `cursor-grab`, aria-hidden, presentation only) + tests
- [x] `Card` (+ section header), `List`/`Row` (divide-y rows, edited-highlight state), `Details` (disclosure) + tests
- [x] `Input` (number), `Select`, `Textarea` (mono), `ProgressBar` + tests
- [x] `pnpm -r test/lint/build` green (root picks up package automatically)

**Criterion:** `@repo/ui` exports all components; unit tests green; TSDoc on public API.
**Commit:** `feat(ui): add @repo/ui package with core components`

## Stage 3 — Theming: scheme CSS + theme store
- [x] `packages/ui/src/theme/`: `base.css` (token `@theme` mappings + classic `:root`/`.dark` variables) and 5 scheme files (`scheme-anime/appetite/dos/retro90/win95.css`) defining variables under `[data-scheme="…"]` / `.dark[data-scheme="…"]` — no `!important`; structural quirks via tokens (`--radius-card`, `--shadow-card`, `--font-sans`, win95 bevels via `--border-*` vars)
- [x] `apps/web-react/src/stores/theme.ts`: `useThemeStore` (`dark: boolean`, `scheme: SchemeId`, `toggleDark`, `setScheme`) with zustand/persist (localStorage) + red tests (initial, toggle, persistence)
- [x] Apply hook in `App.tsx`: sync `dark` class + `data-scheme` attribute on `document.documentElement` (test via render)
- [x] Import theme CSS from the app (`main.tsx`)

**Criterion:** theme store tests green; toggling dark/scheme changes `<html>` class/attribute in tests.
**Commit:** `feat(theme): dark/light + color schemes with zustand persistence`

## Stage 4 — Sidebar + layout shell
- [x] `Sidebar` component in `@repo/ui` (nav list, bottom slot; off-canvas drawer on mobile with backdrop)
- [x] `App.tsx` shell: sidebar (nav: Калькулятор, Избранное, О проекте, Помощник + theme toggle + scheme `<select>`), header (hamburger on mobile, eyebrow, share/heart icon buttons, h1 slot), content column `max-w-3xl`, mobile sticky bottom bar
- [x] Views keep working inside the shell (smoke tests green)

**Criterion:** layout renders with sidebar; all 4 routes load in smoke tests; mobile drawer markup present.
**Commit:** `feat(web-react): sidebar layout shell with theme controls`

## Stage 5 — Views redesigned on `@repo/ui`
- [x] `HomeView`/`RecipeCalculator` markup 1:1 to mockup: ingredient cards (rows with `DragHandle` + `Checkbox` + name + edited value w/ strike), description card, portion-rescale card (stepper, progress, reset), `<details>` raw text + "Разобрать рецепт" button — logic/stores unchanged
- [x] `FavoritesView` — cards/list by analogy (component reuse)
- [x] `AboutView`, `HelpersView` — cards by analogy (component reuse)
- [x] Remove legacy global CSS (`assets/main.css`/`base.css` leftovers) and unused classes/components
- [x] Update Playwright smoke tests if route markers change
- [x] `pnpm -r build/test/lint` green; smoke suite green

**Criterion:** all sections rendered with `@repo/ui` components; no legacy CSS left; tests + smoke green.
**Commit:** `feat(web-react): redesign views on @repo/ui, drop legacy CSS`

## Stage 6 — Final polish
- [x] `pnpm format` + full `check` + `build` green
- [x] Visual verification: screenshots (desktop light/dark, mobile, 5 schemes) into `.tmp/`
- [x] Final commit of leftovers

**Criterion:** `pnpm run pre-commit` green; screenshots captured.
**Commit:** `fix(web-react): scan @repo/ui for Tailwind utilities; compact theme toggle`

## Stage 7 — `Modal` component in `packages/ui`
- [x] Red test: `packages/ui/src/modal.test.tsx` — renders dialog with `role="dialog"`/`aria-modal`, renders `Card` surface, close `IconButton` with `CloseIcon`, Escape closes, focus trap/restore, overlay click closes, not rendered when `open=false`
- [x] `packages/ui/src/modal/Modal.tsx` — `createPortal` to `document.body`, backdrop overlay, content on `Card`, close via `IconButton` + `CloseIcon`; move a11y logic (Escape, focus trap, focus restore) from app `components/ui/Modal.tsx`; export from `src/index.ts`; TSDoc
- [x] Replace app `components/ui/Modal.tsx` with `@repo/ui` Modal in `RecipeShare.tsx` and `RecipeCalculator.tsx` (guard modal); delete app Modal + `.modal*` CSS from `main.css`; update existing tests querying `.modal-overlay`
- [x] `pnpm -r test/lint/build` green

**Criterion:** `@repo/ui` exports Modal built on Card + IconButton; app uses it for both dialogs; old app Modal/CSS removed; all tests green.
**Commit:** `feat(ui): add Modal component built on Card + IconButton`

## Stage 8 — Share modal fixed, verified desktop + mobile
- [x] `RecipeShare` modal content: `Card` with header «Поделиться рецептом», mono textarea with the share text, close button (from Modal)
- [x] Playwright verification: open share modal on desktop (light) and mobile viewports; screenshots to `.tmp/` (`shot-share-desktop.png`, `shot-share-mobile.png`); modal shows a proper card, no overlapping text
- [x] `pnpm -r build/test/lint` + smoke green

**Criterion:** share modal renders as a styled card on desktop and mobile (screenshots in `.tmp/`); tests + smoke green.
**Commit:** `fix(web-react): restyle share modal on @repo/ui Modal card`

**Stage 8 notes:**
- Share modal content: `h2` heading (CardHeader small-caps classes, plain `h2` to avoid double padding with Modal's `Card p-4`) + muted hint + readOnly mono textarea; clipboard/`navigator.share` behavior unchanged.
- Playwright: desktop 1280×800 and mobile 390×844 (touch) — dialog with Card surface, heading, hint, non-empty textarea, close button; no clipping/overlap; screenshots in `.tmp/`.

**Notes:**
- Screenshots captured to `.tmp/`: `shot-desktop-light.png`, `shot-desktop-dark.png`, `shot-mobile-light.png`, `shot-scheme-{anime,appetite,dos,retro90,win95}.png`.
- Bug found + fixed during visual verification: Tailwind v4 was not scanning the no-build `@repo/ui` package (symlinked under `node_modules`), so transform utilities used only inside `@repo/ui` (`-translate-x-full`, `transition-transform`) were never generated — the mobile off-canvas sidebar was always visible. Fixed with an `@source "../../../../packages/ui/src"` directive in `main.css`.
- Also compacted the sidebar dark-toggle `IconButton` (was `w-full`, icon scaled huge) to a fixed `h-5 w-5` icon.

## Stage 9 — Colocate `packages/ui` component tests with their components
- [x] Move every flat `packages/ui/src/*.test.tsx` into its component directory, named after the component: `badge/Badge.test.tsx`, `button/Button.test.tsx`, `card/Card.test.tsx`, `checkbox/Checkbox.test.tsx`, `details/Details.test.tsx`, `drag-handle/DragHandle.test.tsx`, `icons/Icons.test.tsx`, `input/Input.test.tsx`, `list/List.test.tsx`, `modal/Modal.test.tsx`, `progress/ProgressBar.test.tsx`, `select/Select.test.tsx`, `sidebar/Sidebar.test.tsx`, `textarea/Textarea.test.tsx`
- [x] Fix relative imports inside the moved tests so they resolve from the new location (each test now imports its component dir's `./index`)
- [x] Keep `src/index.test.ts` in `src/` (it tests the package entry point, not a single component)
- [x] `pnpm -r test/lint/build` green (vitest discovers the moved files, no stale flat test files left)

**Criterion:** no `*.test.tsx` files left at the `packages/ui/src/` root except `index.test.ts`; each test sits next to the component it covers; full `pnpm -r test/lint/build` green.
**Commit:** `refactor(ui): colocate component tests with their components`
