# AGENTS.md

Rules and context for agents working on this monorepo.

## Project at a glance

- **Monorepo**: pnpm workspaces (pnpm 11), no Turborepo. Node >=22, pnpm >=11
- **Core**: `@repo/food-recipe-core` — shared parser, calculator, unit conversion. The app depends on it.
- **Apps**:
  - `apps/web-react` — React 19 + Vite SPA (PWA, Zustand, React Router hash mode). Deployed to GitHub Pages.
- **Packages**:
  - `typescript-config` — shared tsconfig presets (ready)

## How to work

- Run everything from root: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm dev` (all run recursively via `pnpm -r`). `food-recipe-core` has no build step — apps import its `src/` directly.
- `pnpm test:smoke` — Playwright smoke suite (`tests/smoke/`): each app route loads, a route-unique marker is visible, zero console/page errors. Auto-starts the Vite dev server. Local-only (not run in CI).
- `pnpm test:e2e` — Playwright e2e suite (`tests/e2e/`): currently a stub of `test.fixme` placeholders; the full scenarios land in a separate task after the a11y work. Local-only (not run in CI).
- Both browser suites need Chromium from the project cache: `PLAYWRIGHT_BROWSERS_PATH=./.cache/ms-playwright pnpm exec playwright install chromium` (the `test:smoke`/`test:e2e` scripts set the env var automatically).
- Local pre-commit hook (Husky, installed on `pnpm install`) runs full `format + check + build` — can be slow.

## Architecture principles

- KISS: no unnecessary abstractions.
- SOLID: keep modules focused (core is pure domain, apps are UI only).
- Core = no UI dependencies, no framework. Pure TypeScript.
- Apps = thin wrappers around core logic.
- Regex-heavy parsing lives in core; avoid scattering it to apps.

## TSDoc conventions

- Follow [TSDoc spec](https://tsdoc.org/) for all public API documentation.
- Document exported declarations (functions, classes, interfaces, enums). Skip internal helpers.
- Use imperative mood in summary lines ("Parse...", "Calculate...", not "Parses...").
- Use `-` between tag name and description: `@param name - Description`.
- Prefer `@param name - desc` over `@param {Type} name` when TS can infer the type.
- Include `@returns` and `@throws` only when meaningful.
- Use `@internal` for non-public members that are exported for technical reasons.
- Keep descriptions concise; explain **why**, not what is obvious from the signature.

## Key paths

- Routing (web-react): `apps/web-react/src/router/index.tsx` (hash history)
- Stores (web-react): `apps/web-react/src/stores/`
- Core parser: `packages/food-recipe-core/src/food_recipe/core/parser/`
- Core calculator: `packages/food-recipe-core/src/food_recipe/core/calculator/`
- Core types: `packages/food-recipe-core/src/food_recipe/core/types/recipe.d.ts`
- CI/CD: `.github/workflows/ci.yml` (build + deploy web-react to Pages on branches/tags)
- Playwright config (root): `playwright.config.ts` (shared by smoke + e2e; suite selected by CLI path)
- Smoke tests (root): `tests/smoke/`
- E2E tests (root): `tests/e2e/` (stub until the post-a11y task)
- Shared browser-test helper: `tests/helpers.ts` (`trackConsoleErrors`)

## Known issues

- Core mutates Recipe objects in-place (not immutable).
- Pre-commit hook may be overkill for small changes.
