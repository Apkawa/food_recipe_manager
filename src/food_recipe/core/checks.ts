import {Ingredient, RangeIngredient} from '@app/core/types/recipe';

export function isRangeIngredient(ingredient: Ingredient): ingredient is RangeIngredient {
  return Array.isArray(ingredient.value);
}
