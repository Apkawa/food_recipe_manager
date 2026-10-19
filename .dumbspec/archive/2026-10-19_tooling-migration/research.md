# Research: 2026-10-19_tooling-migration

Superficial context scan: dependencies, files, fixed constraints, existing solutions.

## 1. Core webpack build (packages/food-recipe-core)

- `package.json`: name `@repo/food-recipe-core`; fields `source: src/index.ts`, `main: dist/food-recipe-core.js`, `types: dist/food-recipe-core.d.ts`; NO `exports` field.
- Scripts: `build` = `lint && test && build-only`; `build-only` = `cross-env TS_NODE_PROJECT='tsconfig.json' webpack --mode=production`; `dev` = webpack serve --watch.
- devDeps include: webpack, webpack-cli, webpack-dev-server, ts-loader, terser-webpack-plugin, tsconfig-paths-webpack-plugin, @types/webpack, html-webpack-plugin (all `catalog:`).
- `webpack.config.ts`: entry `src/index.ts` → `dist/food-recipe-core.js`, ts-loader transpileOnly, no .d.ts emission. `dist/` is git-ignored, untracked.
- **Consumers:** both apps import core via deep source paths, e.g. `@repo/food-recipe-core/src/food_recipe/core/types/recipe` (apps/web/src/stores/recipe.ts:3, apps/web-react/src/stores/favorites.ts:1). Nothing imports the package root or `dist/`. Vite configs have no core alias/prebundling.
- **Conclusion: the webpack build output is consumed by NOTHING.** It only runs inside core's own `build` (which root `pnpm -r build` and the husky pre-commit chain trigger) and produces an untracked artifact.
- Webpack also appears in: `pnpm-workspace.yaml` (catalog entries), core's `CONTRIBUTING.md` ("Сборка базируется на userscript-typescript-webpack"), and doc mentions (`docs/specs/todo_fixes.spec.md`, `docs/temp/apps-mvp-analysis.md`).
- Root `package.json`: `"build": "pnpm -r build"`; husky `.husky/pre-commit` runs `format + check + build`.

Implication (per user decision): DELETE the webpack build from core (remove webpack config + webpack devDeps + build-only/dev scripts), not migrate to vite. Core's `main`/`types` pointing at `dist/` become stale — fix package.json entries (e.g. point `main`/`types` at src, since apps consume source directly).

## 2. Jest (packages/food-recipe-core)

- Jest lives ENTIRELY in `packages/food-recipe-core`. devDeps (all `catalog:`): jest, ts-jest, ts-jest-resolver, @jest/reporters, @types/jest, jest-environment-puppeteer, jest-puppeteer, @types/jest-environment-puppeteer, jest-expect-message, @types/jest-expect-message, jest-localstorage-mock, @testing-library/jest-dom.
- Config: `packages/food-recipe-core/jest.config.ts` — testEnvironment node, ts-jest preset, testMatch `**/?(*.)+(spec|test).[t]s`, ignores `tests/e2e/`, moduleNameMapper `@app/*` & `@tests/*`, setupFiles `jest-localstorage-mock` + `./.jest/setupEnv.ts` (empty), setupFilesAfterEach `./.jest/jest.setup.ts` (imports `jest-expect-message`), custom reporter `./.jest/OutputConsoleOnFailureOnlyReporter.js` (extends `@jest/reporters` DefaultReporter).
- Tests: 15 files in core — 11 in `tests/unit/`, 4 in `src/food_recipe/utils/vulgar-fractions/tests/`. NO jest-specific API usage in test sources (no jest.mock/fn/spyOn).
- `test:unit` script = `jest tests/unit/ tests/jsdom/ src/ --coverage ...` — `tests/jsdom/` DOES NOT EXIST (only `tests/unit/`).
- `build` script runs `lint && test && build-only`.
- Catalog (`pnpm-workspace.yaml`): 11 jest-related pins (jest ^29.7.0, ts-jest, ts-jest-resolver, @jest/reporters, @types/jest, jest-environment-puppeteer ^6.2.0, jest-puppeteer, jest-expect-message, jest-localstorage-mock, @types/jest-environment-puppeteer, @types/jest-expect-message) + `eslint-plugin-jest ^27.1.7`.
- `packages/eslint-config/package.json` has `eslint-plugin-jest` devDep; `eslint-config/base.js` L25/L35 reference jest plugin rules.
- **Vitest already exists in both apps** (catalog `vitest: ^3.0.0`): apps/web has `vitest.config.ts` (jsdom, merges vite.config.ts); apps/web-react has inline `test` block in `vite.config.ts` (custom jsdom env `src/test/env.ts`).
- Docs: core `CONTRIBUTING.md` L10 lists jest in stack; `docs/specs/todo_fixes.spec.md` L238 flags puppeteer/jest-puppeteer as excess devDeps.
- CI/husky: no direct jest references (generic `pnpm -r test`).

Open item for plan: verify whether core tests touch localStorage (justifies keeping a localStorage mock under vitest) and decide fate of the custom failure-only reporter (vitest has no @jest/reporters API).

