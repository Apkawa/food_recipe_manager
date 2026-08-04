# @repo/food-recipe-core Usage Guide

Minimal, working examples of the core logic in action. This is a companion to
[food-recipe.md](./food-recipe.md) — that file is the API reference (signatures and
behavior), this one shows **how the apps actually use the library**, step by step.

All patterns below are taken from real consumers:

- `apps/web/src/components/RecipeCalculator/` — Vue 3 calculator UI
- `apps/mvp/src/index.entry.ts` — minimal vanilla-TS demo
- `packages/food-recipe-core/tests/unit/` — expected behavior (Jest)

---

## Importing the package

Both apps import **deep paths** into the TypeScript source:

```ts
import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import {convertIngredientUnit, getAvailableConvertUnits} from '@repo/food-recipe-core/src/food_recipe/core/unit/convert';
import {recipeToText, valueToString} from '@repo/food-recipe-core/src/food_recipe/core/export';
import {getUnitDisplay, LANG_TYPE} from '@repo/food-recipe-core/src/food_recipe/core/i18n';
import {calculateConcentration} from '@repo/food-recipe-core/src/food_recipe/core/ingredient_type/calculate';
import {round} from '@repo/food-recipe-core/src/food_recipe/utils';
import {numberToVulgar} from '@repo/food-recipe-core/src/food_recipe/utils/vulgar-fractions';
import type {Recipe, Ingredient} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';
import type {Unit} from '@repo/food-recipe-core/src/food_recipe/core/unit/constants';
```

The root entry (`@repo/food-recipe-core/src`) re-exports only the three most common
functions: `parseTextRecipe`, `recipeScale`, `getUnitDisplay`. Everything else is a deep import.

> After changing anything inside `packages/food-recipe-core`, rebuild it before relying
> on the compiled bundle: `npm run build --filter=@repo/food-recipe-core`.
> (Apps that deep-import `src/` pick up source changes directly in dev.)

---

## Minimal end-to-end example

The whole app flow in one script: **parse → scale → render → serialize**.

```ts
import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import {recipeToText} from '@repo/food-recipe-core/src/food_recipe/core/export';
import {getUnitDisplay, LANG_TYPE} from '@repo/food-recipe-core/src/food_recipe/core/i18n';
import {round} from '@repo/food-recipe-core/src/food_recipe/utils';

const LANG: LANG_TYPE = 'ru';

const rawRecipe = `
Картофельные дольки с чесноком

Ингредиенты:
🥔 Картофель - 1 кг
🧄 Чеснок – ½ головки
🌶 Красный перец – 1-2 чайные ложки
🧈 Растительное масло – 3 столовые ложки
`;

// 1. Parse plain text into a structured Recipe
const recipe = parseTextRecipe(rawRecipe);
// recipe.name === 'Картофельные дольки с чесноком'
// one group "Ингредиенты" with 4 ingredients;
// "Красный перец" has a range value: [1, 2]

// 2. Scale to the target number of portions.
//    The factor is always newPortions / originalPortions.
const scale = recipe.portion ?? 1;   // declared in text, or fallback
const newScale = 6;                  // desired portions
recipe.calculated_portion = newScale;
recipeScale(recipe, newScale / scale); // mutates in place: fills calculated_value

// 3. Render original vs scaled values
for (const group of recipe.ingredient_groups) {
  for (const i of group.ingredients) {
    const value = Array.isArray(i.value) ? i.value.join('-') : String(i.value ?? '');
    const calc = Array.isArray(i.calculated_value)
      ? i.calculated_value.map((v) => round(v, 2)).join('-')
      : String(round(i.calculated_value ?? 0, 2));
    console.log(`${i.name}\t${value}\t→\t${calc} ${getUnitDisplay(i.unit, LANG)}`);
  }
}
// Картофель          1     →  6      кг
// Чеснок – головки   0.5   →  3      шт.
// Красный перец      1-2   →  6-12   ч.л.
// Растительное масло 3     →  18     ст.л.

// 4. Serialize back to text (inverse of parseTextRecipe)
console.log(recipeToText(recipe, LANG));
```

