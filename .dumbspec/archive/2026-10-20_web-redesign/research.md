# Research: 2026-10-20_web-redesign

## A. Current state of `apps/web-react`

### Stack
- pnpm workspace deps via `catalog:` protocol (versions in `pnpm-workspace.yaml`): react/react-dom ^19.2.0, react-router-dom ^6.30.0, zustand ^5.0.0, `@repo/food-recipe-core` `workspace:`.
- dev: vite ^5.4.0, vite-plugin-pwa ^0.19.0, @vitejs/plugin-react ^4.5.0, vitest ^3.0.0, jsdom ^24.1.0, @testing-library/react ^16.3.0, typescript ^5.6.0, @biomejs/biome ^2.4.12.
- Scripts: `build` = `tsc --noEmit` + `vite build`; `test` = `vitest run`; biome for lint/format.
- `vite.config.ts`: plugins react + VitePWA, `base: "./"`, alias `@` → `./src`; PWA `registerType: autoUpdate`, manifest «Кухонный калькулятор»; git info injected via `execSync` → `VITE_GIT_*` env (used by `BuildInfo.tsx`); `test.environment` = custom `src/test/env.ts` (jsdom AbortController fix for Node ≥ 23).
- `index.html`: `lang="ru"`, `theme-color #ffffff`, `#root`, `/src/main.tsx`; SW auto-registered by vite-plugin-pwa (no manual registration, no static manifest).

### Structure (`src/`)
- `App.tsx`, `main.tsx`, `env.d.ts`
- `assets/base.css` (reset + theme vars), `assets/main.css` (~250 lines ported class styles, imported by `main.tsx`)
- `components/`: `BuildInfo.tsx`, `FavoritesList.tsx`, `GrandMother.tsx`, `ui/Modal.tsx`, `RecipeCalculator/{IngredientLine, IngredientLineEdit, ParsedRecipeTable, RawRecipeEditor, RecipeCalculator, RecipeFavoriteButton, RecipeShare, ScaleControls, UnitSelect, constants.ts, utils.ts}`
- `lib/state.ts` (URL/localStorage state), `lib/utils.ts`
- `router/index.tsx` — `createHashRouter`: `/` → `App` (layout), children: index `HomeView` (eager), `about`/`favorite`/`helpers` lazy via `lazyRoute()`.
- `stores/recipe.ts` — `useRecipeStore` (`rawRecipe`, `scale`, `newScale`), zustand/persist with custom `flatStorage` writing three flat localStorage keys (Vue parity); state also mirrored to URL query (base64).
- `stores/favorites.ts` — `useFavoritesStore` (`recipes: RecipeItem[]`), persist with custom storage keeping `localStorage['recipe-favorite']` as plain JSON array.
- `views/`: `HomeView`, `AboutView`, `FavoritesView`, `HelpersView`.
- `test/env.ts` — custom vitest jsdom env.

### CSS
- Plain global CSS only, no modules/CSS-in-JS/Tailwind.
- `base.css`: reset + `--vt-c-*` palette + semantic vars `--color-background/border/text/heading`, `prefers-color-scheme: dark` override block.
- `main.css`: `#root` max-width 640px, `nav`, `.content`, `.modal`, table/`scale_wrap`/`fraction`/`sr-only`/`.page-title` etc. 1:1 port of Vue scoped styles.

### Testing
- Vitest inline in `vite.config.ts`; co-located `*.test.ts(x)` files: stores (2), lib (1), router (1), components (4) + utils.
- Root `pnpm test` = `pnpm -r test`; Playwright smoke/e2e are local-only separate suites.

### Core imports
- Deep direct imports of core `src/` paths (e.g. `@repo/food-recipe-core/src/food_recipe/core/calculator`); no alias, no build step for core.

## B. Design reference: `apps/web-mvp-v2` (static HTML mockup)

- Pure static mockup: `index.html` (442 lines) + `style.css` + 5 `scheme-*.css` + `screenshots/`. NOT a pnpm workspace package (not in pnpm-workspace.yaml).
- Styling: **Tailwind v3 via CDN Play**, `darkMode: 'class'`, font **Manrope** (400–800). Run by opening index.html in a browser.

