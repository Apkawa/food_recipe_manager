# 2026-10-19_tooling-migration: implementation plan (tooling migration)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan

- [x] Pre-checks: clean tree, branch `2026-10-19_tooling-migration` created
- [x] `draft.md` written (raw input)
- [x] Research: core webpack build (no consumers), jest (core only), eslint/biome status, CI, apps/web references
- [x] `spec.md` v1 written; open questions resolved
- [x] `plan.md` written

**Criterion:** all task files exist; research covers all 5 request items.
**Commit:** `chore(dumbspec): add 2026-10-19_tooling-migration spec and plan`

## Stage 1 — Remove webpack build from food-recipe-core

- [x] Delete `packages/food-recipe-core/webpack.config.ts`
- [x] `packages/food-recipe-core/package.json`: drop webpack devDeps (webpack, webpack-cli, webpack-dev-server, ts-loader, terser-webpack-plugin, tsconfig-paths-webpack-plugin, @types/webpack, html-webpack-plugin); drop `build`, `build-only`, `dev` scripts (+ dead `build:watch`); repoint `main`/`types` to `src/index.ts`
- [x] `pnpm-workspace.yaml`: remove webpack-only catalog pins (verified no other consumer)
- [x] Update `packages/food-recipe-core/CONTRIBUTING.md` webpack mention
- [x] `pnpm install` (lockfile)
- [x] Verify: `pnpm -r build` green (apps only), `pnpm --filter @repo/food-recipe-core test` green

**Criterion:** no `webpack` string left in repo (excl. node_modules/lockfile/docs-historical); core tests pass; root build passes.
**Commit:** `refactor(core): remove unused webpack build` (9c51dd1) — accepted; lockfile still carries webpack transitive deps of apps/web nightwatch/storybook, cleared in Stage 5

## Stage 2 — jest → vitest in food-recipe-core

- [x] Add `vitest` (catalog:) to core devDeps; write `packages/food-recipe-core/vitest.config.ts` (node env, `globals: true`, include `tests/**` + `src/**/*.test.ts`/`*.spec.ts`, aliases `@app/*`→`src/food_recipe/*`, `@tests/*`→`tests/*`, ignore `tests/e2e`)
- [x] RED→GREEN: old jest setup removed, new `test:unit` = `vitest run`, all 15 test files (158 tests) pass
- [x] Delete `jest.config.ts`, `packages/food-recipe-core/.jest/` (setup files + custom reporter)
- [x] Drop jest devDeps (12) + `jsdom-global`/`@types/jsdom-global` from deps
- [x] Check tests for `localStorage` usage — none, no shim needed
- [x] `pnpm-workspace.yaml`: remove the 11 jest catalog pins
- [x] `pnpm install` (lockfile); tsconfig `types` jest→vitest/globals, CONTRIBUTING.md updated

**Criterion:** `pnpm --filter @repo/food-recipe-core test` green (15 tests, vitest); no `jest`/`ts-jest` in core package.json, catalog, or config files.
**Commit:** `test(core): migrate from jest to vitest` (97d4a48) — accepted

## Stage 3 — ESLint → Biome

- [x] Delete root `.eslintrc.js` (empty stub)
- [x] Delete `packages/food-recipe-core/.eslintrc.json`; core `lint` script → `biome check src/ tests/ && tsc --build`
- [x] Delete `packages/eslint-config/` package; drop root devDep `@repo/eslint-config` and core devDep `@repo/eslint-config` (orphan `node_modules` dir removed)
- [x] Drop `eslint` devDep from core; `pnpm-workspace.yaml`: remove eslint pins no longer used (keep pins still needed by apps/web until Stage 6)
- [x] `pnpm install` (lockfile)
- [x] Verify: `pnpm -r lint` green (core via biome), `pnpm -r test` green

**Criterion:** no `.eslintrc*` files (root/core), no `packages/eslint-config`, no eslint deps in root/core; `pnpm lint` + `pnpm test` green.
**Commit:** `refactor: replace eslint with biome for linting` (29d8cf2) — done outside the plan journal (user commit); verified green, accepted

