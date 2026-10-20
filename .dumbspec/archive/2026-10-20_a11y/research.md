# Research: 2026-10-20_a11y

Context collection for the a11y task (superficial scan: files, dependencies, fixed constraints, existing solutions).

## example-test

Study of `/home/apkawa/code/react-fertilizer-calculator/tests/e2e/a11y.test.ts` (and its project files), for reuse in the simpler food_recipe_manager app.

### 1. Exact dependencies

From `/home/apkawa/code/react-fertilizer-calculator/package.json` (root, devDependencies) and `pnpm-lock.yaml`:

| Package | Specifier | Resolved |
| --- | --- | --- |
| `@axe-core/playwright` | `^4.13.0` | `4.13.0` (peer: `playwright-core >= 1.0.0`) |
| `axe-core` (transitive dep of `@axe-core/playwright`) | — | `4.13.0` |
| `@playwright/test` | `^1.62.1` | `1.62.1` (pulls `playwright-core 1.62.1`) |

Notes:
- `axe-core` is NOT a direct dependency — it comes in transitively via `@axe-core/playwright`. The test imports types from `axe-core` (`import type { AxeResults } from "axe-core"`), which resolves through the transitive package. (In a strict monorepo you may want `axe-core` listed directly for the type import; the example project does not.)
- `pnpm-workspace.yaml` is standard (`packages: apps/*, packages/*`) — nothing a11y-specific there.
- The a11y test lives in root `tests/e2e/a11y.test.ts`, run via `pnpm test:e2e` → `playwright test tests/e2e`. Shared Playwright config (`playwright.config.ts`): `testDir: "./tests"`, `workers: 1`, `retries: 1`, `timeout: 30s`, `expect.timeout: 10s`, single chromium project, `webServer` auto-starts the Vite dev server (`pnpm start`, `http://localhost:3000`, `reuseExistingServer: true`, 120s timeout).

Shared a11y-relevant helpers (NOT a11y-specific):
- `tests/helpers.ts` — `trackConsoleErrors(page)` (collects `console.error` + `pageerror`, filters known React dev warnings) — used by smoke/e2e, not by the a11y test.
- `tests/e2e/shared.ts` — domain helpers for the fertilizer calculator (not a11y-specific).
- The a11y test defines its own small helpers inline (see below); it does not pull a11y logic from a shared module.

### 2. Test structure summary

The file is 120 lines. Structure:

a) **Tags** — WCAG A + AA:
```ts
const A11Y_TAGS = ["wcag2a", "wcag2aa"];
```

b) **Route table + readiness pattern** — a list of `{name, url, marker}` (marker = page-unique visible text, same pattern as the smoke suite; app uses HashRouter so URLs are `/#/…`):
```ts
const routes: RouteCase[] = [
  { name: "calculator", url: "/#/", marker: "Результат расчета" },
  { name: "fertilizer manager", url: "/#/fertilizers", marker: "Нитрат аммония (NH4NO3)" },
  // ...
];

async function openReadyPage(page: Page, url: string, marker: string) {
  await page.goto(url);
  await expect(page.getByText(marker).first()).toBeVisible();
}
```

c) **AxeBuilder wrapper** — one-liner:
```ts
async function analyzePage(page: Page) {
  return new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
}
```

