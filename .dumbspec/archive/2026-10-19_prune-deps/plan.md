# 2026-10-19_prune-deps: implementation plan (stale dependency pruning)

Spec — [spec.md](./spec.md); research — [research.md](./research.md).

**Format:** each stage = TDD (red test → green implementation → refactor) + a commit at the end.
This file is a **living progress journal** — update statuses as work proceeds.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done.

---

## Stage 0 — Research + spec + plan
- [x] Capture raw input into `draft.md`
- [x] Research: full dependency audit (subagent) → `research.md`
- [x] `spec.md` v1 (scope, approach, constraints)
- [x] `plan.md`

**Criterion:** `draft.md`, `research.md`, `spec.md` (v1) and `plan.md` all exist in `.dumbspec/current/2026-10-19_prune-deps/`; user confirmed the plan.
**Commit:** `docs: add prune-deps spec and plan` (`6955195`)

## Stage 1 — Remove stale deps from core manifest
- [x] Remove 28 unused/redundant packages from `packages/food-recipe-core/package.json` (10 suspect+companions, 11 template-legacy, 6 redundant dups, `typesync`)
- [x] Remove the `synctypes` script from core `package.json`

**Criterion:** core `package.json` devDeps contain only in-use packages (`@tsconfig/node20`, `@types/node`, `typescript`, `vitest`); no `synctypes` script. — PASS (independent acceptance subagent).
**Commit:** landed together with Stage 2 as `chore: remove dead configs and catalog entries` (`733fca1`) — the standalone Stage 1 commit attempt failed on the pre-commit hook (store/commitlint issues fixed in Stage 2), so the core `package.json` change shipped in the Stage 2 commit.

## Stage 2 — Clean workspace config
- [x] Pin pnpm store project-locally: `.npmrc` line proved inert on pnpm 11 — remove it and add `storeDir: ./.cache/pnpm/v11` to `pnpm-workspace.yaml`
- [x] Trim `catalog:` in `pnpm-workspace.yaml` to consumed entries only (41 → 22)
- [x] Remove `puppeteer` and leftover `sharp` from `allowBuilds` in `pnpm-workspace.yaml`
- [x] Remove dead `babel` and `browserslist` blocks from root `package.json`
- [x] Delete `packages/food-recipe-core/.parcelrc` and empty root `.npmrc`
- [x] Remove `"ts-node"` block from core `tsconfig.json`; fix core engines (`node >=22`, drop `npm >=7`)
- [x] Add `@commitlint/config-conventional` to root devDeps + catalog (root commitlint config extends it; commit-msg hook was broken without it)
- [x] Remove pnpm auto-appended `puppeteer: set this to true or false` placeholder from `allowBuilds` (caught by re-acceptance)

**Criterion:** `rg` finds no references to any removed package in any manifest/config; config files parse (build in Stage 3). — PASS (independent acceptance subagent, after fixing the allowBuilds placeholder).
**Commit:** `chore: remove dead configs and catalog entries`

## Stage 3 — Rebuild lockfile + verify
- [x] `pnpm install` (lockfile already rewritten by the Stage 2 install; install is a verified no-op)
- [x] `pnpm build` (all workspaces)
- [x] `pnpm test` (all workspaces)
- [x] `pnpm lint` (all workspaces)

**Criterion (refined 2026-10-19T22:14:47+03:00):** build/test/lint all pass; no removed package remains in `pnpm-lock.yaml` as a *direct* (importer) dependency or as an orphaned entry. `puppeteer`, `node-fetch`, `user-agents`, `path-browserify` are absent from the lockfile entirely. `rxjs` (@6.6.7, @7.8.2) is allowed as a transitive dep of `inquirer` ← `cz-customizable`/`commitizen` (live root devDeps — verified via `pnpm why rxjs`). — PASS (independent acceptance subagent).
**Commit:** the lockfile rewrite landed in `733fca1` (Stage 2 commit); Stage 3 produced no further changes (install no-op), so no separate commit is needed.
