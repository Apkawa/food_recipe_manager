import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";

import { useFavoritesStore } from "../../stores/favorites";

interface RecipeFavoriteButtonProps {
  recipe: Recipe;
}

/**
 * Add/update the recipe in the favorites list (matched by name).
 * Port of apps/web/src/components/RecipeCalculator/RecipeFavoriteButton.vue.
 */
function RecipeFavoriteButton({ recipe }: RecipeFavoriteButtonProps) {
  const recipes = useFavoritesStore((s) => s.recipes);
  const addOrUpdateByName = useFavoritesStore((s) => s.addOrUpdateByName);

  const isFavorited = recipes.findIndex((r) => r.name === recipe.name) !== -1;

  return (
    <button type="button" onClick={() => addOrUpdateByName(recipe)}>
      {isFavorited ? "Обновить избранное" : "Добавить в избранное"}
    </button>
  );
}

export default RecipeFavoriteButton;