d) **Readable assertion** — flattens violations to one line per offending node (rule id, impact, help, CSS target path) and asserts empty list with the label in the failure message:
```ts
function expectNoViolations(label: string, results: AxeResults) {
  const violations = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} [${v.impact}] ${v.help} — target: ${n.target.join(" ")}`),
  );
  expect(violations, `a11y violations (${label}):\n${violations.join("\n")}`).toEqual([]);
}
```

e) **Per-route loop test**:
```ts
for (const route of routes) {
  test(`a11y: route ${route.name}`, async ({ page }) => {
    await openReadyPage(page, route.url, route.marker);
    expectNoViolations(route.name, await analyzePage(page));
  });
}
```

f) **Overlay states — open BEFORE scanning**, with role-based locators extracted as named helpers (single place to change locators):
```ts
function addFertilizerTrigger(page: Page) { return page.getByRole("button", { name: "Добавить" }); }
function hamburger(page: Page) { return page.getByRole("button", { name: "Меню" }); }
function dropdownChevron(page: Page) { return page.getByRole("button", { name: "Открыть список" }); }
```
Modal test: click trigger, then assert BOTH the dialog role AND real content inside it are visible (so axe scans the open state, not the closed one):
```ts
test("a11y: open modal (fertilizer manager add)", async ({ page }) => {
  await openReadyPage(page, "/#/fertilizers", "Нитрат аммония (NH4NO3)");
  await addFertilizerTrigger(page).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  expectNoViolations("open modal", await analyzePage(page));
});
```
Dropdown test is `test.skip` (deferred): opens via chevron button, waits `expect(page.locator('[role="listbox"]')).toBeVisible()`, then scans.
Sidebar test uses a narrow viewport via `test.use({ viewport: { width: 800, height: 600 } })` inside a `test.describe("open sidebar", ...)`, clicks hamburger, waits for the portal overlay (`#sidebar-root > div`) and an inner control, then scans.

Key patterns:
- Readiness = visible page-unique marker text (reuses the smoke-test convention).
- Open overlays: click role-based trigger → `expect(...getByRole("dialog"))` / `[role="listbox"]` / portal overlay `.toBeVisible()` → then `analyzePage`.
- Assertions: single `expectNoViolations(label, results)` helper; failure message lists every violation node with CSS target.
- No `disableRules`, no custom runners, no `include`/`exclude` options in `AxeBuilder` — plain `withTags(["wcag2a", "wcag2aa"])`.
- Comments document that the suite is intentionally a red baseline until a11y fixes land; locators are role-based precisely because the app gained accessible names (fixes first, then stable role locators).

### 3. Reusable for food_recipe_manager (simpler app)

