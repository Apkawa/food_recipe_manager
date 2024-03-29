import {Ingredient, IngredientGroup, Recipe} from '../types/recipe';
import {parseRecipeLine} from '../parser/recipe_line';
import {stripLine} from '../../utils';
import {prepareIngredient} from '../ingredient_type/parse';

const DESC_DELIM_RE = /\n\s*[-#=*~+]{3,}\s*\n/;
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

  const description_match = raw_text.split(DESC_DELIM_RE);
  if (description_match && description_match.length >= 2) {
    recipe.description = raw_text
      .slice(description_match[0].length, raw_text.length)
      .replace(DESC_DELIM_RE, '')
      .trim();
    raw_text = description_match[0];
  }

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
      if (result.unit == 'portion') {
        const v = result.value || 1;
        if (typeof v == 'number') {
          recipe.portion = v;
        } else {
          recipe.portion = v[0];
        }
        continue;
      }
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
        if (name == END_LINE) {
          // Пустой рецепт
          break;
        }
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