## Stage 4 — CI deploys apps/web-react

- [x] `.github/workflows/ci.yml`: `folder: apps/web/dist` → `folder: apps/web-react/dist`; drop the stale vue comment
- [x] Verify YAML parses (python yaml); local `pnpm --filter web-react build` produces `apps/web-react/dist/` (index.html exists)

**Criterion:** ci.yml deploy step points at `apps/web-react/dist`; no `apps/web` (Vue app) reference left in `.github/`.
**Commit:** (filled at execution)

## Stage 5 — Prettier → Biome

- [x] Root `package.json`: `format` → `biome format apps packages --diagnostic-level=error`; add `format:fix` = `pnpm format --fix`; drop `prettier` devDep + the inline `prettier` config block
- [x] Delete root `.prettierignore`
- [x] `packages/food-recipe-core/package.json`: drop `prettier` + `@types/prettier` devDeps (verified unused in core src)
- [x] `pnpm-workspace.yaml`: remove catalog pins `prettier` and `@types/prettier`
- [x] `apps/web/package.json`: drop `prettier` devDep + `format` script (dangling `catalog:` ref broke `pnpm install` — unplanned fix)
- [x] `pnpm install` (lockfile)
- [x] Biome-format the 4 non-web files biome flagged (`web-react/vite.config.ts`, core `tsconfig.json` + `vitest.config.ts`, `typescript-config/package.json`) — apps/web files left alone (deleted in Stage 6)
- [x] Verify: `pnpm format` green, `pnpm format:check` green, `pnpm lint` green; no `prettier` references left outside docs, .dumbspec, lockfile (verified in Stage 6)

**Criterion:** root `format` uses biome; no prettier in root/core package.json or catalog; `pnpm format` + `pnpm lint` green.
**Commit:** `chore: remove apps/web and replace prettier with biome` (3a9632a) — combined with Stage 6 (shared lockfile/workspace changes)

## Stage 6 — Remove apps/web

- [x] Delete `apps/web/` directory (94 tracked files)
- [x] `pnpm-workspace.yaml`: remove 38 web-only catalog pins + `allowBuilds` entries (@nightwatch/nightwatch-inspector, chromedriver, geckodriver, vue-demi, unrs-resolver)
- [x] Drop root `cross-env` devDep + its catalog pin (no consumer left)
- [x] Update docs: `AGENTS.md`, `CONTRIBUTING.md`, `packages/food-recipe-core/README.md`, `docs/api/food-recipe-usage.md` (web paths → web-react; `docs/api/food-recipe.md` needed no change)
- [x] `pnpm install` (lockfile; −1283 packages, workspace = 4 projects)
- [x] Verify: `pnpm build`/`test`/`lint`/`format:check` all green; no `prettier` refs left; `rg "apps/web"` matches only 21 "Port of apps/web/…" provenance comments in web-react source — KEPT intentionally (origin docs, not references)

**Criterion:** `apps/web` gone; workspace + lockfile clean; full root pipeline green; no dangling references (provenance comments excluded by decision).
**Commit:** `chore: remove apps/web and replace prettier with biome` (3a9632a) — combined with Stage 5

## Stage 7 — Final verification

- [x] Full local run: `pnpm install && pnpm build && pnpm test && pnpm lint` + `pnpm format` — all exit 0
- [x] Remove leftover `raw-loader` devDep (core) + catalog pin — it pulled webpack/jest-worker into the lockfile
- [x] Confirm `pnpm-lock.yaml` has zero webpack/jest/eslint/prettier entries (all counts 0)
- [x] Update `plan.md` statuses; final task commit

**Criterion:** entire pipeline green from a clean install; lockfile free of webpack/jest/eslint/prettier packages.
**Commit:** `chore: remove raw-loader leftover and close tooling-migration plan` (filled below at commit)