## 3. ESLint / Biome status

- ESLint active in 3 places + 1 shared package:
  - Root `.eslintrc.js` — extends `@repo/eslint-config/library.js`, ignorePatterns `apps/**`,`packages/**` → effectively empty stub.
  - `packages/food-recipe-core/.eslintrc.json` — extends `@repo/eslint-config/base.js`, type-aware (`project: ./tsconfig.json`).
  - `apps/web/.eslintrc.cjs` — Vue/Storybook/TS/pretter stack (web is slated for deletion).
  - `packages/eslint-config` (`@repo/eslint-config`): `base.js` (TS type-aware recommended + jest + prettier-off + max-len 100), `library.js` (eslint:recommended + prettier + only-warn), `react-internal.js` (Vercel style guide, ORPHANED — referenced nowhere). Depended on by root + core only (workspace:).
- Biome ALREADY repo-wide: `@biomejs/biome` in root + `apps/web-react` (catalog ^2.4.12); single root `biome.json` (schema 2.4.12): `files.includes: ["**","!!**/dist"]`, VCS ignore-file on, formatter on (2 spaces, width 100, double quotes), linter `recommended`, assist organizeImports.
- Lint scripts: root `pnpm -r lint`; core `eslint --ext js,ts,tsx --max-warnings=0 --fix ./src && tsc --build`; apps/web `eslint ./src ... --fix`; apps/web-react `biome check src/`.
- ESLint deps (all catalog:): root `@repo/eslint-config` workspace; core `@repo/eslint-config` + `eslint`; eslint-config pkg: @vercel/style-guide, eslint-config-prettier, eslint-plugin-only-warn, @typescript-eslint/_, @types/eslint, @types/eslint-plugin-prettier, eslint-config-google, eslint-plugin-jest, eslint-plugin-prettier, eslint-plugin-userscripts; apps/web: @rushstack/eslint-patch, @vue/eslint-config-_, eslint, eslint-plugin-storybook, eslint-plugin-vue.
- Catalog pins: eslint ^8.49.0, @typescript-eslint ^6.17.0, eslint-plugin-vue ^9.17.0, @biomejs/biome ^2.4.12 (plus more).
- Docs mentioning eslint: AGENTS.md (eslint-config "ready"), CONTRIBUTING.md L33, docs/specs/web_react.spec.md|plan.md|todo_fixes.spec.md (note "ESLint постепенно вытесняем, в web-react его нет"; root .eslintrc.js "решить судьбу").
- CI/husky: only generic `pnpm run lint` / pre-commit chains; no direct eslint.

Implication: biome already covers the whole repo; migration = delete `.eslintrc.*` files, delete `packages/eslint-config` pkg, repoint core's lint script to biome (keep `tsc --build` part), drop all eslint deps + catalog entries.

## 4. CI (.github/workflows/ci.yml)

- ONLY workflow in .github/ (plus FUNDING.yml, empty ISSUE_TEMPLATE.md).
- Triggers: PR to `dev`, push to any branch, tags `v*`.
- Job `test`: Node 22, pnpm 11, pnpm store cache, `pnpm install --frozen-lockfile` → `pnpm run build` → `pnpm run test` → `pnpm run lint`. (E2E step commented out.)
- Job `publish` (needs test): `if: contains(' refs/heads/dev refs/heads/master ', github.ref) || startsWith(github.ref, 'refs/tags')`; permissions `contents: write`; `haya14busa/action-cond` → tag → `release` folder, branch → branch name; deploys via `JamesIves/github-pages-deploy-action@v4` with:
  - `folder: apps/web/dist`, `clean: true`, `target-folder: <branch|release>`, default branch `gh-pages`.
  - Comment in file: "Потом когда сделаю версию на vue то поменяю на apps/web/dist/" (already on web).
- `remotes/origin/gh-pages` exists. Publish targets: `gh-pages/<branch>` and `gh-pages/release` (tags).
- **Deploy switch is a drop-in:** `apps/web-react` builds to `dist/` (no custom outDir) and its vite `base: "./"` (relative) is Pages-compatible, same as web's.
- web-react package.json: name `web-react`; scripts build = `type && build-only` (vite build), preview, test, lint, format, type.
- No other .github files reference apps/web.

## 5. apps/web (Vue) — deletion map

