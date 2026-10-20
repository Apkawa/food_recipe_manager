# Research: 2026-10-19_add-tests

## Current project: food_recipe_manager

### Layout
- pnpm 11 workspaces monorepo (no Turborepo), Node >=22. Workspaces: `apps/*`, `packages/*`.
  - root `food_recipe_manager`
  - `apps/web-react` → `web-react` (React 19 + Vite SPA, PWA, Zustand, React Router hash mode)
  - `packages/food-recipe-core` → `@repo/food-recipe-core` (pure TS, no build step; `main`/`types` point at `src/index.ts`)
  - `packages/typescript-config` → `@repo/typescript-config` (presets: base, nextjs, react-library, vite-react)
- `pnpm-workspace.yaml` has a `catalog:` pinning versions: `vitest: ^3.0.0`, `@testing-library/react`, `jsdom: ^24.1.0`, `vite: ^5.4.0`, etc. `storeDir: ./.cache/pnpm/v11`.

### IMPORTANT: a test runner already exists
- **Vitest 3 is configured in BOTH workspaces.** No Jest, no Playwright anywhere.
- `packages/food-recipe-core/vitest.config.ts`: node env, `globals: true`, includes `tests/**/*.test.ts`, `tests/**/*.spec.ts`, `src/**/*.test.ts`, `src/**/*.spec.ts`; excludes `node_modules` and `tests/e2e/**`. Aliases: `@app/*` → `./src/food_recipe/*`, `@tests/*` → `./tests/*`.
- `apps/web-react/vite.config.ts`: vitest config inside `defineConfig` (`vitest/config`), custom jsdom env at `apps/web-react/src/test/env.ts` (restores host `AbortController`/`AbortSignal` — Node ≥23 undici workaround for react-router navigation tests).
- Scripts:
  - root: `test` → `pnpm -r test`; `check` → `pnpm run test && pnpm run lint`; `pre-commit` → format + check + build.
  - core: `test` → `pnpm run test:unit` → `vitest run`; `lint` → `biome check src/ tests/ && tsc --build`. No `build` script.
  - web-react: `test` → `vitest run`; `type` → `tsc --noEmit -p .`.
- **17 existing test files:**
  - core `tests/unit/`: `core/calculator/calculateScale.test.ts`, `core/calculator/recipeScale.test.ts`, `core/ingredient_type/{calculateConcentration,parseIngredientType}.test.ts`, `core/parser/{parseRecipeLine,parseText}.test.ts`, `core/unit/{convertIngredientUnit,getAvailableConvertUnits}.test.ts`, `utils/{number,stripLine}.test.ts`, `example.test.ts`, `types.d.ts` (shared `Cases<...>` helper).
  - core `src/food_recipe/utils/vulgar-fractions/tests/`: `numberToVulgar.spec.ts`, `parseVulgars.spec.ts`, `toDecimal.spec.ts`, `toVulgar.spec.ts`.
  - web-react `src/`: `components/FavoritesList.test.tsx`, `components/RecipeCalculator/{RecipeCalculator,RecipeFavoriteButton,RecipeShare}.test.tsx`, `components/RecipeCalculator/utils.test.ts`, `lib/state.test.ts`, `router/index.test.tsx`, `stores/{favorites,recipe}.test.ts`.
- **Test conventions:** core tests import via `@app/core/...`, `@tests/unit/types`; global `describe`/`it` (`globals: true`); table-driven `it.each(cases)` with `Cases<Arg, Expected>` = `{ arg, expected }[]`, asserting `toStrictEqual`. Web-react tests colocated `.tsx` with components, using `@testing-library/react`.
- Committed `coverage/` dir exists in core (lcov/clover) — coverage has been generated before.