### Layout
- Fixed left sidebar `<aside id="sidebar">` `w-72`, off-canvas drawer on mobile (`-translate-x-full` toggle + backdrop). Contents: title row (🧮 Калькулятор рецептов + close btn `lg:hidden`), `<nav>` with 3 links (Калькулятор / Избранное / О проекте; active = `aria-current="page" bg-amber-500/10 text-amber-700 dark:text-amber-300`), bottom block (`mt-auto`): theme toggle button (sun/moon + label) and **Цветовая схема `<select>`** (Классика / DOS / Windows 95 / Сайт из 90-х / Аниме / Аппетитный).
- Main: `lg:ml-72`, centered column `max-w-3xl`. Header: circular hamburger button, eyebrow label, share/heart circular icon buttons, h1. `<main>`: stacked section cards (`rounded-2xl border bg-white shadow-sm`): ingredient cards "Для теста"/"Для начинки", "Описание" card, portion-rescale card, `<details>` "Исходный текст".
- Mobile: sticky bottom bar (portions, ×badge, progress, −/+) + drawer sidebar.

### Theming
- Dark/light: Tailwind `darkMode: 'class'` — `document.documentElement.classList.toggle('dark')` (no persistence in mockup, no data-theme).
- 5 color-scheme palettes (scheme-anime/appetite/dos/retro90/win95.css): each defines the SAME 24 CSS variables on `:root` and `.dark`, then overrides specific Tailwind utilities with `!important` (e.g. `.bg-stone-100 { background-color: var(--page) !important; }`).
- Variable set: `--page, --inputd, --card, --card95, --input, --text, --text2, --muted, --muted2, --grip, --gripd, --accent, --accent2, --accentbg, --accentbg2, --accentbg3, --soft, --ring, --accentcontrast, --border, --border2, --divider, --track, --hover`.
- Palettes (light): anime `#fff1f5/#fff/#f77fa8`, appetite `#fff6ec/#fff/#e8590c`, dos `#c9c9c0/#dcdcd2/#007800` (monospace Courier, radii 0), retro90 `#c8c8c8/#ffffe0/#ff00ff` (Comic Sans, hard shadow), win95 `#c0c0c0/#f0f0f0/#000080` (Tahoma, 3D bevels).
- Schemes also override radii/shadows/fonts structurally (win95 bevels: raised `#fff #404040 #404040 #fff`).
- "Классика" (default) = no scheme file, plain stone/amber Tailwind palette.

### Drag handle (хваталка)
- 6-dot grip inline SVG in `<span aria-hidden class="shrink-0 cursor-grab text-stone-300 dark:text-stone-600">` leading every ingredient `<li>`; edited rows use `text-stone-400 dark:text-stone-500`. Schemes map color to `--grip`/`--gripd`. No drag JS — presentation only.

### UI component patterns (Tailwind class recipes)
- Icon button (circular bordered): `grid h-11 w-11 place-items-center rounded-full border ... shadow-sm`.
- Accent icon button (square filled): `rounded-xl bg-amber-500 text-white`.
- Ghost icon button: `rounded-xl text-stone-400 hover:bg-stone-100 hover:text-amber-600`.
- Primary button: `rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 dark:bg-amber-400 dark:text-stone-900`; secondary link-button: underline on hover.
- Stepper buttons: `grid h-11 w-11 place-items-center rounded-xl border text-xl font-bold` (− / +).
- Checkbox: `grid h-6 w-6 place-items-center rounded-md border-2`; checked = `border-amber-500 bg-amber-500 text-white` + white check SVG `stroke-width:3`.
- Card: `rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900`; section header `px-4 pt-4 text-xs font-bold uppercase tracking-wider text-stone-500`.
- List: `<ul class="divide-y divide-stone-100 dark:divide-stone-800">`, rows `flex items-center gap-3 px-4 py-2.5`; edited highlight `bg-amber-500/10 ring-1 ring-inset ring-amber-500/40`.
- Number input: `w-16 rounded-lg border-2 border-amber-500 bg-white px-2 py-0.5 text-right text-sm font-extrabold tabular-nums`.
- Select (compact & full), Textarea (mono), Progress bar (track `h-2 rounded-full`), Badge/pill, native `<details>/<summary>`, value-with-strike pattern (`<s>` old + bold accent new), `tabular-nums` everywhere.
- `:focus-visible` amber outline in style.css; thin warm scrollbars.

