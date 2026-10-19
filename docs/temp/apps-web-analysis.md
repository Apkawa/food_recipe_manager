# apps/web — Superficial Analysis

## Package Info

| Field   | Value    |
| ------- | -------- |
| Name    | `web`    |
| Version | `0.0.0`  |
| Private | `true`   |
| Type    | `module` |

## Framework & Tech Stack

- **Framework**: Vue 3 (`^3.4.15`)
- **Build Tool**: Vite (`^5.0.11`)
- **Router**: Vue Router (`^4.2.5`) — hash history (`createWebHashHistory`)
- **State Management**: Pinia (`^2.1.7`)
- **Language**: TypeScript (`~5.3.0`) with `vue-tsc` (`^1.8.27`)
- **PWA**: Yes — `vite-plugin-pwa` (`^0.19.0`)
  - App name: "Кухонный калькулятор"
  - Auto-updating service worker
  - File handler for `.txt` files

## Key Dependencies

### Production

- `@repo/food-recipe-core` — shared monorepo package
- `@vueuse/core` — Vue composition utilities
- `pinia`, `vue`, `vue-router`

### Dev

| Tool                       | Purpose                   | Version   |
| -------------------------- | ------------------------- | --------- |
| `vitest`                   | Unit testing              | `^1.2.2`  |
| `nightwatch`               | End-to-end testing        | `^3.4.0`  |
| `storybook`                | Component documentation   | `^7.6.13` |
| `eslint`                   | Linting                   | `^8.49.0` |
| `prettier`                 | Code formatting           | `^3.0.3`  |
| `jsdom`, `@vue/test-utils` | Unit test environment     | —         |
| `react`, `react-dom`       | Storybook peer dependency | `^18.2.0` |

## Scripts

```
dev                → vite
build              → type-check + vite build
preview            → build + vite preview
test:unit          → vitest run
test:e2e           → nightwatch
dev:storybook      → storybook dev -p 6006
build:storybook    → storybook build
test:storybook     → test-storybook
lint               → eslint (auto-fix)
format             → prettier --write
generate-pwa-assets → pwa-assets-generator
```

## Directory Structure

```
apps/web/
├── .storybook/            # Storybook configuration
├── public/                # Static assets (icons, PWA assets)
├── src/
│   ├── assets/            # Styles, fonts, etc.
│   ├── components/
│   │   ├── RecipeCalculator/    # Core recipe calculator components
│   │   ├── RecipeFavoriteList/  # Favorites list components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── icons/               # Icon components
│   │   └── __tests__/           # Component unit tests
│   ├── router/            # Vue Router setup (index.ts)
│   ├── stores/            # Pinia stores (counter.ts, recipe.ts)
│   ├── utils/             # Utility functions
│   ├── views/             # Page-level components
│   ├── App.vue            # Root component
│   └── main.ts            # App entry point
├── tests/                 # Nightwatch E2E tests
├── tests_output/          # Test artifacts
├── vite.config.ts         # Vite + PWA config
├── vitest.config.ts       # Vitest config
├── tsconfig.json          # TypeScript (references-based)
├── .eslintrc.cjs          # ESLint config
└── .prettierrc.json       # Prettier config
```

## Routing

Uses **Vue Router** with hash-based history (`#/path`). Four routes, all lazy-loaded except home:

| Path        | Name     | Component             | Loading |
| ----------- | -------- | --------------------- | ------- |
| `/`         | home     | `HomeView`            | Eager   |
| `/about`    | about    | `AboutView`           | Lazy    |
| `/favorite` | favorite | `RecipeFavoritesView` | Lazy    |
| `/helpers`  | helpers  | `HelpersView`         | Lazy    |

## Configuration Highlights

### Vite (`vite.config.ts`)

- Plugins: Vue, Vue JSX, Nightwatch, TypeScript checker, VitePWA
- Alias: `@` → `./src`
- Injects Git metadata at build time:
  - `VITE_GIT_COMMIT_HASH`
  - `VITE_GIT_COMMIT_DATE`
  - `VITE_GIT_BRANCH_NAME`
  - `VITE_PACKAGE_VERSION`
- Base URL: `./` (relative, suitable for static hosting)

### TypeScript (`tsconfig.json`)

- References-based config: `tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.vitest.json`
- Module system: `NodeNext`

### Build Info

Build metadata (commit hash, branch, date, version) is automatically captured from Git and exposed as runtime environment variables for `BuildInfo.vue`.
