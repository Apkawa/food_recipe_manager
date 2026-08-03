# apps/mvp — Analysis

## Package Info

- **Name:** `mvp`
- **Version:** `0.0.1`
- **Author:** Apkawa
- **License:** MIT
- **Private:** yes (internal app in monorepo)
- **Repo:** https://github.com/Apkawa/food_recipe_manager

## Scripts

| Script | Command |
|--------|---------|
| `build` | webpack --mode=production |
| `build:watch` | build + watch mode |
| `_dev` | webpack dev server on port 9000 |

## Tech Stack

- **Language:** TypeScript
- **Bundler:** Webpack 5 + ts-loader
- **Plugins:** HtmlWebpackPlugin, TsconfigPathsPlugin
- **Runtime:** Browser-based SPA (vanilla JS, no framework)

## Dependencies

- **Production:** none
- **Dev:**
  - `@repo/food-recipe-core` — core recipe parsing/calculating library (monorepo package)
  - `@repo/typescript-config` — shared TS config
  - Webpack ecosystem, raw-loader (SVG), rxjs (not actively used), type-fest, standard-version

## Directory Structure

```
apps/mvp/
├── assets/
│   └── index.html          # minimal HTML shell (textarea + scale inputs + output div)
├── src/
│   ├── index.entry.ts      # main entry — wiring, parsing, scaling, rendering
│   └── ui/
│       ├── index.ts
│       └── core/
│           └── events.ts   # DOM ready helper
├── dist/                   # build output
├── package.json
├── tsconfig.json
├── tsconfig-ts-loader.json
├── webpack.config.ts
└── README.md
```

## Purpose

A browser-based MVP tool to:

- Parse plain-text recipes (in Russian) using `@repo/food-recipe-core` parser
- Display ingredients in a table with original and recalculated values
- Recalculate ingredient quantities by changing serving size
- Persist state via localStorage + URL query params (base64-encoded recipe text)

Includes an example kimchi recipe as default input.

## Features

- Text-to-recipe parsing (Russian language support)
- Serving-size scaling calculator
- Ingredient table rendering with units (i18n via core lib)
- State persistence (localStorage + shareable URL)
- Concentration inputs for certain ingredients

## Notes

- No build errors; minimal and focused codebase.
- Pure vanilla TS — no UI framework (React, Vue, etc.).
- Tightly coupled to the monorepo's `food-recipe-core` package.
- UI is rudimentary: inline styles, no CSS framework, no component architecture.
