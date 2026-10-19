import type { Ingredient, RangeIngredient } from "./types/recipe";

/**
 * Check whether an ingredient carries a range value instead of a single number.
 *
 * @param ingredient - Ingredient to inspect.
 * @returns True when `value` is an array (e.g. "1-2 spoons").
 */
export function isRangeIngredient(ingredient: Ingredient): ingredient is RangeIngredient {
  return Array.isArray(ingredient.value);
}