### Calculator API (the unit-test target)
- Real path: `packages/food-recipe-core/src/food_recipe/core/calculator/index.ts` (AGENTS.md says `src/calculator/` but it's nested under `src/food_recipe/core/`).
- Exactly **two** exported functions:
  - `calculateScale(ingredient: Ingredient): number | null` — scale factor = `calculated_value / value`; `null` if either missing; range ingredients → ratio of first (min) bounds.
  - `recipeScale(recipe: Recipe, scale: number): Recipe` — populates `calculated_value` for all ingredients (skips those without `value`); range → each bound scaled; rounds to 2 decimals (`utils/number`); **mutates in place**, returns same object.
- Root entry `src/index.ts` re-exports only `recipeScale`. Deep import: `@repo/food-recipe-core/src/food_recipe/core/calculator`.
- Types in `src/food_recipe/core/types/recipe.d.ts`: `Recipe` (`name`, `portion?`, `calculated_portion?`, `description?`, `ingredient_groups`), `IngredientGroup` (`name`, `ingredients`), `Ingredient = SimpleIngredient | RangeIngredient`, `Value` (`value?`, `calculated_value?`), `RangeValue` (`value?: number[]`, `calculated_value?: number[]`), `IngredientType` (`name`, `density?`, `concentration?`). `isRangeIngredient` in `../checks`.

### Web-react app (smoke-test surface)
- Entry: `index.html` → `src/main.tsx` → `createRoot(...).render(<RouterProvider router={router}/>)`.
- Router: `src/router/index.tsx`, `createHashRouter`. Routes: `/` → HomeView; `about`, `favorite`, `helpers` → lazy views. Root wrapper `<App />`.
- A smoke test = mount the router, assert all 4 routes render without crashing (pulls in core + Zustand stores).
- `src/test/env.ts` — custom jsdom env for the test setup.

### CI (`.github/workflows/ci.yml`)
- Triggers: PR to `dev`, push to any branch, tags `v*`.
- Job `test`: `pnpm install --frozen-lockfile` → `pnpm run build` → `pnpm run test` (=`pnpm -r test`, picks up all workspaces automatically) → `pnpm run lint`.
- **Commented-out e2e step** (`pnpm run test:e2e`) with TODO about Cloudflare bypass; **no `test:e2e` script exists anywhere**.
- Job `publish` (`needs: test`): builds + deploys web-react to GitHub Pages.
- **Conclusion: adding new test files under existing globs requires NO CI changes.**

## Reference project: react-fertilizer-calculator

### Type
- pnpm 11 workspace monorepo (no Turborepo), Node >=24. `apps/web` (React 19 + Vite 8 SPA) + source packages `calculator`, `icons`, `ui` (no build step, `main` → `src/index.ts`).

### Root scripts (exact)
```json
"full-check": "pnpm test && pnpm format:fix && pnpm lint && pnpm type && pnpm build",
"test": "pnpm -C packages/calculator test && pnpm -C packages/icons test && pnpm -C packages/ui test && pnpm -C apps/web test",
"test:e2e": "playwright test tests/e2e",
"test:smoke": "playwright test tests/smoke",
"build": "pnpm -C apps/web build",
"start": "pnpm -C apps/web start"
```
Root devDeps: `@playwright/test ^1.62.1`, `@axe-core/playwright ^4.13.0`, `@biomejs/biome`, husky (pre-commit = `pnpm full-check`).

### Two runners, strictly separated
- **Vitest 4** — per-package `vitest.config.ts` (calculator: node env; web: jsdom + `setupFiles: src/setupTests.ts` + `exclude: tests/**` + `mergeConfig` with `vite.config.ts` for aliases; ui: two named projects `node` (jsdom) and `browser` (real chromium via `@vitest/browser-playwright`, ARIA snapshots)). Each package `"test": "vitest run"`, chained by root `pnpm test`.
- **Playwright 1.62** — ONE root `playwright.config.ts`; suites distinguished purely by CLI path arg (`tests/e2e` vs `tests/smoke`).

### Playwright config (root, quoted)
```ts
export default defineConfig({
  testDir: "./tests",
  workers: 1,
  fullyParallel: false,
  retries: 1,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### Smoke tests
- `tests/smoke/routes.test.ts` — table-driven route-aliveness: per route `page.goto(url)`, a route-unique text marker visible, **zero console/page errors** via `trackConsoleErrors(page)` from `tests/helpers.ts` (collects `console.error` + `pageerror`, filters known React dev warnings). Titles prefixed `smoke: …`.
- Also jsdom-level "app smoke" tests colocated in `apps/web/src/__tests__/App.test.tsx` (render real `<Root />`).

### Unit tests
- Colocated `<module>.test.ts(x)` next to source and/or `__tests__/` dirs. Globals on (no test/expect imports), `describe` per function, one `test` per case, ad-hoc table-driven loops over fixture maps.
- App behavior tests go through a **state seam** (`src/test-utils/state.ts`) to decouple from the state library; `test-utils/render.tsx` wraps render in a router.

### E2E tests
- `tests/e2e/`: `shared.ts` (domain locators, no page objects), `calculator.test.ts` (main flow), `navigation.test.ts`, `persistence.test.ts` (localStorage survives reload), `a11y.test.ts` (axe-core, wcag2a+wcag2aa). All real, full scenarios.
- Run: `pnpm test:e2e` / `pnpm test:smoke`. **NOT run in CI** (CI runs only `pnpm full-check` = unit+lint+type+build) and not in pre-commit — deliberately local-only.

### Key takeaways to replicate
1. Three tiers by directory + runner: unit = Vitest per package (`pnpm test`); smoke = Playwright `tests/smoke/` (`pnpm test:smoke`); e2e = Playwright `tests/e2e/` (`pnpm test:e2e`). One shared root `playwright.config.ts`.
2. Tier-prefixed test titles (`smoke: …`, `a11y: …`), greppable.
3. Shared helpers: `tests/helpers.ts` (`trackConsoleErrors`, `isKnownDevWarning`), `tests/e2e/shared.ts` (domain locators) — no page-object classes.
4. Smoke = table-driven route aliveness + zero console errors.
5. Smoke/e2e are local-only by design (not in CI gate).

### tsconfig
- `packages/typescript-config`: `base.json` (strict, NodeNext, ES2022, noUncheckedIndexedAccess), `vite-react.json` (Bundler, react-jsx, noEmit), `react-library.json`, `nextjs.json`.
- web-react extends `vite-react.json` (alias `@/*` → `./src/*`). Core extends `@tsconfig/node20` directly (types: `["node", "vitest/globals"]`, aliases `@app/*`, `@tests/*`).
