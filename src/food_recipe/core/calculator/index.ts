import {Ingredient, Recipe} from '@app/core/types/recipe';
import {isRangeIngredient} from '@app/core/checks';
import {round} from '@app/utils';

export function calculateScale(ingredient: Ingredient): number | null {
  if (ingredient.value && ingredient.calculated_value) {
    if (isRangeIngredient(ingredient)) {
      return ingredient.calculated_value[0] / ingredient.value[0];
    }
    return ingredient.calculated_value / ingredient.value;
  }
  return null;
}

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