### Designed vs implied screens
- Designed: the recipe calculator/detail screen (desktop + mobile) incl. theme/scheme controls in sidebar.
- Implied only (no design): Калькулятор home/list, Избранное, О проекте. → build "по аналогии" with reused components.

### Icons
- Inline SVG Feather/Lucide-style stroke icons, `h-5 w-5`; names: close, calendar, heart, info-circle, sun, moon, menu, share-2, check, pencil, grip-dots (filled).

### Typography/spacing
- Manrope; scale: 11px badges, xs section headers (uppercase tracking-wider), sm body, 2xl/3xl h1, 4xl portions number, xl stepper glyphs.
- Radii: md/lg/xl/2xl/full; `mt-3` between cards; sidebar `w-72 p-4`; column `max-w-3xl px-4 sm:px-6`.

## C. Monorepo conventions (for a new `packages/ui`)

- `pnpm-workspace.yaml`: packages `apps/*` + `packages/*`; catalog has react/react-dom/@types/react*/typescript/vitest/jsdom/@testing-library/react/@vitejs/plugin-react/biome/zustand — **tailwindcss, postcss, autoprefixer are ABSENT** (must be added to catalog). `storeDir: ./.cache/pnpm/v11`, `allowBuilds` list exists.
- Packages: `food-recipe-core` (`@repo/food-recipe-core`, `main`/`types` → `src/index.ts`, no build, no `private`, no `exports` map; deep imports of `src/` are the convention), `typescript-config`. **No `packages/ui` yet.**
- tsconfig presets: `base.json` (strict, ES2022, NodeNext, noUncheckedIndexedAccess true, declaration true), `vite-react.json` (Bundler + react-jsx + noEmit), `react-library.json` (base + `jsx: react-jsx`).
- Naming: `@repo/*`, deps `workspace:`, third-party `catalog:`.
- Root scripts: `build/test/lint` = `pnpm -r …`; `check` = test+lint; `format` = `biome format apps packages`. CI (`ci.yml`): `pnpm install --frozen-lockfile` → `build` → `test` → `lint`, then deploy `apps/web-react/dist` to Pages. A new package is auto-picked up by `pnpm -r`; packages without a given script are skipped.
- Biome: single root `biome.json` (recommended rules, 2-space, width 100, LF, double quotes, VCS ignores).
- Husky pre-commit: `pnpm run pre-commit` = `format && check && build` (full, slow); commit-msg = commitlint (conventional).
- No Tailwind anywhere in workspace packages today.
- No convention for shipping CSS from packages; core is pure TS.
- `apps/web-react/tsconfig.json`: extends vite-react preset, `@/*` → `./src/*`, `noUncheckedIndexedAccess: false`.

## Continuation (2026-10-21): modal + share modal

### 1. Current share modal in apps/web-react

**Files:**
- `apps/web-react/src/components/RecipeCalculator/RecipeShare.tsx` — the share button + modal content
- `apps/web-react/src/components/ui/Modal.tsx` — the shared app-local Modal (default export)
- `apps/web-react/src/assets/main.css` (lines 159–199) — the `.modal` / `.modal-content` / `.modal-content textarea` styles ported from the old Vue app
- `apps/web-react/src/components/RecipeCalculator/RecipeCalculator.tsx` (line 105) — `<RecipeShare recipe={parsed} />` rendered inside `PageHeader`'s `actions` slot (right side of header)
- `apps/web-react/src/components/RecipeCalculator/RecipeShare.test.tsx` — existing tests (bakes calculated values; closes on overlay click)

**RecipeShare.tsx markup (full JSX):**

