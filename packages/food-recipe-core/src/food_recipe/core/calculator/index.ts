import {Ingredient, Recipe} from '../types/recipe';
import {isRangeIngredient} from '../checks';
import {round} from '../../utils/number';

/**
 * Calculate the scale factor currently applied to an ingredient.
 *
 * Derived from the ratio of `calculated_value` to the original `value`.
 *
 * @param ingredient - Ingredient with both values set.
 * @returns The applied factor, or null when either value is missing.
 */
export function calculateScale(ingredient: Ingredient): number | null {
  if (ingredient.value && ingredient.calculated_value) {
    if (isRangeIngredient(ingredient)) {
      return ingredient.calculated_value[0] / ingredient.value[0];
    }
    return ingredient.calculated_value / ingredient.value;
  }
  return null;
}

/**
 * Scale all ingredient quantities of a recipe in-place.
 *
 * Multiplies each `value` by `scale` and stores the result (rounded to 2
 * decimal places) in `calculated_value`, leaving the original value intact.
 * Ingredients without a value are skipped; ranges are scaled per bound.
 *
 * @param recipe - Recipe to scale; mutated in-place.
 * @param scale - Multiplication factor (e.g. 2 doubles every quantity).
 * @returns The same recipe object with `calculated_value` fields updated.
 */
export function recipeScale(recipe: Recipe, scale: number): Recipe {
  for (const group of recipe.ingredient_groups) {
    for (const ingredient of group.ingredients) {
      if (!ingredient.value) {
        continue;
      }
      if (isRangeIngredient(ingredient)) {
        ingredient.calculated_value = [...ingredient.value].map((v) => round(v * scale));
      } else {
        ingredient.calculated_value = round(ingredient.value * scale);
      }
    }
  }
  return recipe;
}