- Package name: `web` (private v0.0.0). Deps: `@repo/food-recipe-core` (workspace:) + vue, vue-router, pinia, @vueuse/core (catalog:). ~40 devDeps: Storybook 7 stack, Nightwatch + chromedriver/geckodriver, Vue tooling (@vitejs/plugin-vue*, @vue/*), eslint/vue stack, vitest, vite, prettier, ts-node, vite-plugin-pwa + @vite-pwa/assets-generator, vite-plugin-nightwatch, npm-run-all2, etc. Scripts: dev/build/preview/test/test:unit/test:e2e/build-only/type-check/lint/format/dev:storybook/build:storybook/test:storybook/generate-pwa-assets. No format:check.
- Config files: vite.config.ts (base './', VitePWA), tsconfig.json (has `references` to app/node splits), vitest.config.ts, nightwatch.conf.cjs, .eslintrc.cjs, .prettierrc.json, .storybook/, tests/ (e2e + stories), public/ (PWA), index.html.
- Root package.json: scripts build/test/lint = `pnpm -r ...`, format = root `prettier --write "**/*.{ts,tsx,md}"` (+ .prettierignore only excludes apps/web-react), check = test+lint, pre-commit = format+check+build, format:check = `pnpm -r format:check` (web-react only). No scripts filter by app name. Root devDeps: @biomejs/biome, @commitlint/cli, @repo/eslint-config, @repo/typescript-config, commitizen, cross-env, cz-customizable, husky, prettier, standard-version, ts-node.
- pnpm-workspace.yaml: packages `apps/*`, `packages/*`; `allowBuilds` includes @nightwatch/nightwatch-inspector, @swc/core, chromedriver, core-js, esbuild, geckodriver, puppeteer, sharp: False, unrs-resolver, vue-demi; catalog 118 entries incl. ~25 web/Vue/Storybook/Nightwatch pins.
- References to apps/web (excl. node_modules, lockfile, .dumbspec): AGENTS.md (app list, key paths, "web is Vue"), CONTRIBUTING.md:30, .github/workflows/ci.yml (deploy folder + comment), docs/api/food-recipe-usage.md (~13 lines, `apps/web/src/...` paths), docs/api/food-recipe.md:3, docs/specs/web_react.status.md (historical), packages/food-recipe-core/README.md:68,69,81 (Vue storybook/e2e mentions), .eslintrc.js ignorePatterns (generic), pnpm-workspace.yaml (glob + catalog + allowBuilds). README.md already references web-react only. Root tsconfig has no project references.
- `cross-env` (root devDep) is used only by core's `build-only` webpack script (web gone, core build removed) — candidate for removal.
- core also has `jsdom-global` + `@types/jsdom-global` as runtime deps — legacy of the missing `tests/jsdom/`; no tests use it.

## Summary of decisions enabled by research

1. Core webpack build: DELETE (no consumers) — remove webpack.config.ts, 8 webpack devDeps, build/build-only/dev scripts; fix stale `main`/`types` (point at src).
2. jest: only in core. No jest-specific API in tests → vitest.config.ts (node env, aliases @app/_, @tests/_), drop .jest/ helpers, jest-expect-message, custom reporter, ts-jest, 11 catalog pins, @testing-library/jest-dom, jsdom-global deps.
3. eslint: root `.eslintrc.js` (stub) + core `.eslintrc.json` + `packages/eslint-config` pkg → delete all, core lint → `biome check` (+ keep `tsc --build`), drop eslint deps + catalog entries.
4. CI: `folder: apps/web/dist` → `apps/web-react/dist` (drop-in; relative base already set).
5. apps/web: contained removal — dir + ~25 catalog pins + allowBuilds entries + AGENTS.md/CONTRIBUTING.md/docs references.

## 6. Prettier (added 2026-10-19 on user request: prettier → biome)

- Root `package.json`: `"format": "prettier --write \"**/*.{ts,tsx,md}\""`, `"format:check": "pnpm -r format:check"`; devDep `prettier: catalog:` (catalog `^3.1.1`); inline `prettier` config block (bracketSpacing false, tabWidth 2, useTabs false, trailingComma all, singleQuote true, printWidth 100). `pre-commit` = `format + check + build`.
- `.prettierignore` (root) excludes BOTH `apps/web-react/**` and `packages/food-recipe-core/**` from prettier (comment: both formatted by Biome) → prettier effectively formats only root-level ts/tsx/md files (README.md, AGENTS.md, `.config/`, `docs/`, `.dumbspec/`).
- `apps/web/.prettierrc.json` (semi false, tabWidth 2, singleQuote true, printWidth 100, trailingComma none) + web devDeps `prettier` + `@vue/eslint-config-prettier`, script `format: prettier --write src/` — all die with apps/web.
- `packages/food-recipe-core` devDeps: `prettier` + `@types/prettier` (no prettier scripts; lint already `biome check src/ tests/ && tsc --build`) — dead deps, check `@types/prettier` usage before dropping.
- `apps/web-react` has NO prettier at all: scripts `format: biome format --write src/ dist/`, `format:check: biome check src/ --write`, `lint: biome check src/`; root `biome.json` (`files.includes: ["**","!!**/dist"]`) already covers the whole repo.
- Catalog pins: `prettier: ^3.1.1` (line 74), `'@types/prettier': ^2.7.2` (line 42), `'@vue/eslint-config-prettier': ^8.0.0` (line 50, web-only).
- Other prettier references: historical docs (`docs/specs/`, `docs/temp/`) — out of scope; no AGENTS.md/CONTRIBUTING.md/.husky/.github references.
- User's target pattern (from another project): `"format": "biome format apps packages --diagnostic-level=error"`, `"format:fix": "pnpm format --fix"`.
- Note: since prettier only formats root-level files (core + web-react are excluded) and core/web-react are already biome-formatted, the switch should produce (almost) no reformatting diff.
