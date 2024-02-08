import {Ingredient, RangeIngredient} from './types/recipe';

export function isRangeIngredient(ingredient: Ingredient): ingredient is RangeIngredient {
  return Array.isArray(ingredient.value);
}
