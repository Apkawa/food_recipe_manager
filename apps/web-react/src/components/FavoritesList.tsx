import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import { Button, Card, CloseIcon, IconButton, List, Row } from "@repo/ui";
import { useNavigate } from "react-router-dom";

import { type RecipeState, saveStateToUrl } from "../lib/state";
import { type RecipeItem, useFavoritesStore } from "../stores/favorites";

/**
 * The favorites list: name (click → open in the calculator) + remove button.
 * Port of apps/web/src/components/RecipeFavoriteList/RecipeFavoriteList.vue —
 * opening a favorite navigates to "/" with the recipe serialized into the
 * query (`rawRecipe` base64, `scale`, `newScale`), which re-creates the state
 * in a new tab via the URL-first load priority.
 */
function FavoritesList() {
  const recipes = useFavoritesStore((s) => s.recipes);
  const removeByIndex = useFavoritesStore((s) => s.removeByIndex);
  const navigate = useNavigate();

  const onClickRecipe = (recipe: RecipeItem) => {
    const textRecipe = recipeToText(recipe);
    // 0 stands in for an undefined portion/calculated_portion: saveStateToUrl
    // skips falsy values, mirroring vue-router dropping undefined query params.
    const state: RecipeState = {
      rawRecipe: textRecipe,
      scale: recipe.portion ?? 0,
      newScale: recipe.calculated_portion ?? 0,
    };
    const url = saveStateToUrl(new URL(window.location.href), state);
    navigate(url.pathname + url.search);
  };

  return (
    <Card>
      {recipes.length > 0 ? (
        <List>
          {recipes.map((recipe, i) => (
            <Row key={recipe.name}>
              <Button
                variant="secondary"
                onClick={() => onClickRecipe(recipe)}
                className="min-w-0 flex-1"
              >
                <span className="min-w-0 flex-1 truncate text-accent">{recipe.name}</span>
              </Button>
              <IconButton variant="ghost" aria-label="Удалить" onClick={() => removeByIndex(i)}>
                <CloseIcon className="h-5 w-5" />
              </IconButton>
            </Row>
          ))}
        </List>
      ) : (
        <p className="px-4 py-4 text-sm text-muted">Пусто, добавьте из каркурлятора</p>
      )}
    </Card>
  );
}

export default FavoritesList;
