import {Ingredient, IngredientGroup, Recipe} from '../types/recipe';
import {parseRecipeLine} from '../parser/recipe_line';
import {stripLine} from '../../utils';
import {prepareIngredient} from '../ingredient_type/parse';

const END_LINE = 'o(. _ .)o';

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
  const lines = raw_text.trim().split('\n');
  lines.push(END_LINE);
  for (const line of lines) {
    if (!line.trim()) {
      // Пустая строка
      continue;
    }
    const result = parseRecipeLine(line);
    if (result) {
      if (i == 1 && !result.name && recipe.name) {
        // Скорее всего рецепт оказался без названия, а формат вида "название\n вес \n"
        group.name = recipe.name;
        recipe.name = '';
      }
      group.ingredients.push(result);
    } else {
      // Наверное это какое то имя
      const name = stripLine(line);
      if (i == 0) {
        // maybe name
        recipe.name = name;
      } else {
        // Пушим в предыдущую группу ингредиентов
        if (group.ingredients.length > 0) {
          if (group.ingredients.length == 1 && group.name && !group.ingredients[0].name) {
            // Ситуация когда название компонента и развесовка на разных строках.

            let newGroup: IngredientGroup;
            if (recipe.ingredient_groups.length > 0) {
              newGroup = recipe.ingredient_groups.pop() as IngredientGroup;
            } else {
              newGroup = {
                name: '',
                ingredients: [],
              };
            }

            let ingredient = {
              ...group.ingredients[0],
              name: group.name,
            } as Ingredient;

            ingredient = prepareIngredient(ingredient);

            newGroup.ingredients.push(ingredient);
            group = newGroup;
          }
          recipe.ingredient_groups.push(group);
        }
        if (name === END_LINE) {
          // last iteration
          break;
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
  return recipe;
}
