import type { LANG_TYPE } from "@repo/food-recipe-core/src/food_recipe/core/i18n";
import type { Ingredient, Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { Card, CardHeader, List } from "@repo/ui";
import IngredientLine from "./IngredientLine";

interface ParsedRecipeTableProps {
  lang: LANG_TYPE;
  recipe: Recipe;
  onIngredientUpdate: (ingredient: Ingredient, groupIndex: number, ingredientIndex: number) => void;
}

/**
 * One card per ingredient group of the parsed (already scaled) recipe,
 * each with a divided list of {@link IngredientLine} rows.
 * Port of the table markup in apps/web/src/components/RecipeCalculator/RecipeCalculator.vue.
 */
function ParsedRecipeTable({ lang, recipe, onIngredientUpdate }: ParsedRecipeTableProps) {
  return (
    <>
      {recipe.ingredient_groups.map((group, groupIndex) => (
        <Card key={groupIndex}>
          <CardHeader>{group.name || "Ингредиенты"}</CardHeader>
          <List>
            {group.ingredients.map((ingredient, i) => (
              <IngredientLine
                key={`${groupIndex}:${i}`}
                lang={lang}
                ingredient={ingredient}
                onUpdate={(updated) => onIngredientUpdate(updated, groupIndex, i)}
              />
            ))}
          </List>
        </Card>
      ))}
    </>
  );
}

export default ParsedRecipeTable;
