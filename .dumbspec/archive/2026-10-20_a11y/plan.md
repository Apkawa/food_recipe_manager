# 2026-10-20_a11y: implementation plan (accessibility for AI-agent navigation)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan
- [x] Draft captured (draft.md)
- [x] Research: example test, app inventory, test infra, playwright-cli docs (research.md)
- [x] Spec v1 written (spec.md)
- [x] Plan written (plan.md)

**Criterion:** all four task files exist and are committed; branch `2026-10-20_a11y` created.
**Commit:** `docs(a11y): spec, research and plan for a11y task`

## Stage 1 — Red a11y baseline (TDD red)
- [x] Add `@axe-core/playwright ^4.13.0` to root `package.json` devDependencies; `pnpm_config_store_dir=./.cache/pnpm/v11 pnpm install`
- [x] Create `tests/e2e/a11y.ts` — shared helpers: `A11Y_TAGS` (`wcag2a`, `wcag2aa`), route table `{name,url,marker}` reusing smoke-suite markers, `openReadyPage(page,url,marker)`, `analyzePage(page)` (`AxeBuilder`), `expectNoViolations(label, results)` (one failure line per node: rule id, impact, help, CSS target)
- [x] Create `tests/e2e/a11y.test.ts` — one a11y test per route (home, about, favorite, helpers): open ready page → scan → zero violations
- [x] Create `tests/e2e/interactions.test.ts` — scenario tests that open interactive elements then scan in the open state: GrandMother modal, Share modal (open-state assertions: overlay/dialog visible + inner content visible; locators that work pre-fix, e.g. `.modal-overlay`, refined to role-based in Stage 3)
- [x] Replace the "e2e: a11y" `test.fixme` block in `tests/e2e/placeholder.test.ts` with a pointer to the real tests (other fixmes stay)
- [x] Run `pnpm test:e2e` — capture the red baseline (6 a11y tests red: `label` on `#raw_recipe`/`#scale`/`#new_scale`/share textarea + `color-contrast` on nav links, `.build-info`, about links; no infra errors; smoke green)

**Criterion:** `pnpm test:e2e` runs the new a11y tests and they FAIL with expected axe violations (labels), while infra (webServer, imports) works; `pnpm test:smoke` unaffected.
**Commit:** `test(e2e): red a11y baseline with @axe-core/playwright`

## Stage 2 — Labels + document-level fixes (green)
- [x] Add an edit-mode a11y scenario to `tests/e2e/interactions.test.ts`: parse a concentration recipe ("уксус 9% 3 ст.л"), open the ingredient edit mode (Edit button), assert the edit inputs are visible, then scan — covers the 3 controls that only render in edit mode (concentration, edit-value, unit `<select>`)
- [x] Fix `color-contrast` (WCAG 1.4.3) on nav links, `.build-info`, and about-page links (CSS: `a` → `hsl(160,100%,25%)` 5.0:1, `.build-info` → `#525252` 7.8:1 on white / 4.9:1 under modal overlay)
- [x] Fix `link-in-text-block` (WCAG 1.4.1) on about-page paragraph links — non-color styling (underline) in CSS (`.about p a { text-decoration: underline }`)
- [x] Add programmatic labels to the 7 controls: `#raw_recipe` textarea (RawRecipeEditor), `#scale` + `#new_scale` (ScaleControls), concentration + edit-value inputs (IngredientLineEdit), unit `<select>` (UnitSelect), share textarea (RecipeShare) — visible `<label htmlFor>` where natural, `aria-label` otherwise (ru names)
- [x] Home route: introduce `h1` (promote "Калькулятор" heading in `HomeView.tsx`, `.page-title` class keeps the h2 look)
- [x] `/helpers` route: add `h1` and wrap content in `<main>` (`HelpersView.tsx`)
- [x] Guard empty dynamic `<h2>{parsed.name}</h2>` in RecipeCalculator (render nothing when empty/whitespace)
- [x] Run `pnpm test:e2e` — per-route a11y tests green (7/7 real tests, 0 axe violations; smoke 4/4; unit 47/47; build OK)

**Criterion:** per-route a11y tests pass (zero violations on all 4 routes); `pnpm test:smoke` still green; `pnpm build` + `pnpm check` pass.
**Commit:** `fix(a11y): form labels, headings, main landmark, color contrast`

## Stage 3 — Dialog semantics + keyboard access (green)
- [x] `components/ui/Modal.tsx`: `role="dialog"`, `aria-modal="true"`, `ariaLabel` prop (GrandMother: "Внимание — рецепт не рассчитан", Share: "Поделиться рецептом"), Escape closes, focus moves into dialog on open, focus returns to trigger on close, simple Tab focus trap
- [x] Remove/rework the redundant click-to-close `div` handlers (GrandMother inner div removed — its `max-width` already in CSS; overlay click kept)
- [x] `FavoritesList.tsx`: make the recipe-name `<a onClick>` keyboard-activatable (`tabIndex={0}` + Enter/Space `onKeyDown`, Space scroll prevented)
- [x] `FavoritesList.tsx`: remove button gets `aria-label="Удалить"`; add `<thead>` header row to the favorites table
- [x] Refine `interactions.test.ts` locators to role-based (`getByRole("dialog", { name: … })`, dialog-scoped `getByRole("textbox")`)
- [x] Run `pnpm test:e2e` — full a11y suite green including open-modal scans (7/7, 0 violations; smoke 4/4; unit 47/47; build OK)

**Criterion:** entire a11y e2e suite green, including scans of the open GrandMother and Share modals; unit tests (`pnpm -r test`) pass.
**Commit:** `fix(a11y): dialog semantics, focus management, keyboard access`

## Stage 4 — Consistency + final acceptance
- [x] Rename English control names to ru: "Edit" → "Изменить", "Save" → "Сохранить", "Copy/Share" → "Поделиться"; update unit tests + e2e locators (6 files)
- [x] Named empty table headers: `ParsedRecipeTable.tsx` visible ("Ингредиент"/"Значение"/"Ед. изм."/"Действия"), `FavoritesList.tsx` sr-only "Действия" + new `.sr-only` CSS utility
- [x] Disambiguated the duplicated "Текст рецепта" name: share-dialog textarea now "Текст для обмена" (e2e locator updated)
- [x] Final green run: `pnpm test:e2e` (7/7, 0 violations), `pnpm test:smoke` (4/4), `pnpm build`, `pnpm check`
- [x] playwright-cli acceptance: snapshots of all 4 routes + both open modals + edit mode — every interactive element has role + meaningful ru name and is locatable via `getByRole`/`find` (report: `.tmp/a11y-acceptance.md`)
- [x] Update plan.md checkboxes + commit the finished task files

**Criterion:** all suites green; playwright-cli snapshot of each route shows named, uniquely targetable interactive elements (acceptance: agent navigation noticeably easier).
**Commit:** `feat(a11y): consistent ru control names, final acceptance`
