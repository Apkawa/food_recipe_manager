import type { LANG_TYPE } from "@repo/food-recipe-core/src/food_recipe/core/i18n";
import type { Ingredient, Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { Fragment } from "react";
import IngredientLine from "./IngredientLine";

interface ParsedRecipeTableProps {
  lang: LANG_TYPE;
  recipe: Recipe;
  onIngredientUpdate: (ingredient: Ingredient, groupIndex: number, ingredientIndex: number) => void;
}

/**
 * Table of the parsed (already scaled) recipe.
 * Port of the table markup in apps/web/src/components/RecipeCalculator/RecipeCalculator.vue.
 */
function ParsedRecipeTable({ lang, recipe, onIngredientUpdate }: ParsedRecipeTableProps) {
  return (
    <table className="recipeTable">
      <colgroup>
        <col span={3} style={{ width: "100%" }} />
        <col span={3} style={{ width: "auto" }} />
        <col span={3} style={{ width: "auto" }} />
      </colgroup>
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {recipe.ingredient_groups.map((group, groupIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: parity with Vue :key="'group_i:i'"
          <Fragment key={groupIndex}>
            {group.name ? (
              <tr>
                <th colSpan={4}>{group.name}</th>
              </tr>
            ) : null}
            {group.ingredients.map((ingredient, i) => (
              <IngredientLine
                // biome-ignore lint/suspicious/noArrayIndexKey: parity with Vue :key="'group_i:i'"
                key={`${groupIndex}:${i}`}
                lang={lang}
                ingredient={ingredient}
                onUpdate={(updated) => onIngredientUpdate(updated, groupIndex, i)}
              />
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

export default ParsedRecipeTable;
