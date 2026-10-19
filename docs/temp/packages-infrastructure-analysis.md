# Infrastructure Packages Analysis

Shared monorepo tooling packages under `packages/`.

## `eslint-config` (`@repo/eslint-config`)

**Purpose:** Centralized ESLint configurations for TypeScript/React projects.

**Provided configs:**

| File                | Environment      | Key Features                                                         |
| ------------------- | ---------------- | -------------------------------------------------------------------- |
| `base.js`           | Browser + ES2017 | TypeScript-focused, type-checking enabled, Jest support, max-len 100 |
| `library.js`        | Node.js          | Vercel style guide, turbo, Prettier, React/JSX globals               |
| `react-internal.js` | Browser          | Same as library but browser-targeted; for bundled React libs         |

**Key dependencies:** `@typescript-eslint/*`, `@vercel/style-guide`, `eslint-config-turbo`, `eslint-plugin-jest`, `eslint-plugin-prettier`.

**Notes:** `base.js` is opinionated (strict TS rules + type-checking). `library.js` and `react-internal.js` differ only in env (node vs browser).

---

## `typescript-config` (`@repo/typescript-config`)

**Purpose:** Shared `tsconfig.json` presets.

**Provided configs:**

| File                 | Extends     | Use Case                |
| -------------------- | ----------- | ----------------------- |
| `base.json`          | —           | Default strict TS setup |
| `nextjs.json`        | `base.json` | Next.js apps            |
| `react-library.json` | `base.json` | React libraries         |

**`base.json` highlights:**

- Strict mode, ES2022 target, DOM + DOM.Iterable libs
- NodeNext module resolution
- Declaration + declaration map enabled
- `isolatedModules`, `skipLibCheck`, `noUncheckedIndexedAccess`

**Notes:** Clean inheritance hierarchy. No dependencies (pure JSON configs).

---

## `vite-config`

**Purpose:** Intended to provide shared Vite configurations.

**Status:** ⚠️ **Incomplete** — directory exists but contains no config files or `package.json`. Only `node_modules` present.

**Action needed:** Scaffold config exports (e.g., `base.mts`, `react.mts`) and publish as `@repo/vite-config`.

---

## Summary

| Package             | Ready? | Exports        | Dependencies            |
| ------------------- | ------ | -------------- | ----------------------- |
| `eslint-config`     | ✅ Yes | 3 JS configs   | ~10 ESLint-related deps |
| `typescript-config` | ✅ Yes | 3 JSON configs | None                    |
| `vite-config`       | ❌ No  | None           | None                    |
