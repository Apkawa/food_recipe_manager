import {IngredientGroup, Recipe} from '@app/core/types/recipe';
import {parseRecipeLine} from '@app/core/parser/recipe_line';
import {stripLine} from '@app/utils';

export function parseTextRecipe(raw_text: string): Recipe {
  const recipe: Recipe = {
    name: '',
    ingredient_groups: [],
  };
  let group: IngredientGroup = {
    name: '',
    ingredients: [],
  };

  let i = 0;
  for (const line of raw_text.split('\n')) {
    if (!line.trim()) {
      // Пустая строка
      continue;
    }
    const result = parseRecipeLine(line);
    if (result) {
      group.ingredients.push(result);
    } else {
      // Наверное это какое то имя
      const name = stripLine(line);
      if (i == 0) {
        // maybe name
        recipe.name = name;
      } else {
        // Пушим предыдущую группу ингредиентов
        if (group.ingredients.length > 0) {
          recipe.ingredient_groups.push(group);
        }
        // Создаем новую группу
        group = {
          name,
          ingredients: [],
        };
      }
    }
    i++;
  }
  if (group.ingredients.length) {
    recipe.ingredient_groups.push(group);
  }
  return recipe;
}
