# food-recipe-core: Docstrings needed

All exported items from `@repo/food-recipe-core` that should have JSDoc/docstring documentation.

## Types / Interfaces

- Recipe - food_recipe/core/types/recipe.d.ts
- IngredientGroup - food_recipe/core/types/recipe.d.ts
- BaseIngredient - food_recipe/core/types/recipe.d.ts
- SimpleIngredient - food_recipe/core/types/recipe.d.ts
- RangeIngredient - food_recipe/core/types/recipe.d.ts
- Ingredient - food_recipe/core/types/recipe.d.ts
- IngredientType - food_recipe/core/types/recipe.d.ts
- LANG_TYPE - food_recipe/core/i18n.ts
- Unit - food_recipe/core/unit/constants.ts
- ConcentrationResult - food_recipe/core/ingredient_type/calculate.ts
- ConvertValueUnitOption - food_recipe/core/unit/convert.ts

## Constants

- LANG_LIST - food_recipe/core/i18n.ts
- UNIT_TRANSLATIONS - food_recipe/core/i18n.ts
- VOLUME_UNITS - food_recipe/core/unit/constants.ts
- WEIGHT_UNITS - food_recipe/core/unit/constants.ts
- MEASURE_UNITS - food_recipe/core/unit/constants.ts
- COUNT_UNITS - food_recipe/core/unit/constants.ts
- VALUE_UNITS - food_recipe/core/unit/constants.ts
- NO_VALUE_UNITS - food_recipe/core/unit/constants.ts
- UNITS - food_recipe/core/unit/constants.ts
- UnitConversions - food_recipe/core/unit/constants.ts
- UNIT_PARSE_MAP - food_recipe/core/unit/unit_map.ts
- DEFINED_INGREDIENT_TYPES - food_recipe/core/ingredient_type/defined_types.ts

## Functions

- parseTextRecipe - food_recipe/core/parser/text.ts
- parseRecipeLine - food_recipe/core/parser/recipe_line.ts
- recipeScale - food_recipe/core/calculator/index.ts
- calculateScale - food_recipe/core/calculator/index.ts
- isRangeIngredient - food_recipe/core/checks.ts
- getUnitDisplay - food_recipe/core/i18n.ts
- valueToString - food_recipe/core/export/index.ts
- recipeToText - food_recipe/core/export/index.ts
- getAvailableConvertUnits - food_recipe/core/unit/convert.ts
- convertValueUnit - food_recipe/core/unit/convert.ts
- convertIngredientUnit - food_recipe/core/unit/convert.ts
- isVolumeUnit - food_recipe/core/unit/utils.ts
- isMeasureUnit - food_recipe/core/unit/utils.ts
- isWeightUnit - food_recipe/core/unit/utils.ts
- calculateConcentration - food_recipe/core/ingredient_type/calculate.ts
- calculateConcentrationDiluting - food_recipe/core/ingredient_type/calculate.ts
- extractVinegarConcentration - food_recipe/core/ingredient_type/parse.ts
- parseIngredientType - food_recipe/core/ingredient_type/parse.ts
- prepareIngredient - food_recipe/core/ingredient_type/parse.ts
- round - food_recipe/utils/number.ts
- parseNumber - food_recipe/utils/number.ts
- toVulgar - food_recipe/utils/vulgar-fractions/index.ts
- toDecimal - food_recipe/utils/vulgar-fractions/index.ts
- parseVulgars - food_recipe/utils/vulgar-fractions/index.ts
- extractVulgarFromNumber - food_recipe/utils/vulgar-fractions/index.ts
- numberToVulgar - food_recipe/utils/vulgar-fractions/index.ts

## Utils helpers

- stripLine - food_recipe/utils/index.ts
- mRegExp - food_recipe/utils/regexp.ts
- groupRegExp - food_recipe/utils/regexp.ts
- joinRegExp - food_recipe/utils/regexp.ts