- **Dependency**: add `@axe-core/playwright` (latest 4.x, e.g. `^4.13.0`) as a root devDependency; `axe-core` comes transitively. `@playwright/test` is already present.
- **Copy the 4 helpers verbatim (they are app-agnostic)**: `A11Y_TAGS`, `openReadyPage(page, url, marker)`, `analyzePage(page)`, `expectNoViolations(label, results)`. This is ~25 lines and covers 90% of the value.
- **Route table**: adapt `routes` to our routes — the marker approach maps 1:1 onto our existing smoke suite (same `tests/smoke` marker convention), so markers can be reused from `tests/smoke/`.
- **Overlay states**: only add open-overlay tests where the app has them (e.g. a confirm dialog / settings modal). Pattern: named role-based trigger helper + `getByRole("dialog")` (or portal selector) visible + one inner content locator visible → scan. Narrow-viewport variant via `test.use({ viewport: { width: 800, height: 600 } })` only if we have a mobile drawer.
- **Config**: no config changes needed — our shared `playwright.config.ts` already covers `tests/e2e`; a new `tests/e2e/a11y.test.ts` is picked up by the same CLI-path suite selection.
- **Expect red baseline**: the example project treats failing a11y tests as the intended red baseline until fixes land — worth doing the same (scan first, fix second) so the suite is written before the DOM changes.
- **Locators**: write role-based locators only after the components have accessible names (the example project's comments make this ordering explicit). For our app, icon-only buttons will need `aria-label` first, otherwise role+name locators for the open-overlay tests won't work.
- **Not needed for us**: the domain helpers in `tests/e2e/shared.ts`, the console-error filter (`trackConsoleErrors`) — those belong to the calculator domain / smoke suite, not to a11y scanning.

## app-inventory

Full inventory of `apps/web-react` (React 19 + Vite SPA, PWA, Zustand, React Router hash mode) for the a11y audit. Source-only (test files, stores, utils excluded).

### 1. Routes

From `apps/web-react/src/router/index.tsx` (hash history):

| Route | Component | Landmark / headings |
| --- | --- | --- |
| `/` (index) | `views/HomeView.tsx` → `RecipeCalculator` | `<main>`, `h2` Калькулятор, `h3` Текстовый рецепт, dynamic `h2` (recipe name), `h2` Описание: |
| `/about` | `views/AboutView.tsx` | `<main>`, `h1` О проекте, `h2` × 5 |
| `/favorite` | `views/FavoritesView.tsx` → `FavoritesList` | `<main>`, `h1` Избранные рецепты |
| `/helpers` | `views/HelpersView.tsx` | **no `<main>`** (bare fragment), `h2` × 3, **no `h1`** |

App layout (`App.tsx`): `header > nav` (3 `NavLink`s), `<Outlet/>`, `footer > BuildInfo`.

### 2. Document level

- `index.html`: `<html lang="ru"` ✓, `<title>Кухонный калькулятор</title>` ✓.
- Landmarks present app-wide: `header`, `nav`, `main` (all routes except `/helpers`), `footer`. No `aria-label` on `<nav>` (acceptable — single nav).
- No skip-to-content link (minor).
- **Headings**: Home page has no `h1` at all (starts at `h2`); `/helpers` has no `h1` and no `main` landmark. → axe `page-has-heading-one` / `heading-order` candidates.

### 3. Per-file interactive element inventory

| File | Element | Current a11y state | Likely violation |
| --- | --- | --- | --- |
| `App.tsx:15` | `img.logo` (nav logo) | `alt=""` (decorative) | OK |
| `App.tsx:16-19` | `NavLink` × 3 (Калькулятор / Избранное / О проекте) | text content = name | OK |
| `views/HomeView.tsx:9` | `h2` (no `h1` anywhere on page) | — | `page-has-heading-one` |
| `views/HelpersView.tsx` | `h2` × 3, no `h1`, no `<main>` | — | `page-has-heading-one`, missing `main` landmark |
| `components/ui/Modal.tsx:30` | overlay `div.modal.modal-overlay` (click-to-close) | plain `div`, **no `role="dialog"`, no `aria-modal`, no `aria-label`, no Escape handler, no focus trap**; `onClick` on static element (biome-ignore ×2 documents parity) | **`dialog` role missing** (WCAG 1.1.1/4.1.2, `aria-modal` pair), keyboard: Escape doesn't close, focus not trapped/moved — WCAG 2.1.2 (focus trap) |
| `components/RecipeCalculator/RecipeCalculator.tsx:94` | GrandMother modal inner `div` with `onClick` (click-to-close) | static element with click handler (biome-ignore ×2) | `no-static-element-interactions` / keyboard access (WCAG 2.1.1) — redundant once Modal becomes a real dialog with close button |
| `components/RecipeCalculator/RecipeCalculator.tsx:101` | `h2 {parsed.name}` — can render empty | dynamic heading, may be empty | `empty-heading` when recipe unnamed |
| `components/RecipeCalculator/RecipeCalculator.tsx:117` | `h2` Описание: | OK | — |
| `components/RecipeCalculator/RecipeCalculator.tsx:131` | `h3` Текстовый рецепт | follows `h2`s, no `h1` on page | `heading-order` (page-level issue) |
| `components/RecipeCalculator/RawRecipeEditor.tsx:24` | `textarea#raw_recipe` (raw recipe input) | **no `<label htmlFor>`, no `aria-label`**; only sibling `div` text "* Вставьте сюда текст…" (not a label) | **`label`** (WCAG 1.3.1) |
| `components/RecipeCalculator/ScaleControls.tsx:32` (`LazyNumberInput`) | `input#scale` number (Рецепт на N порций) | **no label**; surrounding text "Рецепт на … порций" is plain `div` text, not associated | **`label`** (WCAG 1.3.1) |
| `components/RecipeCalculator/ScaleControls.tsx:72` | `input#new_scale` number (Пересчитать на N порций) | **no label** (same pattern) | **`label`** (WCAG 1.3.1) |
| `components/RecipeCalculator/ParsedRecipeTable.tsx:26-29` | `<th></th>` × 4 in `thead` | empty header cells; table has `thead`/`tbody`/`colgroup`, no `caption` | not an axe violation; empty `th` + no `caption` is a readability nit |
| `components/RecipeCalculator/IngredientLine.tsx:28` | checkbox `input` (strikethrough) | **implicitly labeled** — wrapped in `<label>` containing ingredient name text | OK |
| `components/RecipeCalculator/IngredientLine.tsx:46` | `button` "Edit" | text content = name | OK (name is English, page is ru — consistency nit only) |
| `components/RecipeCalculator/IngredientLineEdit.tsx:114` | `input.concentration` number | **no label**; adjacent text "Концентрация:" is plain text node, not associated | **`label`** (WCAG 1.3.1) |
| `components/RecipeCalculator/IngredientLineEdit.tsx:139` | `input.edit-value` number | **no label** | **`label`** (WCAG 1.3.1) |
| `components/RecipeCalculator/IngredientLineEdit.tsx:157` | `button` "Save" | text content = name | OK (English name, ru page — nit) |
| `components/RecipeCalculator/UnitSelect.tsx:28` | `<select>` (unit picker) | **no label, no `aria-label`** | **`label`** (WCAG 1.3.1) |
| `components/RecipeCalculator/RecipeFavoriteButton.tsx:20` | `button` (Добавить/Обновить избранное) | text content = name, state reflected in text | OK |
| `components/RecipeCalculator/RecipeShare.tsx:59` | `button` "Copy/Share" | text content = name | OK (English name, ru page — nit) |
| `components/RecipeCalculator/RecipeShare.tsx:62` | `Modal` (share dialog) | same as Modal.tsx — **no dialog role/name/focus trap/Escape** | **`dialog` role missing**, WCAG 2.1.2 |
| `components/RecipeCalculator/RecipeShare.tsx:64` | `textarea` readOnly (shared recipe text) | **no label, no `aria-label`** | **`label`** (WCAG 1.3.1) |
| `components/FavoritesList.tsx:44` | `<a onClick>` (recipe name → open in calculator) — **no `href`** | static element with click handler; not focusable, not keyboard-activatable (biome-ignore ×3 documents parity with Vue `<a @click>`) | **`no-static-element-interactions`**, `no-keyboard-access` (WCAG 2.1.1) — needs `href`/`role="button"` + `tabIndex`/keyboard handler |
| `components/FavoritesList.tsx:47` | `button.remove-item` "X" | has accessible name "X" — **weak/ambiguous** name (no aria-label like "Удалить") | not a hard axe violation; poor accessible name (WCAG 4.1.2 quality) |
| `components/FavoritesList.tsx:35` | `table.table` — `tbody` only, **no `thead`/`th`/`caption`** | data table with rows (name + remove) but no header row | not an axe violation for simple tables; header row recommended |
| `components/GrandMother.tsx:9` | `img` grandmother.jpg | `alt=""` (decorative), `title` attribute carries the joke text | OK (alt="" + title is acceptable for decorative) |
| `components/BuildInfo.tsx:13` | `div.build-info` with `title` | non-interactive text | OK |
| `views/AboutView.tsx:90,96` | `<a href>` × 2 (github issues, Github) | text content = name, real href | OK |

### 4. Summary of likely axe violations (wcag2a/wcag2aa)

1. **`label`** (WCAG 1.3.1) — 7 inputs have no programmatic label:
   - `#raw_recipe` textarea (RawRecipeEditor)
   - `#scale` number (ScaleControls)
   - `#new_scale` number (ScaleControls)
   - concentration number input (IngredientLineEdit)
   - edit-value number input (IngredientLineEdit)
   - unit `<select>` (UnitSelect)
   - share textarea readOnly (RecipeShare)
2. **`dialog` / missing-dialog** — `components/ui/Modal.tsx` renders a plain `<div>` overlay: no `role="dialog"`, no `aria-modal="true"`, no accessible name, no focus trap, no Escape-to-close, no focus return on close. Used by two modals: GrandMother guard modal (RecipeCalculator) and Share modal (RecipeShare).
3. **`no-static-element-interactions` / keyboard access** (WCAG 2.1.1):
   - `FavoritesList.tsx` `<a onClick>` with no `href` — not keyboard reachable at all.
   - Modal overlay `div` + GrandMother inner `div` click-to-close (both have biome-ignore comments claiming Vue parity).
4. **`page-has-heading-one` / `heading-order`**:
   - Home route: no `h1` (starts at `h2`).
   - `/helpers` route: no `h1`, no `<main>` landmark.
5. **`empty-heading`** (conditional): `RecipeCalculator.tsx` renders `<h2>{parsed.name}</h2>` which can be empty.
6. Not violations but noted:
   - `FavoritesList` remove button named only "X" (weak name).
   - Favorites table has no header row/caption.
   - Mixed English/Russian control names ("Edit", "Save", "Copy/Share") on a ru-language page (consistency).
   - No skip link (minor).
   - `ParsedRecipeTable` empty `<th>` cells (no `caption`) — nit.

## test-infra

### playwright.config.ts (root — shared by smoke + e2e)

Full config (`playwright.config.ts`, 32 lines):

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  fullyParallel: false,
  retries: 1,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm -C apps/web-react dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- `testDir: "./tests"` — suite is selected by CLI path arg (`tests/smoke` / `tests/e2e`), not by project.
- Single project `chromium` (Desktop Chrome device); `workers: 1`, `fullyParallel: false`, `retries: 1`, reporter `list`.
- Timeouts: test `30_000` ms, expect `10_000` ms, webServer `120_000` ms.
- `baseURL: http://localhost:5173` → tests navigate with relative paths (`page.goto("/#/about")`).
- Dev server: `pnpm -C apps/web-react dev` (Vite), `reuseExistingServer: true`.

### tests/helpers.ts

- `isKnownDevWarning(text)` — filters known React 19 dev-only console noise (act() env, React DevTools hint, duplicate-key warnings); strips optional `Warning: ` prefix, matches by content.
- `trackConsoleErrors(page: Page): () => string[]` — registers `console` (type `error`, excluding known dev warnings) and `pageerror` handlers; returns a getter for `expect(errors()).toEqual([])`.
- Only shared browser-test helper; imported as `../helpers` from test dirs.

### Test files

File list:
- `tests/helpers.ts`
- `tests/smoke/routes.test.ts`
- `tests/e2e/placeholder.test.ts`
- `tests/e2e/shared.ts`

Smoke style (`tests/smoke/routes.test.ts`):
- Route cases as a data array `{ name, url, marker }` over a `RouteCase` interface:
  - home `/#/` → "Текстовый рецепт"; about `/#/about` → "Цель проекта"; favorite `/#/favorite` → "Избранные рецепты"; helpers `/#/helpers` → "Таблица плотности".
- One test per route via `for (const route of routes)` → `test(\`smoke: ${route.name}\`, async ({ page }) => {...})`.
- Pattern: `const errors = trackConsoleErrors(page); await page.goto(route.url); await expect(page.getByText(route.marker).first()).toBeVisible(); expect(errors(), ...).toEqual([]);`
- Markers are short, static, route-unique strings (Russian UI strings, not in shared nav) so `getByText` resolves to a single element.

E2E stubs (`tests/e2e/placeholder.test.ts`):
- `test.describe` blocks: "e2e: main flow", "e2e: navigation", "e2e: persistence", "e2e: a11y" — each with a single `test.fixme` stub (so `pnpm test:e2e` runs with zero failures).
- The a11y fixme explicitly plans: "run an axe-core accessibility scan over every route and assert zero violations. Blocked until the a11y work lands." Each future test will use `trackConsoleErrors` from `../helpers` and locators from `./shared`.
- `tests/e2e/shared.ts` is an empty stub (`export {};`) intended for domain locators/factories (mirrors sibling project `react-fertilizer-calculator`).

### Dependencies

Root `package.json` devDependencies (relevant):
- `"@playwright/test": "^1.64.1"` — NOT in the pnpm catalog; direct version pin in root only. Installed version: **1.64.1**.
- No `axe-core` or `@axe-core/playwright` anywhere: absent from root package.json, `apps/web-react/package.json`, pnpm catalog, and `node_modules` (verified).

`apps/web-react/package.json` devDependencies: `@biomejs/biome`, `@testing-library/react`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `jsdom`, `typescript`, `vite`, `vite-plugin-pwa`, `vitest` (all `catalog:`). No Playwright, no axe.

**Where a new devDependency (`@axe-core/playwright`) belongs: root `package.json`** — `@playwright/test` lives there, the Playwright config, tests, and test scripts are all root-level. Add it next to `@playwright/test` (direct pin, e.g. `^1.x`, matching its style — playwright itself is not catalog-managed). Then install with `pnpm_config_store_dir=./.cache/pnpm/v11 pnpm install`.

### Workspace layout

`pnpm-workspace.yaml`:
- `packages: [apps/*, packages/*]` — root is not a workspace package member; root package.json owns root-level tooling deps (Playwright, biome, husky, commit tooling).
- `catalog:` block centralizes shared versions (react, vite, vitest, typescript, zustand, etc.) — Playwright is deliberately not in the catalog.
- `storeDir: ./.cache/pnpm/v11`; `allowBuilds` lists `@swc/core`, `core-js`, `esbuild`.

### Browsers

- Env var: `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright` — set inline by the `test:smoke` / `test:e2e` scripts in root package.json:
  - `"test:smoke": "PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright playwright test tests/smoke"`
  - `"test:e2e": "PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright playwright test tests/e2e"`
- Installed browsers in `./.cache/ms-playwright/`: `chromium-1248`, `chromium_headless_shell-1248`, `ffmpeg-1013` (Chromium only, matching the single `chromium` project).
- Install command per AGENTS.md: `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright pnpm exec playwright install chromium`.
- Both suites are local-only (not run in CI); CI is `.github/workflows/ci.yml` (build + Pages deploy).

### Naming / conventions summary

- File per suite concern: `tests/smoke/routes.test.ts`, future `tests/e2e/<scenario>.test.ts` + `tests/e2e/shared.ts`.
- Test names: `smoke: <route>` per case; e2e grouped in `test.describe("e2e: <area>")` with `test(\`e2e: <description>\`)`.
- Base URL comes from `use.baseURL` in the shared config (no per-test env); hash-routed SPA paths look like `/#/<route>`.
- Every test tracks console/page errors via `trackConsoleErrors` and asserts `toEqual([])`.

## playwright-cli

Source: `/home/apkawa/.agents/docs/playwright-cli-sandbox.md` (primary), plus the `playwright-cli` skill at `/home/apkawa/.agents/skills/playwright-cli/SKILL.md` (loaded via the skill tool) for element-targeting details.

### 1. How playwright-cli is launched/used in the sandbox

The sandbox gives each `bash` invocation a fresh /tmp and drops processes, so the browser must run as a persistent **background job** and be driven from separate invocations:

- Env vars are **required on every** playwright-cli command, otherwise EROFS:
  > "Env vars for **all** playwright-cli commands (without them, EROFS: the daemon writes logs/sockets to `~/.cache` and `/tmp`, which are not writable/invocation-surviving):"
  ```bash
  export XDG_CACHE_HOME=$PWD/.cache                    # daemon registry → .cache/ms-playwright/daemon (shared, visible to the user in list/show)
  export PLAYWRIGHT_BROWSERS_PATH=$PWD/.cache/ms-playwright
  export PWTEST_SOCKETS_DIR=$PWD/.cache/pw-sockets     # daemon sockets (default /tmp — does not survive invocation)
  ```
- Launch (background job, outlives bash invocations):
  > "The persistent browser runs as a **background job** (run_in_background) and outlives individual bash invocations:"
  ```bash
  cd <project> && export …three env vars above… && playwright-cli -s=ui open http://localhost:3000/ && sleep 3600
  ```
- Drive from regular invocations:
  > "Drive it from regular invocations: `playwright-cli -s=ui snapshot/click/eval/goto …` (same env). Stopping: `job_kill` (job) or `playwright-cli -s=ui close`."
- Stale-session trap:
  > "**Stale-session hang**: leftover `.session/.err` of a dead daemon in `.cache/ms-playwright/daemon/<workspace-hash>/` → `open` with the same name hangs (resume attempt). Before a new `open`: `rm .cache/ms-playwright/daemon/<hash>/<name>.*`. `kill-all` does not help — the processes live in a dead sandbox."
- Persistent state: `.cache/ms-playwright` is bind-mounted at `~/.cache/ms-playwright` and **shared with the user**; agent sessions are visible to the user via `playwright-cli list/show`.
- Known non-recipes: a lone `PLAYWRIGHT_BROWSERS_PATH` (daemon path derives from `XDG_CACHE_HOME`) and a fake `HOME=./.cache/pw-home` (sessions invisible to the user) both fail.

### 2. How it locates elements for interaction

The doc itself says nothing about selectors. The skill (which the doc's AGENTS.md pointer requires reading) answers this:

- **Default mechanism = refs from the page snapshot**, not user-written selectors:
  > "By default, use refs from the snapshot to interact with page elements."
  ```bash
  # get snapshot with refs
  playwright-cli snapshot
  # interact using a ref
  playwright-cli click e15
  ```
- CSS selectors and Playwright locators are supported alternatives:
  > "You can also use css selectors or Playwright locators."
  ```bash
  # role locator
  playwright-cli click "getByRole('button', { name: 'Submit' })"
  # test id
  playwright-cli click "getByTestId('submit-button')"
  ```
- The snapshot is an **accessibility-tree representation**: the skill's example snapshot shows role-based nodes (`- [button "Sign in"]: e15`-style lines with roles, accessible names, and ref ids), and `find` searches that snapshot:
  > "search the snapshot for text or a regexp, returns matching nodes with surrounding context" — `playwright-cli find "Sign in"` / `find --regex "/sign (in|up)/i"`.
- Role locators match on the **accessible name** (`getByRole('button', { name: 'Submit' })`), and the skill explicitly references `aria-label` as an inspectable attribute:
  > `playwright-cli eval "el => el.getAttribute('aria-label')" e7` (references/element-attributes.md).
- Locators can be generated from a ref: `playwright-cli generate-locator e5 --raw`.

So: yes — the ref/snapshot model relies on accessible names (role + accessible name = aria-label, button text, etc.) to build the snapshot nodes and their refs; `getByRole`/`getByLabel`-style locators also key off accessible names. Elements with no accessible name appear in the snapshot as generic nodes (or not at all), which makes them hard to find via `find` and hard to target deterministically.

### 3. Why a11y improvements (aria-label etc.) directly improve playwright-cli navigation

The doc does not state this explicitly; the inference comes from the skill's targeting model:

- The snapshot **is** the accessibility tree, and refs (`e15`) are assigned to nodes in it — the primary interaction channel. Adding `aria-label`/proper roles to icon-only buttons gives those nodes a stable, human-meaningful accessible name, so:
  - `playwright-cli find "<name>"` / `find --regex` locate the node directly (searches the snapshot text);
  - `getByRole('button', { name: '<aria-label>' })` locators work reliably;
  - snapshot diffing / ref-based clicks are unambiguous (no guessing which of several identical `<button><svg/></button>` nodes is which).
- The skill's element-attributes reference explicitly treats `aria-label` as a property of interest (`eval "el => el.getAttribute('aria-label')" e7`), confirming accessible names are first-class in the tooling.
- Concrete payoff for this project: the smoke/e2e suites and interactive UI verification both run through this same snapshot/locator model, so a11y fixes (aria-label on icon buttons, proper roles, visible text) make every `click eN` / `find "…"` / `getByRole(…)` step more deterministic — directly reducing flaky ref selection and unfindable elements.
