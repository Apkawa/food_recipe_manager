# 2026-10-18_pnpm-migration: implementation plan (pnpm migration)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan

- [x] Draft captured (`draft.md`)
- [x] Initial spec written
- [x] Refinement confirmed with user (CI + pre-commit in scope)
- [x] Research collected (`research.md`)
- [x] Spec v1 written, open questions resolved
- [x] Plan written

**Criterion:** `draft.md`, `research.md`, `spec.md` (v1), `plan.md` exist; no open questions.
**Commit:** `docs(migration): pnpm migration spec + plan (stage 0)`

## Stage 1 — pnpm foundation (workspaces + catalog + cleanup)

- [x] Create `pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]` + `catalog:` with all shared dep versions
- [x] Root `package.json`: remove `workspaces`, `turbo`, duplicate `react`/`react-dom`; set `packageManager: "pnpm@11.22.0"`
- [x] Remove `turbo.json`, `.turbo/`, `package-lock.json` (root + `apps/web` + `packages/food-recipe-core`), `packages/vite-config/`
- [x] `.gitignore`: drop `.turbo`, add `.cache/` and `.tmp/`
- [x] `pnpm install` → fresh `pnpm-lock.yaml`, no npm lockfiles left

**Criterion:** `pnpm install` succeeds from clean state; `pnpm-lock.yaml` committed; no `package-lock.json` anywhere; `pnpm ls -r --depth 0` shows 6 workspace packages.
**Commit:** `chore(migration): switch to pnpm workspaces + catalog, drop turbo/npm artifacts`

## Stage 2 — Scripts on pnpm

- [x] Root scripts: `build`/`test`/`lint`/`dev`/`format:check` → `pnpm -r ...`; `check`/`pre-commit`/`commit`/`release:*` → `pnpm run` chains
- [x] `packages/food-recipe-core` scripts: `npm run` → `pnpm run`
- [x] `apps/web`, `apps/web-react` scripts: `npm run` → `pnpm run` (keep `run-p` in web build)
- [x] Verify build order: core builds before web/web-react (pnpm `-r` topological order)

**Criterion:** `pnpm build`, `pnpm test`, `pnpm lint` from root pass; core dist exists before app builds.
**Commit:** `chore(migration): root + package scripts on pnpm`

## Stage 3 — ESLint without turbo

- [x] Remove `eslint-config-turbo` from `packages/eslint-config` (dep + `extends` in `library.js`, `react-internal.js` + README title)

**Criterion:** `pnpm lint` passes across all packages.
**Commit:** `refactor(eslint-config): drop eslint-config-turbo`

## Stage 4 — Husky hooks on pnpm

- [x] Add `husky` to root devDeps + `"prepare": "husky"`
- [x] `.husky/pre-commit` → `pnpm run pre-commit`; `.husky/commit-msg` → `pnpm run commitlint -- --edit "$1"`

**Criterion:** `pnpm install` activates hooks (`core.hooksPath` set); hook files invoke pnpm.
**Commit:** `chore(husky): root husky with pnpm hooks`

## Stage 5 — CI on pnpm

- [x] `.github/workflows/ci.yml`: add `pnpm/action-setup`, `pnpm install --frozen-lockfile`, pnpm store cache (replace `npm ci` + node_modules cache in both jobs)

**Criterion:** workflow YAML valid; no `npm` references remain in CI; install/build/test/lint steps use pnpm.
**Commit:** `ci: migrate workflow to pnpm`

## Stage 6 — Docs

- [x] `README.md`: npm → pnpm commands
- [x] `CONTRIBUTING.md`: strip Turborepo starter boilerplate, pnpm commands
- [x] `AGENTS.md`: monorepo description (pnpm, no turbo), drop stale `apps/mvp`/`vite-config` notes
- [x] `packages/food-recipe-core/CONTRIBUTING.md`: npm → pnpm

**Criterion:** `rg -n "turbo|npm (run|ci|install)" --glob '!node_modules' --glob '!.git' -g '*.md' -g '*.json' -g '*.yml' -g '*.sh'` (excluding lockfiles/docs specs history) returns no live references.
**Commit:** `docs: pnpm migration notes`

## Stage 7 — Final verification

- [x] Clean `node_modules` + `pnpm install --frozen-lockfile` + `pnpm build` + `pnpm test` + `pnpm lint` all green

**Criterion:** full pipeline green from a clean install.
**Commit:** N/A (verification only; fixups go into prior stages)