```tsx
<>
  <IconButton type="button" aria-label="Поделиться" onClick={() => setShowModal(true)}>
    <ShareIcon className="h-5 w-5" />
  </IconButton>
  <Modal open={showModal} onClose={() => setShowModal(false)} ariaLabel="Поделиться рецептом">
    <div className="modal-content">
      <textarea
        readOnly
        aria-label="Текст для обмена"
        value={textRecipe}
        onFocus={onFocusAllSelectCb}
      />
    </div>
  </Modal>
</>
```

On open it clones the recipe (`cloneDeep`), bakes `calculated_value`→`value` and `calculated_portion`→`portion`, serializes with `recipeToText`, calls `navigator.share` (when `canShare`) and `navigator.clipboard.writeText`. `onFocusAllSelectCb` selects the whole textarea and copies to clipboard on focus.

**Modal.tsx (app-local, NOT in packages/ui) — full behavior:**
- Props: `{ open: boolean; onClose: () => void; ariaLabel: string; children?: ReactNode }`
- Renders `<div className="modal modal-overlay" role="dialog" aria-modal="true" aria-label={ariaLabel} tabIndex={-1}>` with a nested `<div className="modal-content">{children}</div>`
- Escape closes; minimal Tab focus trap; focus moves in on open and back to trigger on close; clicking the overlay (target === dialog root) closes.

**CSS (`main.css`):**
- `.modal { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgb(127,127,127,0.4); display:flex; align-items:center; justify-content:center; overflow-y:hidden }`
- `.modal .modal-content { text-align:center; width:100vw; max-width:640px }`
- `.modal-content textarea { width:100%; height:50vh }`

**Why it looks broken (no card layout / overlapping text):** `.modal-content` has **no padding, no background, no border, no radius, no shadow** — it is a bare centered div on the dimmed overlay, so the textarea sits edge-to-edge against the raw 40%-grey backdrop. There is no card surface (no `bg-card`, no `px-*`, no `rounded-card`), no header/close button, and the textarea is unstyled (no border/padding of its own). The nested `<div className="modal-content">` inside RecipeShare is a leftover from the Vue port that duplicates Modal's own `.modal-content` wrapper.

A second consumer of the same Modal: `RecipeCalculator.tsx` lines 93–99 renders `<Modal open={modalShow} onClose={...} ariaLabel="Внимание — рецепт не рассчитан"><GrandMother /></Modal>` (the "GrandMother" guard modal).

### 2. packages/ui component APIs

Barrel: `packages/ui/src/index.ts` re-exports `./badge`, `./button`, `./card`, `./checkbox`, `./details`, `./drag-handle`, `./icons`, `./input`, `./list`, `./progress`, `./select`, `./sidebar`, `./textarea` (plus `UI_PACKAGE_NAME`). **There is no Modal in packages/ui yet.**

**Card** (`packages/ui/src/card/Card.tsx`):
```ts
export type CardProps = HTMLAttributes<HTMLDivElement>;
export function Card({ className, children, ...rest }: CardProps)
// <div className="rounded-card border border-border bg-card shadow-card {className}">

export type CardHeaderProps = HTMLAttributes<HTMLHeadingElement>;
export function CardHeader({ className, children, ...rest }: CardHeaderProps)
// <h2 className="px-4 pt-4 text-xs font-bold uppercase tracking-wider text-muted {className}">
```
No CardFooter / CardBody / CardTitle components exist — Card is a plain surface and CardHeader is the small-caps title. Consumers add their own `px-4 pb-4` content padding (see `RecipeCalculator.tsx` lines 116–122).

**Button** (`packages/ui/src/button/Button.tsx`):
```ts
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";
export type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant; // default "primary"
  size?: ButtonSize;       // default "md" (px-4 py-2.5 text-sm); lg = px-5 py-3 text-base
};
```
Base classes: `inline-flex items-center justify-center gap-2 rounded-control transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`.
Variants: primary `bg-accentbg font-bold text-accentcontrast hover:bg-accentbg2`; secondary `font-medium text-muted underline-offset-2 hover:text-accent hover:underline`; ghost `font-medium text-muted2 hover:bg-hover hover:text-accent`.

