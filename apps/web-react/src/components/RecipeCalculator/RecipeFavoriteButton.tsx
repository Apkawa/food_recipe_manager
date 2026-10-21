import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { HeartIcon, IconButton } from "@repo/ui";

import { useFavoritesStore } from "../../stores/favorites";

interface RecipeFavoriteButtonProps {
  recipe: Recipe;
}

/**
 * Add/update the recipe in the favorites list (matched by name).
 * Port of apps/web/src/components/RecipeCalculator/RecipeFavoriteButton.vue —
 * rendered as a heart icon button; the accessible name carries the old label.
 */
function RecipeFavoriteButton({ recipe }: RecipeFavoriteButtonProps) {
  const recipes = useFavoritesStore((s) => s.recipes);
  const addOrUpdateByName = useFavoritesStore((s) => s.addOrUpdateByName);

  const isFavorited = recipes.findIndex((r) => r.name === recipe.name) !== -1;

  return (
    <IconButton
      type="button"
      aria-label={isFavorited ? "Обновить избранное" : "Добавить в избранное"}
      onClick={() => addOrUpdateByName(recipe)}
    >
      <HeartIcon className={isFavorited ? "h-5 w-5 text-accent" : "h-5 w-5"} />
    </IconButton>
  );
}

export default RecipeFavoriteButton;
