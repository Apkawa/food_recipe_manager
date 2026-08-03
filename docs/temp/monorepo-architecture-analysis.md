# Monorepo Architecture Analysis

## Project Overview

- **Name**: Food Recipe Manager
- **Type**: Npm workspaces monorepo managed by Turborepo
- **Node**: >=18, packageManager: npm@9.8.0
- **Purpose**: Recipe parsing, recalculation, and unit conversion UI

## Structure

```
apps/
  mvp/           # MVP demo app (depends on @repo/food-recipe-core)
  web/           # Next.js web app (depends on @repo/food-recipe-core)

packages/
  eslint-config/      # Shared ESLint config
  typescript-config/  # Shared TS configs (base.json)
  food-recipe-core/   # Core business logic (parsing, calculation, units)
  vite-config/        # Shared Vite config

.config/    # Commitlint + Commitizen (cz-customizable, Russian prompts)
.github/    # CI/CD workflows
.husky/     # Git hooks (pre-commit, commit-msg)
```

## Turborepo Pipeline (`turbo.json`)

| Task   | Depends On          | Cache     | Notes                        |
|--------|---------------------|-----------|------------------------------|
| build  | ^build              | yes       | Outputs: .next/**, dist/**   |
| dev    | -                   | no        | Persistent                   |
| lint   | ^lint               | yes       |                              |
| test   | ^test               | yes       |                              |

- `globalDependencies` tracks `.env.*local` files.
- `mvp#build` and `web#build` explicitly depend on `@repo/food-recipe-core#build`.
- `web#dev` also depends on `@repo/food-recipe-core#build`.

## TypeScript

Root `tsconfig.json` extends `@repo/typescript-config/base.json`, delegating all configuration to the shared package.

## CI/CD (`.github/workflows/ci.yml`)

**Trigger**: PRs to `dev`, pushes to any branch, tags `v*`.

**Test job**:
- Node 18, caches `node_modules`
- Runs: `npm ci` → `npm run build` → `npm run test` → `npm run lint`
- E2E tests commented out.

**Publish job** (needs `test`):
- Runs on `dev`, `master`, or tag pushes.
- Deploys `apps/web/dist` to GitHub Pages (`release/` branch) under:
  - `release/<branch>` for branch deploys
  - `release/release` for tagged releases

## Tooling & Scripts

| Tool              | Purpose                              |
|-------------------|--------------------------------------|
| Prettier          | Code formatting                      |
| ESLint            | Shared via `@repo/eslint-config`     |
| Commitlint        | Enforces Conventional Commits        |
| Commitizen        | Interactive commit messages (cz-customizable) |
| Husky             | Git hooks (pre-commit, commit-msg)   |
| standard-version  | Automated releases (`.versionrc.js`) |
| Babel             | Pipeline operator plugin             |

**Root scripts**:

- `build` / `dev` / `lint` / `test` → delegated to Turborepo.
- `format` → Prettier writes TS/TSX/MD.
- `pre-commit` → format → check → build.
- `commit` → pre-commit → commitizen prompt.
- `release` → standard-version (patch/minor/pre variants available).
- `.versionrc.js` hides `chore`, `docs`, `style`, `refactor`, `perf`, `test` from changelog.

## Observations & Notes

- **Coupling**: Both apps depend on `@repo/food-recipe-core`, the central business logic package.
- **Overzealous pre-commit**: Runs full format + check + build on every commit locally, which can be slow.
- **CI caching**: Caches entire `node_modules` tree; using a more targeted cache or `npm ci` native caching may be faster.
- **Next.js outputs**: Turborepo captures `.next/**` and `dist/**`; `web/` appears to use Next.js.
- **Russian localization**: Commitizen prompts and project docs are in Russian; aligns with README i18n plans.
