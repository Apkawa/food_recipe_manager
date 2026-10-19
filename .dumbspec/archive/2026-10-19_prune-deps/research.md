# Research: 2026-10-19_prune-deps

Audit of all manifests and dependency usage. Collected 2026-10-19 via a research subagent.

## Manifests

- **Root** `package.json`: no `dependencies`; devDeps: `@biomejs/biome`, `@commitlint/cli`, `@repo/typescript-config`, `commitizen`, `cz-customizable`, `husky`, `standard-version`, `ts-node` (all `catalog:` except workspace). All in use (scripts `format`, `commitlint`, `commit`, `release*`, `prepare`, root tsconfig extends).
- **packages/food-recipe-core** `package.json`: no `dependencies`; 32 devDeps (see table below).
- **apps/web-react** `package.json`: deps `@repo/food-recipe-core`, `react`, `react-dom`, `react-router-dom`, `zustand`; devDeps `@biomejs/biome`, `@testing-library/react`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `jsdom`, `typescript`, `vite`, `vite-plugin-pwa`, `vitest`. **All in use.**
- **packages/typescript-config**: no deps.

## User-named suspects — all confirmed stale (declared only in core devDeps + catalog, zero code/config/script references)

| package | status | notes |
|---|---|---|
| `puppeteer` | stale | no imports; `allowBuilds: puppeteer: True` in pnpm-workspace.yaml is its only live config reference |
| `puppeteer-extra` | stale | |
| `puppeteer-extra-plugin-adblocker` | stale | |
| `puppeteer-extra-plugin-stealth` | stale | |
| `rxjs` | stale | `docs/temp/apps-mvp-analysis.md` already notes "not actively used" |
| `node-fetch` | stale | |
| `@types/node-fetch` | stale | companion of unused `node-fetch` |
| `user-agents` | stale | |
| `@types/user-agents` | stale | companion |
| `path-browserify` | stale | code uses `node:path` (e.g. `packages/food-recipe-core/vitest.config.ts`) |

## Full core devDeps audit

| package | status | evidence |
|---|---|---|
| `@babel/plugin-proposal-pipeline-operator` | unused | referenced only by root `package.json` `"babel"` block — no babel toolchain exists (Vite/Vitest use esbuild); the babel block itself is dead config |
| `@commitlint/cli` | redundant dup | hooks/scripts live at root |
| `@commitlint/config-conventional` | redundant dup | extended only by root `.config/.commitlintrc.json` |
| `@repo/typescript-config` | unused | core tsconfig extends `@tsconfig/node20` |
| `@testing-library/dom` | unused | no imports; all core tests are vitest unit tests, no DOM tests |
| `@tsconfig/node20` | used | core `tsconfig.json` `extends` |
| `@tsconfig/recommended` | unused | no tsconfig extends it |
| `@types/glob` | unused | companion of unused `glob` |
| `@types/lodash` | unused | no lodash anywhere |
| `@types/node` | used | core tsconfig `"types": ["node", "vitest/globals"]` |
| `chalk` | unused | no imports |
| `fromentries` | unused | no imports |
| `glob` | unused | no imports |
| `husky` | redundant dup | hooks at root |
| `node-fetch` | stale | (see suspects) |
| `path-browserify` | stale | (see suspects) |
| `process` | unused | no imports |
| `puppeteer*` (4) | stale | (see suspects) |
| `rxjs` | stale | (see suspects) |
| `standard-version` | redundant dup | release scripts at root |
| `ts-node` | borderline | only a `"ts-node"` block in core tsconfig; CLI use is at root |
| `tsconfig-paths` | unused | aliases resolved natively by tsc / vitest `resolve.alias` |
| `type-fest` | unused | no imports |
| `typescript` | used | `lint: ... && tsc --build` |
| `typesync` | effectively no-op | script `synctypes` exists but no typesync config file |
| `user-agents` | stale | (see suspects) |
| `vitest` | used | `test:unit`, `vitest.config.ts`, all tests |

## Workspace/env facts

- `packageManager: pnpm@11.22.0`; CI pins pnpm 11; lockfile version `9.0`.
- Root engines `node >= 22`. Core `package.json` has stale engines `npm >=7` / `node >=18` (npm no longer used).
- `pnpm-workspace.yaml`: packages `apps/*`, `packages/*`; **catalog** pins all versions (41 entries); `onlyBuiltDependencies: @swc/core, core-js, esbuild, puppeteer`; `ignoredBuiltDependencies: sharp` (sharp is in no manifest — leftover).
- `.npmrc` exists but is empty.
- Husky hooks: `.husky/pre-commit` → `pnpm run pre-commit` (format+check+build); `.husky/commit-msg` → commitlint.

## Other notable findings

1. **Dead config remnants**: root `package.json` `browserslist` + `babel` blocks (no consumer), empty `.npmrc`, empty `packages/food-recipe-core/.parcelrc` (Parcel legacy), `sharp` in ignoredBuiltDependencies.
2. **Catalog bloat**: after pruning, ~20 catalog entries become unconsumed and should be removed from `pnpm-workspace.yaml`.
3. **Prior analysis agrees**: `docs/specs/todo_fixes.spec.md` already flags "≈30 лишних devDeps: puppeteer/jest-puppeteer, rxjs, node-fetch, user-agents, path-browserify, process… — наследие шаблона".
4. **Lockfile**: all stale packages are resolved in `pnpm-lock.yaml` (e.g. `rxjs@6.6.7`, `node-fetch@3.3.2`, `user-agents@1.1.675`, `path-browserify@1.0.1`, `puppeteer@19.11.1` + ~20 transitive entries) → `pnpm install` required to rewrite it.
