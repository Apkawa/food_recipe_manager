# food-recipe-core: Docstrings needed

All exported items from `@repo/food-recipe-core` that should have JSDoc/docstring documentation.

## Instruction

Tasks are grouped by file.

1) For each file, MUST BE invoke a sub-agent sequentially (skip files where all tasks are already completed). If the sub-agent doesn't understand what a function/type does, refer to the semantics in [docs/api/food-recipe.md](docs/api/food-recipe.md).
2) After successful completion, MUST BE invoke a review sub-agent to verify the documentation semantics against [docs/api/food-recipe.md](docs/api/food-recipe.md) and either update the task status to complete or send it back for revisions.
3) Repeat steps 1–2 for all remaining files.

The task list follows below.

## food_recipe/core/types/recipe.d.ts

- [x] Recipe
- [x] IngredientGroup
- [x] BaseIngredient
- [x] SimpleIngredient
- [x] RangeIngredient
- [x] Ingredient
- [x] IngredientType

## food_recipe/core/i18n.ts

- [ ] LANG_TYPE
- [ ] LANG_LIST
- [ ] UNIT_TRANSLATIONS
- [ ] getUnitDisplay

## food_recipe/core/unit/constants.ts

- [ ] Unit
- [ ] VOLUME_UNITS
- [ ] WEIGHT_UNITS
- [ ] MEASURE_UNITS
- [ ] COUNT_UNITS
- [ ] VALUE_UNITS
- [ ] NO_VALUE_UNITS
- [ ] UNITS
- [ ] UnitConversions

## food_recipe/core/unit/unit_map.ts

- [ ] UNIT_PARSE_MAP

## food_recipe/core/unit/convert.ts

- [ ] ConvertValueUnitOption
- [ ] getAvailableConvertUnits
- [ ] convertValueUnit
- [ ] convertIngredientUnit

## food_recipe/core/unit/utils.ts

- [ ] isVolumeUnit
- [ ] isMeasureUnit
- [ ] isWeightUnit

## food_recipe/core/parser/text.ts

- [ ] parseTextRecipe

## food_recipe/core/parser/recipe_line.ts

- [ ] parseRecipeLine

## food_recipe/core/calculator/index.ts

- [ ] recipeScale
- [ ] calculateScale

## food_recipe/core/checks.ts

- [ ] isRangeIngredient

## food_recipe/core/export/index.ts

- [ ] valueToString
- [ ] recipeToText

## food_recipe/core/ingredient_type/calculate.ts

- [ ] ConcentrationResult
- [ ] calculateConcentration
- [ ] calculateConcentrationDiluting

## food_recipe/core/ingredient_type/parse.ts

- [ ] extractVinegarConcentration
- [ ] parseIngredientType
- [ ] prepareIngredient

## food_recipe/core/ingredient_type/defined_types.ts

- [ ] DEFINED_INGREDIENT_TYPES

## food_recipe/utils/number.ts

- [ ] round
- [ ] parseNumber

## food_recipe/utils/index.ts

- [ ] stripLine

## food_recipe/utils/regexp.ts

- [ ] mRegExp
- [ ] groupRegExp
- [ ] joinRegExp

## food_recipe/utils/vulgar-fractions/index.ts

- [ ] toVulgar
- [ ] toDecimal
- [ ] parseVulgars
- [ ] extractVulgarFromNumber
- [ ] numberToVulgar
