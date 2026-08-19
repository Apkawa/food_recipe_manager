# AGENTS.md

Rules and context for agents working on this monorepo.

## Project at a glance

- **Monorepo**: npm workspaces + Turborepo. Node >=22, npm@9.8.0
- **Core**: `@repo/food-recipe-core` — shared parser, calculator, unit conversion. Both apps depend on it.
- **Apps**:
  - `apps/web` — Vue 3 + Vite SPA (PWA, Pinia, Vue Router hash-mode). Deployed to GitHub Pages.
  - `apps/web-react` — React 19 + Vite SPA (PWA, Zustand, React Router hash mode), port of `apps/web`; deploy pending.
  - `apps/mvp` — Vanilla TS + Webpack SPA. Minimal demo for recipe parsing + scaling.
- **Packages**:
  - `eslint-config` — shared ESLint presets (ready)
  - `typescript-config` — shared tsconfig presets (ready)
  - `vite-config` — **incomplete** (no files yet)

## How to work

- Run everything from root: `npm run build`, `npm run test`, `npm run lint`, `npm run dev`. Turborepo orchestrates.
- Always build `food-recipe-core` first if changing it: `npm run build --filter=@repo/food-recipe-core`.
- Local pre-commit hook runs full `format + check + build` — can be slow.

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

- Routing (web): `apps/web/src/router/index.ts` (hash history)
- Stores (web): `apps/web/src/stores/`
- Routing (web-react): `apps/web-react/src/router/index.tsx` (hash history)
- Stores (web-react): `apps/web-react/src/stores/`
- Core parser: `packages/food-recipe-core/src/parser/`
- Core calculator: `packages/food-recipe-core/src/calculator/`
- Core types: `packages/food-recipe-core/src/types/recipe.d.ts`
- CI/CD: `.github/workflows/ci.yml` (build + deploy web to Pages on branches/tags)

## Known issues

- `vite-config` package is empty — don't import from it.
- Core mutates Recipe objects in-place (not immutable).
- Pre-commit hook may be overkill for small changes.
- `web` is Vue (not Next.js despite `.next/**` in turbo.json outputs).
