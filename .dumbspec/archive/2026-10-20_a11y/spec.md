# 2026-10-20_a11y: accessibility for AI-agent navigation

**Created:** 2026-10-20T11:39:16+03:00

## Scope

**In scope:**
- A11y fixes across the **whole** web-react app (all 4 routes: `/`, `/about`, `/favorite`, `/helpers` and all their components):
  - **Labels (WCAG 1.3.1)** — 7 controls have no programmatic label: `#raw_recipe` textarea, `#scale` and `#new_scale` number inputs, concentration and edit-value inputs in `IngredientLineEdit`, unit `<select>`, share textarea in `RecipeShare`.
  - **Dialog semantics (Modal.tsx)** — the shared modal is a plain `<div>`: no `role="dialog"`, no `aria-modal`, no accessible name, no Escape-to-close, no focus management. Used by the GrandMother modal and the Share modal.
  - **Keyboard access (WCAG 2.1.1)** — `FavoritesList` renders `<a onClick>` with no `href` (not focusable at all); modal overlay click-to-close.
  - **Headings/landmarks** — home route has no `h1`; `/helpers` has no `h1` and no `<main>`; dynamic `<h2>{parsed.name}</h2>` can render empty.
  - **Accessible-name quality** — favorites remove button named only "X"; mixed English control names ("Edit", "Save", "Copy/Share") on a ru-language page; favorites table has no header row.
- **Color contrast (WCAG 1.4.3)** — nav links, `.build-info`, and about-page links fail the `color-contrast` axe rule (discovered by the red baseline).
- **Edit-mode state coverage** — the concentration, edit-value, and unit `<select>` inputs only render in the ingredient edit mode; an a11y scenario opening that state is required so their label fixes are covered by tests.
- A11y test cases **inside the e2e suite** (`tests/e2e/`), using `@axe-core/playwright` (`AxeBuilder`, tags `wcag2a` + `wcag2aa`, zero violations):
  - per-route scans for all 4 routes (red baseline written **before** the fixes);
  - interactive-state scenarios: open the GrandMother modal / Share modal and scan **in the open state** (content hidden behind them must be checked while open).
- New devDependency `@axe-core/playwright` in the root `package.json` (next to `@playwright/test`).

**Out of scope:**
- Core (`@repo/food-recipe-core`) changes.
- Full e2e scenario coverage (separate post-a11y task per AGENTS.md) — only the interaction scenarios needed for a11y open-state scans.
- CI integration for browser suites (local-only convention).
- Skip-to-content link (minor, not needed for agent navigation).

## Approach

- **TDD, red baseline first:** add the axe dependency and write the a11y e2e tests before touching app code; the suite is red (label violations etc.), then fixes land stage by stage until green.
- **Test structure** (mirrors the sibling project `react-fertilizer-calculator/tests/e2e/a11y.test.ts`, simplified):
  - `tests/e2e/a11y.ts` — shared a11y helpers: `A11Y_TAGS`, route table `{name,url,marker}` (markers reuse the smoke-suite convention), `openReadyPage`, `analyzePage` (`new AxeBuilder({page}).withTags(A11Y_TAGS).analyze()`), `expectNoViolations(label, results)` with one failure line per violating node (rule id, impact, help, CSS target).
  - `tests/e2e/a11y.test.ts` — one test per route: open ready page → scan → zero violations.
  - `tests/e2e/interactions.test.ts` — scenario tests that open interactive elements and **then** scan: GrandMother modal open (`getByRole("dialog")` visible + inner content visible), Share modal open. The "e2e: a11y" `test.fixme` block in `placeholder.test.ts` is replaced by these real tests (other fixmes stay).
  - Role-based locators (`getByRole("button", { name: … })`) — possible only after the accessible-name fixes land, matching the sibling project's ordering.
- **Modal fix:** `role="dialog"`, `aria-modal="true"`, `aria-label` per usage, Escape closes, focus moves into the dialog on open and returns to the trigger on close, simple Tab focus trap.
- **FavoritesList fix:** make the recipe-name link keyboard-activatable (real button semantics: focusable + Enter/Space) without changing visual design.
- **Consistency:** rename English control names to Russian ("Изменить", "Сохранить", "Поделиться"); update unit tests that reference the old names.
- **Acceptance:** `pnpm test:e2e` green (zero violations on all routes + open modals), `pnpm test:smoke` green, and **playwright-cli navigation becomes noticeably easier**: the page snapshot (accessibility tree) shows every interactive element with a stable, meaningful accessible name, so `find "<name>"` / `getByRole("button", { name: … })` / `click eN` work deterministically across all routes and modal states.

## Constraints

- pnpm 11 monorepo; root `package.json` owns Playwright tooling (`@playwright/test ^1.64.1`, not in the pnpm catalog) — `@axe-core/playwright` goes there as a direct pin (`^4.13.0`); install with `pnpm_config_store_dir=./.cache/pnpm/v11 pnpm install`.
- Shared `playwright.config.ts`: `testDir: "./tests"`, single chromium project, `baseURL http://localhost:5173`, webServer auto-starts `pnpm -C apps/web-react dev` — **no config changes needed**; new files under `tests/e2e/` are picked up by `pnpm test:e2e` as-is.
- Browsers: `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright` (set by the scripts); Chromium already installed.
- Suites are local-only (not in CI).
- Existing conventions to follow: route-table + marker readiness (smoke suite style), `trackConsoleErrors` from `tests/helpers.ts` in browser tests, test names `smoke: …` / `e2e: …`, `tests/e2e/shared.ts` reserved for domain locators (a11y helpers go to `tests/e2e/a11y.ts` instead).
- The axe scan uses only `wcag2a`/`wcag2aa` tags (no `disableRules`, no excludes). Some targeted fixes (heading-one, static-element click handlers, focus management) are not auto-detected by those tags — they are done for WCAG conformance and agent-navigation quality, verified via the playwright-cli snapshot.
- `@axe-core/playwright` 4.x is compatible with `@playwright/test` 1.64 (peer: `playwright-core >= 1.0.0`).

## Open questions

- none (structure, dependency placement, and the full fix list are resolved by research).

## Changes

- 2026-10-20T11:39:16+03:00 -- v1, initial spec (draft + research)
- 2026-10-20T12:33:17+03:00 -- red baseline added color-contrast (WCAG 1.4.3) fixes to scope (nav links, `.build-info`, about links) and an edit-mode a11y scenario to cover the 3 controls that only render in ingredient edit mode (concentration, edit-value, unit select)
- 2026-10-20T15:18:12+03:00 -- acceptance (playwright-cli snapshots) moved `ParsedRecipeTable`/`FavoritesList` table-header naming into scope (visible "Ингредиент"/"Значение"/"Ед. изм."/"Действия" + sr-only "Действия" with a new `.sr-only` utility) and disambiguated the duplicated "Текст рецепта" name: the share-dialog textarea is now "Текст для обмена"
