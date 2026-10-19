# @repo/food-recipe-core — Package Analysis

## Overview

Core library for food recipe parsing, scaling, and formatting. Built in TypeScript, compiled via Webpack. Version: `0.0.1`.

## Package.json Highlights

- **Name**: `@repo/food-recipe-core`
- **Source**: `src/index.ts` → `dist/food-recipe-core.js` (CommonJS/UMD bundle)
- **Types**: `dist/food-recipe-core.d.ts`
- **License**: MIT

### Scripts

| Script        | Command                                 |
| ------------- | --------------------------------------- |
| `build`       | Lint → Test → Webpack production bundle |
| `build:watch` | Watch mode                              |
| `test`        | Jest (unit + jsdom tests with coverage) |
| `lint`        | ESLint + TypeScript build check         |

### Dependencies

- **Runtime**: `jsdom-global` (for browser-like env)
- **Tooling**: TypeScript 5.x, Webpack 5.x, Jest 29.x, Puppeteer (for jsdom/integration tests)

## Public API (exports from `index.ts`)

1. **`parseTextRecipe(text: string) => Recipe`** — Parse plain text recipes into structured objects
2. **`recipeScale(recipe: Recipe, scale: number) => Recipe`** — Scale ingredient quantities
3. **`getUnitDisplay(unit, lang, value) => string`** — Localized unit formatting (ru/en)

## Domain Models (`types/recipe.d.ts`)

```
Recipe
├── name, description
├── portion, calculated_portion
└── ingredient_groups[]
    └── IngredientGroup: { name, ingredients[] }
        └── Ingredient = SimpleIngredient | RangeIngredient
            └── BaseIngredient: { name, note?, unit?, type? }
                + value / calculated_value (number or number[] for ranges)

IngredientType
├── name
├── density?     (g/l)
└── concentration? (%)
```

## Key Modules

### Parser (`parser/text.ts`, `parser/recipe_line.ts`)

- Parses plain text recipes line-by-line using regex patterns
- Handles: ingredient names, values, ranges (e.g., "1-2"), vulgar fractions ("1/2")
- Detects group names as non-ingredient lines
- Supports `portion` unit to set recipe servings
- Extracts description after `---` delimiter

### Calculator (`calculator/index.ts`)

- `recipeScale()`: multiplies all ingredient values by a scale factor
- `calculateScale()`: derives scale ratio from original vs calculated values

### Units (`unit/constants.ts`, `unit/unit_map.ts`, `unit/convert.ts`)

- Supports: volume (ml, l, cup, tbsp, tsp), weight (g, kg), US units, count (pcs)
- `UnitConversions` maps each unit to a base value (ml for volume, g for weight)
- `UNIT_PARSE_MAP` defines alternative tokens for parsing (e.g., "ст.л." → "tbsp")

### Ingredient Types (`ingredient_type/`)

- `defined_types.ts`: predefined ingredient types with density/concentration
- `parse.ts`: `prepareIngredient()` auto-assigns ingredient type by name
- `calculate.ts`: conversion logic using density (weight ↔ volume)

### Export (`export/index.ts`)

- `recipeToText(recipe, lang?)`: serializes a Recipe object back to formatted plain text

### I18n (`i18n.ts`)

- Russian and English unit translations
- Locale-aware number formatting (comma vs period)

### Utils (`utils/`)

- `number.ts`: vulgar fraction parsing, rounding
- `regexp.ts`: regex helper for combining patterns
- `checks.ts`: type guards and validation

## Test Structure

- `tests/unit/` — Jest-based unit tests for parsers, calculators, utilities

## Architecture Notes

- Pure TypeScript domain library with no UI dependencies
- Uses regex-heavy parsing for flexible text input
- Designed for extensibility (custom ingredient types, unit aliases)
- Monorepo-aware: uses `@repo/eslint-config`, `@repo/typescript-config`
- Dual environment support (Node + browser via jsdom)

## Potential Improvements (Observations)

- `package.json` lists `@types/*` as runtime `dependencies` instead of `devDependencies`
- Parser and calculator mutate `Recipe` objects in-place (not immutable)
- `parser/text/index.ts` is imported but only `parser/text.ts` exists (minor path mismatch)
- No formal exports map or ESM support currently
