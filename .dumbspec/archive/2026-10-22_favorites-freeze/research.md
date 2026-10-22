# Research: 2026-10-22_favorites-freeze

> Context gathered 2026-10-22. Findings below are facts (paths, signatures, data shapes); no fix design.

## 1. Favorites feature

- Store: `apps/web-react/src/stores/favorites.ts`
  - `RecipeItem extends Recipe` + `created: Date; updated: Date` (L6–9).
  - Persistence key `FAVORITES_KEY = "recipe-favorite"` (L22). Custom `StateStorage` (L28–44): `localStorage['recipe-favorite']` is a **plain JSON array**; `getItem` wraps it as `{ state: { recipes }, version: 0 }`, `setItem` unwraps to a bare array.
  - Stored data: a **snapshot copy** of the whole recipe — `add` does `set({ recipes: [...get().recipes, { ...recipe, created: dt, updated: dt }] })` (L49–52). Not an id/reference. After a localStorage round-trip `created`/`updated` are ISO strings (JSON), not `Date`.
  - `addOrUpdateByName` (L66–75) matches by `name` via `getIndexByName` (L53–54); in-place update. Comment L68–69 documents a Vue off-by-one fix.
  - Persisted with `persist(..., { name: FAVORITES_KEY, storage: createJSONStorage(() => favoritesStorage) })` (L46–89).
- List: `apps/web-react/src/components/FavoritesList.tsx`
  - `onClickRecipe(recipe: RecipeItem)` (L20–31): `recipeToText(recipe)` (L21) re-serializes the snapshot; builds `RecipeState = { rawRecipe: textRecipe, scale: recipe.portion ?? 0, newScale: recipe.calculated_portion ?? 0 }` (L24–28); `saveStateToUrl(new URL(window.location.href), state)` (L29); `navigate({ pathname: "/", search: url.search })` (L30).
  - Rendering: one `<Button>` per recipe, `key={recipe.name}` (L38); remove → `removeByIndex(i)` (L46).
- View/route: `views/FavoritesView.tsx` L8–15; route `lazyRoute("favorite", ...)` under `createHashRouter` (`router/index.tsx` L32, L38); sidebar `#/favorite` in `App.tsx` L37–42.
- Adding: `RecipeCalculator/RecipeFavoriteButton.tsx` L25 — `addOrUpdateByName(recipe)` where `recipe` is the **parsed** recipe from `RecipeCalculator.tsx` L105.

## 2. Recipe view flow (current code)

- `/` → `HomeView.tsx` L9 → `RecipeCalculator.tsx`.
- `const parsed = useMemo(() => parseTextRecipe(rawRecipe), [rawRecipe])` (L36) — re-parses only when the `rawRecipe` string changes.
- Effects: L39–43 sets `scale` from `parsed.portion` when `parsed` identity changes; L47–58 guard resets `scale`/`newScale` < 0.1.
- `scaled` (L61–70): `structuredClone(parsed)` + `recipeScale(clone, factor)` — mutations on the clone only.
- State→URL chain (all in current code):
  - `setRawRecipe`/`setScale`/`setNewScale` in `stores/recipe.ts` L63–74 each call `syncUrlToRouter` (L50–57) → `router.navigate({ pathname: "/", search }, { replace: true })` (L56).
  - `App.tsx` L85–88: `useEffect(...applyFromQuery...,[search])` pushes URL query into the store (`applyFromQuery` → `set(loadState(query))`, `stores/recipe.ts` L75–77).
  - `loadState` (`lib/state.ts` L62–76): URL > localStorage > defaults; `rawRecipe` base64-decoded (L44–46).
- **Convergence in current code:** `loadState` re-derives the same `rawRecipe` string → `parsed` memo identity unchanged; `setScale(4)` with unchanged value does not retrigger renders (primitive selectors); hash-replace to identical URL → no `location.search` change. No render-time mutation in this flow.
- `RawRecipeEditor.tsx` L19–23 syncs the textarea from `value` when not focused.

## 3. Core parser

