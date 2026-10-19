# @repo/food-recipe-core API

Shared library used by the web application for recipe parsing, scaling, unit conversion, and formatting.

> **Note:** Some functions mutate objects in-place (`recipeScale`, `convertIngredientUnit`). Clone data before calling if immutability is needed.

## Table of Contents

- [Types](#types)
  - Recipe
  - Ingredient
  - Unit
  - LANG_TYPE
- [Parser](#parser)
  - parseTextRecipe
- [Calculator](#calculator)
  - recipeScale
- [Unit Conversion](#unit-conversion)
  - convertIngredientUnit
  - getAvailableConvertUnits
- [Export](#export)
  - recipeToText
- [i18n](#i18n)
  - getUnitDisplay
- [Ingredient Type](#ingredient-type)
  - calculateConcentration
- [Utils](#utils)
  - round
  - numberToVulgar

---

## Types

### Recipe

```ts
interface Recipe {
  name: string;
  portion?: number;
  calculated_portion?: number;
  description?: string;
  ingredient_groups: IngredientGroup[];
}

interface IngredientGroup {
  name: string;
  ingredients: Ingredient[];
}
```

Core type representing a parsed recipe.

- `name` — recipe title (first non-ingredient line)
- `portion` — declared number of portions
- `calculated_portion` — portion count after scaling
- `description` — instructions/notes (text after `---` delimiter)
- `ingredient_groups` — array of ingredient sections

**Path:** `@repo/food-recipe-core/src/food_recipe/core/types/recipe`

### Ingredient

Union type: `SimpleIngredient | RangeIngredient`.

```ts
type Ingredient = BaseIngredient & (Value | RangeValue);

interface BaseIngredient {
  name: string;
  note?: string;
  unit?: Unit;
  type?: IngredientType;
}

interface Value {
  value?: number;
  calculated_value?: number;
}

interface RangeValue {
  value?: number[];
  calculated_value?: number[];
}
```

- `name` — ingredient name
- `note` — additional clarification
- `unit` — measurement unit (undefined means "to taste")
- `type` — metadata (density, concentration)
- `value` — original quantity
- `calculated_value` — quantity after scaling or unit conversion
- Range values (`number[]`) represent intervals like "1–2 spoons"

Use `isRangeIngredient(ingredient)` (check if `value` is an array) to distinguish simple from range.

**Path:** `@repo/food-recipe-core/src/food_recipe/core/types/recipe`

### Unit

```ts
type Unit =
  | 'g'
  | 'kg'
  | 'l'
  | 'ml'
  | 'tsp'
  | 'tbsp'
  | 'cup'
  | 'shot'
  | 'pinch'
  | 'pcs'
  | 'taste'
  | 'portion'
  | 'US_ounce'
  | 'US_pound'
  | 'US_fl_oz'
  | 'US_gill'
  | 'US_pint'
  | 'US_quart';
```

Union of all supported measurement units:

- Weight: `g`, `kg`, `US_ounce`, `US_pound`
- Volume: `l`, `ml`, `US_fl_oz`, `US_gill`, `US_pint`, `US_quart`
- Measures: `tsp` (5 ml), `tbsp` (15 ml), `cup` (250 ml), `shot` (44 ml), `pinch` (~3 ml)
- Abstract: `pcs`, `taste`, `portion`

**Path:** `@repo/food-recipe-core/src/food_recipe/core/unit/constants`

### LANG_TYPE

```ts
type LANG_TYPE = 'ru' | 'en';
```

Language codes used for localization.

**Path:** `@repo/food-recipe-core/src/food_recipe/core/i18n`

---

## Parser

### parseTextRecipe

```ts
function parseTextRecipe(raw_text: string): Recipe;
```

Parses a plain-text recipe into a structured `Recipe` object.

**Input format:**

```
Recipe Name

Ingredient Group Header
Ingredient Name    quantity    unit

Another Group Header
Ingredient Name    quantity    unit

Recipe on N portions

---

Description/instructions here
```

**Rules:**

- First non-ingredient line → recipe name
- Non-ingredient lines after name → ingredient group headers
- Lines matching ingredient pattern → ingredients
- Lines with `unit='portion'` → set `recipe.portion`
- Text after `---` → `recipe.description`

**Path:** `@repo/food-recipe-core/src/food_recipe/core/parser/text`

---

## Calculator

### recipeScale

```ts
function recipeScale(recipe: Recipe, scale: number): Recipe;
```

Scales all ingredient quantities in a recipe by a factor.

**Behavior:**

- Iterates all ingredient groups and ingredients
- Skips ingredients without `value`
- Handles both simple values and range values (`[1, 2]`)
- Writes result to `calculated_value`, leaves `value` unchanged
- Rounds with 2 decimal places
- **Mutates the recipe object in-place**

**Example:**

```ts
const recipe = parseTextRecipe(text);
recipeScale(recipe, 2); // doubles all ingredients
```

**Path:** `@repo/food-recipe-core/src/food_recipe/core/calculator`

---

## Unit Conversion

### convertIngredientUnit

```ts
function convertIngredientUnit(ingredient: Ingredient, toUnit: Unit): Ingredient;
```

Converts an ingredient's unit to another supported unit.

**Rules:**

- Volume ↔ measure conversion always works (ml ↔ tbsp ↔ cup, etc.)
- Weight ↔ weight always works (g ↔ kg, etc.)
- Volume ↔ weight requires `ingredient.type.density` to be set
- Converts both `value` and `calculated_value` if present
- Returns unchanged if `toUnit` is not available
- **Mutates the ingredient object in-place**

**Path:** `@repo/food-recipe-core/src/food_recipe/core/unit/convert`

### getAvailableConvertUnits

```ts
function getAvailableConvertUnits(ingredient: Ingredient): Unit[];
```

Returns all units an ingredient can be converted to based on its current unit type and density.

**Logic:**

- Volume unit (`l`, `ml`) → all volume + measure units
- Measure unit (`cup`, `tbsp`, `tsp`, `shot`, `pinch`) → all volume + measure units
- Weight unit (`g`, `kg`) → all weight units
- If `ingredient.type.density` is set → cross-conversion between volume and weight enabled

**Path:** `@repo/food-recipe-core/src/food_recipe/core/unit/convert`

---

## Export

### recipeToText

```ts
function recipeToText(recipe: Recipe, lang: LANG_TYPE = 'ru'): string;
```

Serializes a `Recipe` object back to plain text.

**Output format:**

```
Recipe Name

Ingredient Group Name
Ingredient Name    quantity    unit_label
...

Recipe on N portions

---

Description
```

**Behavior:**

- Uses `getUnitDisplay()` for localized unit labels
- In Russian mode: replaces `.` with `,` in numbers
- Appends concentration (e.g., `50%`) to ingredient name if present

**Path:** `@repo/food-recipe-core/src/food_recipe/core/export`

---

## i18n

### getUnitDisplay

```ts
function getUnitDisplay(
  unit: Unit | null | undefined,
  lang: LANG_TYPE,
  value?: number | number[],
): string;
```

Returns a localized display string for a unit.

**Examples:**

| Input                          | Output       |
| ------------------------------ | ------------ |
| `getUnitDisplay('tbsp', 'ru')` | `'ст.л.'`    |
| `getUnitDisplay('cup', 'en')`  | `'cup'`      |
| `getUnitDisplay(null, 'ru')`   | `'по вкусу'` |

The third parameter (`value`) is unused in current implementation.

**Path:** `@repo/food-recipe-core/src/food_recipe/core/i18n`

Also re-exported from `@repo/food-recipe-core/src`

---

## Ingredient Type

### calculateConcentration

```ts
function calculateConcentration(
  value: number,
  fromConcentration: number,
  toConcentration: number,
): number;
```

Calculates the volume needed to achieve a target concentration from a starting solution.

**Formula:** `(fromConcentration * value) / toConcentration`

**Example:**

```ts
calculateConcentration(100, 50, 25); // → 200
// To get 25% from 100ml of 50% solution, you need 200ml total
```

**Path:** `@repo/food-recipe-core/src/food_recipe/core/ingredient_type/calculate`

---

## Utils

### round

```ts
function round(n: number, parts = 2): number;
```

Rounds a number to a specified number of decimal places.

**Example:**

```ts
round(3.14159); // → 3.14
round(3.14159, 3); // → 3.142
```

**Path:** `@repo/food-recipe-core/src/food_recipe/utils`

### numberToVulgar

```ts
function numberToVulgar(n: number): string;
```

Converts a decimal number to a vulgar fraction display if it matches a known fraction.

**Examples:**

| Input                  | Output  |
| ---------------------- | ------- |
| `numberToVulgar(4.5)`  | `'4½'`  |
| `numberToVulgar(0.33)` | `'⅓'`   |
| `numberToVulgar(3.7)`  | `'3.7'` |

Matches common fractions (½, ⅓, ⅔, ¼, ¾, ⅛, etc.) within a 0.01 tolerance. Returns the original number as string if no match.

**Path:** `@repo/food-recipe-core/src/food_recipe/utils/vulgar-fractions`