**IconButton** (`packages/ui/src/button/IconButton.tsx`):
```ts
export type IconButtonVariant = "bordered" | "accent" | "ghost";
export type IconButtonSize = "md" | "lg";
export type IconButtonProps = ComponentProps<"button"> & {
  variant?: IconButtonVariant; // default "bordered"
  size?: IconButtonSize;       // default "md" (h-11 w-11); lg = h-12 w-12
};
```
Variants: bordered `rounded-full border border-border bg-card text-text2 shadow-card hover:bg-hover`; accent `rounded-control bg-accentbg text-accentcontrast hover:bg-accentbg2`; ghost `rounded-control text-muted2 hover:bg-hover hover:text-accent`.

**Icons** (`packages/ui/src/icons/`): `IconProps = { className?: string; ariaHidden?: boolean } & Omit<SVGAttributes<SVGSVGElement>, "aria-hidden" | "className">`. Stroke icons use `strokeSvgProps` (viewBox 0 0 24 24, `fill:none`, `stroke:currentColor`, `strokeWidth:2`, round caps). **`CloseIcon` exists** (`icons/CloseIcon.tsx`), plus ShareIcon, PencilIcon, SunIcon, InfoIcon, CalendarIcon, MenuIcon, HeartIcon, GripIcon, MoonIcon, CheckIcon, CalculatorIcon.

**Theme tokens used by the kit** (defined by the consuming app): `rounded-card`, `rounded-control`, `border-border`, `bg-card`, `shadow-card`, `text-muted`, `text-muted2`, `text-text2`, `bg-hover`, `bg-accentbg`, `bg-accentbg2`, `text-accentcontrast`, `ring-ring`.

### 3. web-mvp-v2 mockup — modal design

`apps/web-mvp-v2/index.html` contains **no modal/dialog design**. The only overlay is the mobile **sidebar backdrop**:
- line 116: `<div id="sidebar-backdrop" class="fixed inset-0 z-30 hidden bg-black/50 lg:hidden"></div>`
- JS around lines 411–429 toggles `hidden` on it and closes the sidebar on click.
Other fixed elements: sidebar `fixed inset-y-0 left-0 z-40 … -translate-x-full` (line 36) and the mobile bottom bar `fixed inset-x-0 bottom-0 z-20 …` (line 391). No share UI in the mockup. **There is no modal reference design in the mockup app** — a modal design must be made "по аналогии" from the kit's card conventions.

### 4. Existing overlay/dialog patterns in apps/web-react

The only dialog pattern in the app is `apps/web-react/src/components/ui/Modal.tsx` (documented in §1): `role="dialog"`, `aria-modal="true"`, Escape, focus trap, focus restore, overlay-click close, class names `modal` / `modal-overlay` / `modal-content` styled in `assets/main.css`. Consumers: `RecipeShare.tsx` and `RecipeCalculator.tsx` (GrandMother guard modal). Tests target `.modal-overlay` (`RecipeCalculator.test.tsx` line 115, `RecipeShare.test.tsx` lines 48–57). No other `fixed inset-0` / backdrop / overlay usages exist in `src/` (the mobile sidebar/nav do not use a backdrop in web-react).

### 5. Vitest / test setup in packages/ui

- `packages/ui/vitest.config.ts`: `defineConfig({ test: { environment: "jsdom" } })` — jsdom only, no setup file, no globals (tests import `describe/it/expect` from `vitest` explicitly).
- Script: `"test": "vitest run"`; `"lint": "biome check src/ && tsc --noEmit"`.
- Deps: `@testing-library/react`, `jsdom`, `vitest` (all `catalog:`); peer `react`/`react-dom` ^19.2.0.
- Convention (from `card.test.tsx`, `button.test.tsx`, `RecipeShare.test.tsx`): test file sits next to the source (`src/<name>.test.tsx` for a folder module, `src/<name>/<name>.test.tsx` per component dir e.g. `src/card.test.tsx` at src root level alongside `src/card/`), uses `render`/`screen`/`fireEvent` from `@testing-library/react`, asserts on `data-testid`, `getByRole`, `className` substrings and passed-through attributes; `cleanup()` in `afterEach` for interaction tests.