- `parseTextRecipe(raw_text)` — `packages/food-recipe-core/src/food_recipe/core/parser/text.ts` L22–117 (re-exported from `src/index.ts` L10). Single `for (const line of lines)` pass (L44–116), sentinel `END_LINE` (L7, L43), `break`s (L72, L106). No `while`, no `replaceAll`, no recursion.
- `parseRecipeLine` — `parser/recipe_line.ts` L78–126; two regexps (`UNIT_REGEXP`, `VALUE_REGEXP` L81–87); bare number → `"pcs"` (L120–123).
- Portion: unit `"portion"` sets `recipe.portion` (text.ts L51–58). Spellings in `unit/unit_map.ts` L55–61 incl. `порци(я|и|й)?` → "Рецепт на 4 порций" yields `portion: 4`.
- Units: `UNIT_PARSE_MAP` (`unit_map.ts` L29–62); `l: ["л", ...]` (L32), `pcs: ["шт", ...]` (L30).
- **In-place mutation (known issue):** `prepareIngredient` (`ingredient_type/parse.ts` L65–77) mutates the passed ingredient (TDoc: "Mutates and returns the same ingredient", L62); `recipeScale` (`core/calculator/index.ts` L34–48) writes `calculated_value` in place.
- **Empirical run (temp vitest in `.tmp/`) on the report texts — no hang in current code:**
  - `"Тест\nдля пиццы 275 г\nсоль 15 штук\n\nРецепт на 4 порций"` → `{ name: "Тест", groups: [{ ingredients: [{ "для пиццы", 275, "g" }, { "соль", 15, "pcs", type: { name: "kosher salt", density: 1030 } }] }], portion: 4 }`.
  - `"Другой Тест\nПиво 10л\n\nРецепт на 4 порций"` → `{ name: "Другой Тест", groups: [{ ingredients: [{ "Пиво", 10, "l" }] }], portion: 4 }`.
  - `recipeToText` round-trips both; re-parse gives `portion: 4` again.

## 4. Dev vs prod differences

- PWA SW — `apps/web-react/vite.config.ts`: `registerType: "autoUpdate"` (L15); `devOptions: { enabled: true }` with comment L16–18: the dev SW **only precaches static assets from dev-dist/, never the app code, so dev builds stay fresh**; prod `workbox.globPatterns: ["**/*.{js,css,html,ico,png,svg}"]` (L20–22) — **production JS bundles are precached**, so a client with an SW predating the latest deploy keeps receiving the older bundle.
- Deploy — `.github/workflows/ci.yml`: branch builds deploy `apps/web-react/dist` (L121) to Pages, `target-folder` = branch name (L97–104), `clean: true` (L122).
- **Git facts:** master HEAD `1f7a270` (2026-10-21) contains two favorites fixes:
  - `f7aabc4` "fix: broken fav links" — `FavoritesList.tsx` changed from `navigate(url.pathname + url.search)` (string) to `navigate({ pathname: "/", search: url.search })`.
  - `a2e429e` "fix: open recipe from favorites" — added the `App.tsx` query→store effect (`applyFromQuery` on `location.search`) and store `applyFromQuery`. Before it, `App` had no query effect; the recipe store was seeded once at creation (`stores/recipe.ts` L62 `loadState(readUrlQuery())`); a favorite click updated only the URL, not the store.
- Env-conditional code: only `components/BuildInfo.tsx` L1–4 reads `VITE_GIT_*` (injected from git HEAD, `vite.config.ts` L105–111) — the footer shows the deployed commit hash (a way to identify which build a frozen browser is serving).
- Data loading: recipe store `flatStorage.getItem` returns `null` deliberately (no rehydration; `stores/recipe.ts` L28–32); state resolved once by `loadState` (URL > localStorage flat keys `rawRecipe`/`scale`/`newScale`, `lib/state.ts` L51–55, L62–76). Favorites rehydrate from the localStorage array (`favorites.ts` L28–38).

## 5. Existing tests

- Favorites: `apps/web-react/src/stores/favorites.test.ts`, `apps/web-react/src/components/FavoritesList.test.tsx` (incl. "updates the recipe store when a favorite is opened (App query effect)" L72), `apps/web-react/src/components/RecipeCalculator/RecipeFavoriteButton.test.tsx`.
- Recipe state/view: `stores/recipe.test.ts`, `lib/state.test.ts`, `RecipeCalculator/RecipeCalculator.test.tsx`, `RecipeShare.test.tsx`, `utils.test.ts`.
- Core: `packages/food-recipe-core/tests/unit/...` (parser, calculator, ingredient_type, utils, unit).
- Browser: `tests/smoke/routes.test.ts` (favorite route marker, L30), `tests/e2e/interactions.test.ts`, `tests/e2e/a11y.test.ts`, `tests/e2e/placeholder.test.ts`.

## 6. TODO / known issues

- Root `AGENTS.md`: "Core mutates Recipe objects in-place (not immutable)."
- `RecipeShare.tsx` L26: `// TODO parity with the Vue original: make the recipe immutable instead.`
- `favorites.ts` L68–69: Vue off-by-one comment.
- `ingredient_type/parse.ts` L62: "Mutates and returns the same ingredient."
- `ingredient_type/calculate.ts` L45: `// TODO улучшить формулу`.
- `i18n.ts` L55: `// TODO plural forms`.
- `.github/workflows/ci.yml` L43: `# TODO надо подумать над обходом cloudflare` (e2e disabled in CI).