This is exactly the loop implemented in
`apps/web/src/components/RecipeCalculator/RecipeCalculator.vue` and
`apps/mvp/src/index.entry.ts`.

---

## Step by step

### 1. Parse a text recipe

`parseTextRecipe(raw_text)` turns pasted plain text into a `Recipe`:

- first non-ingredient line → `recipe.name`
- other non-ingredient lines → group headers (`IngredientGroup.name`)
- lines like "Рецепт на 4 порций" / "2 portions" → `recipe.portion`
- text after a `---` delimiter → `recipe.description`
- known ingredients (e.g. "соль") get typed metadata, e.g. `type: {name: 'kosher salt', density: 1030}`

See `tests/unit/core/parser/parseText.test.ts` for the full set of accepted shapes
(emoji prefixes, vulgar fractions like `½`, ranges like "1-2 чайные ложки").

### 2. Scale portions

The scale factor is **new portions ÷ original portions**, and the result is written to
`calculated_value` (the original `value` is preserved):

```ts
// apps/web/src/components/RecipeCalculator/RecipeCalculator.vue
const updateScaleCb = () => {
  if (parsedRecipe.value) {
    parsedRecipe.value.portion = state.scale;              // original portions
    parsedRecipe.value.calculated_portion = state.newScale; // target portions
    parsedRecipe.value = recipeScale(parsedRecipe.value, state.newScale / state.scale);
  }
};
```

Notes (see `tests/unit/core/calculator/recipeScale.test.ts`):

- ingredients without `value` are skipped ("to taste" stays untouched)
- ranges are scaled per bound: `[1, 2] * 3 → [3, 6]`
- results are rounded to 2 decimal places
- the function **mutates and returns the same object**

### 3. Handle a manual ingredient edit (re-derive the scale)

When the user types a new quantity for one ingredient, the app back-calculates what
overall portion count that implies and re-scales everything else:

```ts
// RecipeCalculator.vue — ingredientUpdateCb()
const customScale = round(ingredient.calculated_value / ingredient.value, 3);
if (round(state.newScale / state.scale, 3) !== customScale) {
  // x / scale = customScale  →  x = scale * customScale
  state.newScale = round(state.scale * customScale, 2);
}
// then the edited ingredient is put back and the recipe re-serialized:
parsedRecipe.value.ingredient_groups[g_i].ingredients[i] = ingredient;
state.rawRecipe = recipeToText(parsedRecipe.value); // raw text stays the source of truth
```

The inverse helper exists in core: `calculateScale(ingredient)` returns
`calculated_value / value` (or `null`).

### 4. Convert units

Two functions work together — one lists the options, the other does the conversion:

```ts
// EditUnitSelect.vue — fill a <select> with every unit this ingredient can become
const options = getAvailableConvertUnits(ingredient); // Unit[]

// Edit.vue — apply the chosen unit
editIngredient.value = convertIngredientUnit(editIngredient.value, unit);
```

Behavior (see `tests/unit/core/unit/convertIngredientUnit.test.ts`):

- volume ↔ measure always works (`3 cup → 750 ml`, `1 tbsp → 3 tsp`)
- weight ↔ weight always works (`g ↔ kg`)
- volume ↔ weight needs `ingredient.type.density` (e.g. sugar `{value: 2, unit: 'tbsp', type: {density: 900}}` → `27 g`)
- both `value` and `calculated_value` are converted when present
- **mutates the ingredient in place** — the web app clones first (`cloneDeep(props.ingredient)`)

### 5. Adjust concentration

For typed ingredients (vinegar, etc.) the user can change the target concentration;
both the original and the scaled quantity are recalculated:

```ts
// Edit.vue — updateConcentration()
if (isNumber(fromConcentration) && isNumber(toConcentration)) {
  editIngredient.value.value = calculateConcentration(value, fromConcentration, toConcentration);
  if (isNumber(calc_value)) {
    editIngredient.value.calculated_value = calculateConcentration(calc_value, fromConcentration, toConcentration);
  }
}
// formula: (fromConcentration * value) / toConcentration
```

