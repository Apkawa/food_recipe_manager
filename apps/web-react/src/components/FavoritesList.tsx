import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import type { KeyboardEvent } from "react";
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
    <>
      <h1>Избранные рецепты</h1>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Рецепт</th>
            <th scope="col">
              <span className="sr-only">Действия</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {recipes.length > 0 ? (
            recipes.map((recipe, i) => {
              const openRecipe = () => onClickRecipe(recipe);
              const keyRecipe = (event: KeyboardEvent<HTMLAnchorElement>) => {
                // Enter/Space activate the name like a button; preventDefault
                // stops Space from scrolling the page.
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openRecipe();
                }
              };
              return (
                <tr key={recipe.name}>
                  <td>
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: parity with the Vue <a @click> link */}
                    {/* biome-ignore lint/a11y/useValidAnchor: parity with the Vue <a @click> link */}
                    <a onClick={openRecipe} tabIndex={0} onKeyDown={keyRecipe}>
                      {recipe.name}
                    </a>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="remove-item"
                      aria-label="Удалить"
                      onClick={() => removeByIndex(i)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td>Пусто, добавьте из каркурлятора</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default FavoritesList;