## Suspects (directly observed)

1. **Stale production JS via the PWA service worker** — structural explanation for "production only, not local dev": prod precaches app JS (`vite.config.ts` L15–22), dev never does. The `BuildInfo` footer can reveal the exact commit a frozen browser serves.
2. **Two favorites fixes landed in master 2026-10-21** (`f7aabc4`, `a2e429e`): a pre-fix bundle runs a different (broken) favorites flow — no query→store effect, string navigation in `FavoritesList`.
3. No infinite loop found in **current** source: parse memoized on `rawRecipe`, URL chain converges, parser verified empirically on both report texts.

## 7. ROOT CAUSE (confirmed 2026-10-22, Stage 1)

**The freeze reproduces on the CURRENT production build** (fresh browser, no stale SW). The stale-SW hypothesis is NOT the cause (it may only delay delivery of the fix).

### The exact loop — a child/parent effect phase-flip

The non-converging value is the store `rawRecipe` (and its URL mirror), flapping every ~2 ms between:
- **A** = `Тест\n\nдля пиццы \t 275 \t г\nсоль \t 15 \t штук\n\nРецепт на 4 порции \n` (`recipeToText(fav1)`, written by the click)
- **B** = `Другой Тест\n\nПиво 10л\n\nРецепт на 4 порции \n` (the pre-click editor text)

`scale=4`, `newScale=1` are constant. CDP nav trace: 20,608 navigations in ~23 s, strict A→B→A→B alternation (`.tmp/freeze-navtrace-result.txt`).

Cycle (React runs passive effects bottom-up — child before parent — and that is the engine):
1. Render with `location.search = W(N-1)`, store `rawRecipe = S(N-1)`; `parsed` changed (`RecipeCalculator.tsx:36`).
2. **Child effect** `RecipeCalculator.tsx:39-43` → `setScale` → `stores/recipe.ts:67-70` → `syncUrlToRouter(get())` (`stores/recipe.ts:50-57`) → URL **W(N) = serialized *current* store = S(N-1)** (the pre-apply value).
3. **Parent effect** `App.tsx:85-88` → `applyFromQuery` (`stores/recipe.ts:75-77`) with the **render-time** search W(N-1) → `loadState` (`lib/state.ts:62-76`) → **S(N) = S(N-2)**.
4. S(N) ≠ S(N-1) → re-render → repeat. Invariant: period 2, never converges while A ≠ B.

The click (`FavoritesList.tsx:20-31`) is the one-time phase flip: URL gets A while the store still holds B. Each cycle also drives `RawRecipeEditor.tsx:19-23` (the `VT` frame in the 1049× #185 stack).

**Empirical proof:** `.tmp/freeze-loop.harness.ts` (real `stores/recipe.ts` + `lib/state.ts` + core modules, router mocked) reproduces the exact A/B 2-cycle — 12/12 cycles, no convergence, identical base64 values as the browser, in all 4 localStorage scenarios.

### Dev vs prod

- Dev converges (same repro on `:5173`: 10 navs, stable at `A&scale=4&newScale=1`; `.tmp/freeze-navtrace-dev-result.txt`). In dev the child sync saw the store value the parent `applyFromQuery` had *already* applied (URL matches what apply would next read → stops); in prod the child sync always sees the pre-apply value → the phase flip persists.
- StrictMode is enabled in both — not the difference. The exact React dev-vs-prod scheduling reason for the interleaving difference is **undetermined** (would need an instrumented React build).

### Fix directions (chosen in Stage 2)

1. **Recommended** — value-guard in `RecipeCalculator.tsx:39-43`: `if (parsed.portion && scale !== Number(parsed.portion))` — kills the only location-changer in the cycle.
2. `stores/recipe.ts:50-57` — skip `navigate` when the serialized URL is unchanged (hygiene; not sufficient alone).
3. `App.tsx:85-88` + `syncUrlToRouter` — token to ignore self-induced search changes (breaks the feedback warned about at `stores/recipe.ts:16-20`).

### Evidence files (`.tmp/`)

`freeze-cdp-{mjs,result.txt}` (1049× #185), `freeze-navtrace{,-dev}-*` (prod flap / dev convergence), `freeze-loop.harness.ts` + `vitest.config.ts` (module-level repro), `subpath-server.mjs` (static server), `freeze-report.md` (full report).