### 6. Display values

Rendering helpers used by both apps:

```ts
import {round} from '@repo/food-recipe-core/src/food_recipe/utils';
import {numberToVulgar} from '@repo/food-recipe-core/src/food_recipe/utils/vulgar-fractions';
import {getUnitDisplay, LANG_TYPE} from '@repo/food-recipe-core/src/food_recipe/core/i18n';
import type {Unit} from '@repo/food-recipe-core/src/food_recipe/core/unit/constants';

// apps/web/src/components/RecipeCalculator/utils.ts
const VULGAR_UNITS: Unit[] = ['cup', 'tsp', 'tbsp', 'shot'];

function valueDisplay(value?: number | number[], unit?: Unit): string {
  let values: number[] = [];
  if (value) {
    values = Array.isArray(value) ? value.map((v) => round(v, 2)) : [round(value, 2)];
  }
  const display = unit && VULGAR_UNITS.includes(unit)
    ? values.map((v) => numberToVulgar(v)) // 4.5 → '4½', 0.33 → '⅓'
    : values.map((v) => v.toString());
  return display.join(' - ');              // ranges render as "1 - 2"
}

getUnitDisplay('tbsp', 'ru');   // 'ст.л.'
getUnitDisplay(null, 'ru');     // 'по вкусу' (no unit = to taste)
```

### 7. Serialize back to text (round-trip / share)

`recipeToText(recipe, lang = 'ru')` is the inverse of `parseTextRecipe`. Two usage
modes in the web app:

**a) Persistence** — after every edit the parsed recipe is re-serialized and stored as
the raw text (single source of truth):

```ts
state.rawRecipe = recipeToText(parsedRecipe.value); // RecipeCalculator.vue
```

**b) Sharing** — before sharing, the scaled values are "baked in" so the copied text
is self-contained:

```ts
// RecipeShare.vue
const recipe = cloneDeep(props.recipe);          // don't mutate the live object
recipe.portion = recipe.calculated_portion;      // share the *scaled* portion count
for (const g of recipe.ingredient_groups) {
  for (const i of g.ingredients) {
    i.value = i.calculated_value;                // bake scaled values into value
  }
}
textRecipe.value = recipeToText(recipe);         // → clipboard / navigator.share
```

---

## Gotchas

1. **In-place mutation.** `recipeScale` and `convertIngredientUnit` mutate their
   argument. Clone (e.g. lodash `cloneDeep`) before calling if you need the original —
   this is the pattern both apps follow.
2. **`value` vs `calculated_value`.** `value` is always the parsed original;
   `calculated_value` appears only after scaling/conversion and is what the UI renders.
   Treat it as optional: display `calculated_value ?? value`.
3. **Range ingredients.** `value` / `calculated_value` may be `number[]`
   ("1-2 чайные ложки" → `[1, 2]`). Always branch on `Array.isArray(...)`
   (or use `isRangeIngredient`) before arithmetic or stringification.
4. **`recipe.portion` is optional.** It is only set when the text contains a
   "Рецепт на N порций" line; fall back to `1` or user input otherwise.
5. **Rounding.** `recipeScale` rounds to 2 decimals; the web app compares derived
   scale factors at 3 decimals before re-scaling, which keeps manual edits stable.
6. **Language defaults to Russian.** Both `recipeToText` and `valueToString` default
   to `lang = 'ru'`, which swaps `.` for `,` in numbers. Pass `'en'` explicitly for
   English output.

---

## See also

- [food-recipe.md](./food-recipe.md) — full API reference (all types, functions, units)
- `apps/web/src/components/RecipeCalculator/` — complete Vue usage
- `apps/mvp/src/index.entry.ts` — minimal vanilla-TS usage
- `packages/food-recipe-core/tests/unit/` — behavior examples as Jest cases
