# Research: 2026-10-18_pnpm-migration

## Root `package.json`

- `workspaces: ["apps/*", "packages/*"]`, `packageManager: "npm@9.8.0"`, `engines.node: ">=22"`.
- 5 scripts use turbo: `build`, `dev`, `lint`, `test`, `format:check`.
- Chain scripts via `npm run`: `check`, `pre-commit` (format+check+build), `commit` (pre-commit + commitizen via `ts-node node_modules/.bin/cz`), `release:*` (standard-version).
- devDeps include `"turbo": "latest"` (nondeterministic), `react`/`react-dom` ^19.2.0 (duplicated with web-react), `@repo/eslint-config`, `@repo/typescript-config`, prettier, commitizen, cz-customizable, cross-env, @biomejs/biome.
- `config.commitizen.path` points at `node_modules/cz-customizable`; `cz-customizable.config` at `./.config/commitzen.ts`.

## `turbo.json`

- Legacy `pipeline` key (not `tasks`).
- `build` outputs: `.next/**` (stale — no Next.js app), `dist/**`.
- `web#dev/build` and `web-react#dev/build` depend on `@repo/food-recipe-core#build`.
- `dev` is persistent, `format:check` uncached.

## `.turbo/`

- Cache dir only (cookies), git-ignored. Safe to delete.

## Workspace packages

- **`apps/mvp` does not exist** in this checkout (deleted; AGENTS.md is stale on this).
- **`packages/vite-config` has no package.json** — not a real workspace member; only leftover `node_modules/` symlinks.
- `packages/food-recipe-core`: webpack build (`build` = lint+test+build-only), jest, eslint+tsc; deps `@repo/eslint-config`, `@repo/typescript-config`; has **nested `package-lock.json`**; engines npm>=7/node>=18; husky ^8 only here.
- `packages/eslint-config`: extends `eslint-config-turbo` in `library.js:7` and `react-internal.js:17`; README titled `# @turbo/eslint-config`.
- `packages/typescript-config`: no scripts, no deps.
- `apps/web`: Vite 5 + Vue; dep `@repo/food-recipe-core: "*"`; **nested `package-lock.json`**; uses `npm-run-all2` (`run-p`) in `build` script; nightwatch e2e.
- `apps/web-react`: Vite 5 + React 19; dep `@repo/food-recipe-core: "*"`; `build` = `npm run type && npm run build-only`.
- Cross-deps: root→eslint/typescript-config; core→eslint/typescript-config; web & web-react→core. All `@repo/*` use `"*"` versions.

## Config files

- `.gitignore`: has `node_modules`, `.pnp`, `.turbo`; **no `.cache/`, no `.tmp/`** entries (session conventions require them).
- `.npmrc`: exists, **0 bytes**.
- No `.nvmrc` / `.node-version`.
- `package-lock.json` (root, 47k lines) + nested lockfiles in `apps/web` and `packages/food-recipe-core`. No `pnpm-lock.yaml`, no `pnpm-workspace.yaml`.
- Root `node_modules` currently contains `.pnpm` symlinks (partially populated by pnpm already).

## CI (`.github/workflows/ci.yml`)

- Node 22 both jobs; `npm ci`; cache keyed on `hashFiles('**/package-lock.json')`, path `**/node_modules`.
- `test` job: build → test → lint. `publish` job: build with `DOWNLOAD_SUFFIX` env, deploy `apps/web/dist` to GitHub Pages via `JamesIves/github-pages-deploy-action@v4`.
- No pnpm action, no turbo remote-caching vars.

## Pre-commit (husky)

- `.husky/pre-commit` → `npm run pre-commit`; `.husky/commit-msg` → `npm run commitlint -- --edit "$1"`.
- husky is NOT a root devDependency (only in core); no root `prepare` script; `.husky/_/` missing; `core.hooksPath` unset — hooks currently **not active** in this checkout.

## References to turbo / npm (outside node_modules/.git/lockfiles)

- `package.json` (scripts + turbo dep), `turbo.json`, `.gitignore` (`.turbo`), `packages/eslint-config` (dep + 2 extends + README), `CONTRIBUTING.md` (Turborepo starter template), `AGENTS.md` (known-issues note), `README.md` (npm run --filter examples), `packages/food-recipe-core` (scripts, CONTRIBUTING), `apps/web`, `apps/web-react` (scripts), various `docs/specs/*`, `docs/temp/*`.
- Build tooling (Vite/Webpack configs) is package-manager-agnostic — nothing breaks under pnpm.

## Key migration facts

- pnpm catalog requires pnpm >= 9.5 (stable in 9.x; also in 10/11).
- `eslint-config-turbo` must be dropped from eslint-config when turbo goes.
- Nested `package-lock.json` files should be deleted.
- Root `react`/`react-dom` devDeps are duplicates of web-react's — candidates for removal from root.
- Husky not active; simplest fix: add husky to root devDeps + `prepare` script, hooks to `pnpm run ...`.
