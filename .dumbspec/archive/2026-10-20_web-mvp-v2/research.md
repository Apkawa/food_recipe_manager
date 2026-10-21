# Research: 2026-10-20_web-mvp-v2

## Findings

### (a) App / calculator concept (from `apps/web-react/src/views/AboutView.tsx`)

- Goal: simplify adapting recipes to specific needs — "simplify scaling of recipes to concrete tasks".
- Main scenario: you have a plain-text recipe from YouTube or other sources, and the declared portion count is too many/too few, or you only have a fixed amount of the main product at home.
- Also relevant for batch prep ("заготовки") where the recipe must be recalculated to a target volume.
- Calculator's main features (per the About page):
  - Parsing a text recipe (free text, Russian/English units).
  - Rescaling portion count from the declared portion count.
  - Rescaling by the amount of a main product.
  - Rescaling vinegar concentration.
  - Unit conversion.
  - Volume↔mass conversion when density is known.
  - Strikethrough ingredient checklist (so you don't lose track of what's already added).
- Recipe text format: optional name, optional ingredient-group headers, ingredient lines like `Ingredient 2л`, a `7 порций` line, a `---` separator (only `-=#~` chars count), free-form description, `###` end marker.
- UI is explicitly an MVP stage; MIT license; feedback via GitHub issues.

### (b) Key domain types & fields (`packages/food-recipe-core/src/food_recipe/core/types/recipe.d.ts`)

- **Recipe**: `name: string`, `portion?: number` (declared servings), `calculated_portion?: number` (scaled servings), `description?: string`, `ingredient_groups: IngredientGroup[]`.
- **IngredientGroup**: `name: string`, `ingredients: Ingredient[]` (e.g. "for the dough").
- **Ingredient** = `SimpleIngredient | RangeIngredient`; both extend **BaseIngredient**: `name`, `note?` (clarification), `unit?: Unit`, `type?: IngredientType`.
  - Simple: `value?: number`, `calculated_value?: number`.
  - Range: `value?: number[]`, `calculated_value?: number[]` (min/max, e.g. "1–2 spoons").
  - Missing value = "to taste" / dimensionless.
- **IngredientType**: `name`, `density?: number` (g/l, for volume↔weight), `concentration?: number` (percent, e.g. vinegar).
- **No nutrition data exists** in the domain model — no calories/protein/fat/carbs fields anywhere in core types. Portion/serving math is quantity scaling only.

### (c) Calculator inputs/outputs (`packages/food-recipe-core/src/food_recipe/core/calculator/index.ts`)

- `recipeScale(recipe: Recipe, scale: number): Recipe` — multiplies every ingredient `value` by `scale`, writes result (rounded to 2 decimals) into `calculated_value`; ranges scaled per bound; ingredients without a value skipped. **Mutates the recipe in-place** and returns the same object.
- `calculateScale(ingredient: Ingredient): number | null` — inverse: factor = `calculated_value / value` (range: uses first bound); null if either is missing.
- That's the entire calculator module (single `index.ts`): the calculator computes **scaled quantities per ingredient** (and thus per portion via `calculated_portion`), not nutrition totals.
- Related: `ingredient_type/calculate.ts` (density/concentration math), `unit/convert.ts` (unit conversion), `parser/` (text → Recipe).

### (d) Existing `apps/web-mvp-v2/`

- **Does not exist.** `fd -d 2 'web-mvp'` from repo root returns nothing; `apps/` contains only `web-react/`.
- The `.dumbspec/current/2026-10-20_web-mvp-v2/` planning dir exists with `draft.md` and `spec.md` (no `research.md` before this file).

### (e) Other useful facts

- **Units** (`unit/constants.ts`): volume `l, ml, US_fl_oz, US_gill, US_pint, US_quart`; weight `kg, g, US_ounce, US_pound`; kitchen measures `tsp (5 ml), tbsp (15 ml), cup (250 ml), shot (44 ml), pinch (5/16 tsp)`; counts `pcs, portion` (special: marks the servings line); no-value unit `taste`.
- **SI normalization**: `UnitConversions` maps every unit to ml (volume) or g (weight) as base.
- **Defined ingredient types** (`ingredient_type/defined_types.ts`): sugar (density 900 g/l), kosher salt (1030), table salt (1300), vinegar acid (70%), vinegar (9%) — with RU/EN regexps.
- **Parser**: `parser/text.ts` (full text → Recipe), `parser/recipe_line.ts` (single ingredient line); i18n.ts handles RU/EN unit synonyms; `utils/vulgar-fractions` handles fractional amounts.
- **Example recipe** (visible in AboutView): "Маффины с капустой и грудинкой" — 3 eggs, 1 tsp salt, 4 tbsp kefir, 1 tbsp oil, 3 tbsp flour, 1 tsp baking powder, 300 g young cabbage, 7 portions.
- **Export** module exists (`core/export/index.ts`) — recipe output formatting.
- Core has **no build step** — apps import its `src/` directly. Core mutates Recipe objects in-place (known issue per AGENTS.md).
- Core unit tests exist under `packages/food-recipe-core/tests/unit/` (calculator, ingredient_type, parser, unit suites) — mostly parameterized case tables, `example.test.ts` is a stub.
