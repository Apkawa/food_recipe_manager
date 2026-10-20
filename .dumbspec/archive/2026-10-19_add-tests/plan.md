# 2026-10-19_add-tests: implementation plan (adding tests)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan
- [x] Pre-checks (git): clean tree, branch `2026-10-19_add-tests` created
- [x] `draft.md` written (raw input)
- [x] Initial `spec.md` skeleton
- [x] Research: current project (Vitest already wired, 17 test files, calculator API, CI)
- [x] Research: reference project react-fertilizer-calculator (Vitest + Playwright, shared config, smoke/e2e by directory)
- [x] `research.md` written
- [x] `spec.md` v1 written, reviewed, no open questions
- [x] `plan.md` written

**Criterion:** all task files exist; spec v1 has no open questions; plan committed to git.
**Commit:** `docs(dumbspec): add spec and plan for 2026-10-19_add-tests`

## Stage 1 — Calculator unit tests (core)
- [x] Audit existing `tests/unit/core/calculator/{calculateScale,recipeScale}.test.ts` against the API; list uncovered edge cases
- [x] Add failing tests for uncovered `calculateScale` edge cases (null/missing values, ranges, ratios)
- [x] Add failing tests for uncovered `recipeScale` edge cases (no-value skip, range bounds, 2-decimal rounding, in-place mutation, scale 0)
- [x] Run core suite; make red tests green (fix code only if a real bug is found — record it)
- [x] Refactor: keep the `Cases<Arg, Expected>` + `it.each` table-driven pattern

**Criterion:** `pnpm --filter @repo/food-recipe-core test` green; new tests cover the audited edge cases; no changes to production code unless a bug was proven.
**Commit:** `test(core): extend calculator unit tests with edge cases`

## Stage 2 — Smoke tests (Playwright)
- [x] Add `@playwright/test` to root devDependencies; install chromium into `./.cache/ms-playwright` via `PLAYWRIGHT_BROWSERS_PATH`
- [x] Create root `playwright.config.ts` (chromium project, 1 worker, list reporter, trace/screenshot on failure, `webServer` → `pnpm -C apps/web-react dev`, baseURL `http://localhost:5173`, `reuseExistingServer: true`)
- [x] Create `tests/helpers.ts` with `trackConsoleErrors` (+ `isKnownDevWarning`)
- [x] Create `tests/smoke/routes.test.ts` — table-driven over the 4 routes (`/`, `about`, `favorite`, `helpers`): marker visible + zero console/page errors, titles prefixed `smoke: …`
- [x] Add root script `test:smoke` → `playwright test tests/smoke`
- [x] Run `pnpm test:smoke` until green

**Criterion:** `pnpm test:smoke` passes locally with 4 route tests, each asserting a marker and zero console errors.
**Commit:** `test(web): add Playwright smoke tests for app routes`

## Stage 3 — E2E stub
- [x] Create `tests/e2e/` stub: placeholder test file(s) with `test.fixme` and TODO comments (main scenario, navigation, persistence, a11y — after the separate post-a11y task)
- [x] Add root script `test:e2e` → `playwright test tests/e2e`
- [x] Run `pnpm test:e2e` — stubs reported as skipped, no failures

**Criterion:** `pnpm test:e2e` runs cleanly and reports only skipped/fixme tests; the stub documents the intended future scenarios.
**Commit:** `test(web): add e2e test skeleton`

## Stage 4 — Final verification
- [x] Full local gate: `pnpm test` (all Vitest suites), `pnpm lint`, `pnpm build` — all green
- [x] Update `AGENTS.md` (Key paths / How to work): document `test:smoke`, `test:e2e` (local-only) and the Playwright browser cache env var
- [x] Final acceptance: verify every stage Criterion independently

**Criterion:** root `pnpm test` + `pnpm lint` + `pnpm build` green; AGENTS.md documents the new scripts; all stage Criteria hold.
**Commit:** `chore: fix calculator test lint and document test scripts in AGENTS.md`
