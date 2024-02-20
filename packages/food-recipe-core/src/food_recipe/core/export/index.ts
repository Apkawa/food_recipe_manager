import {Recipe} from '../types/recipe';
import {getUnitDisplay, LANG_TYPE} from '../i18n';

export function recipeToText(recipe: Recipe, lang: LANG_TYPE = 'ru'): string {
  let s = '';
  if (recipe.name) {
    s += recipe.name + '\n';
  }
  for (const g of recipe.ingredient_groups) {
    s += '\n';
    if (g.name) {
      s += `${g.name}\n`;
    }
    for (const i of g.ingredients) {
      let name = i.name;
      let value = '';
      if (i.value) {
        value = i.value.toString();
        if (Array.isArray(i.value)) {
          value = i.value.join('-');
        }
      }
      if (i.type?.concentration) {
        name += ` ${i.type.concentration}%`;
      }
      s += `${name} - ${value} ${getUnitDisplay(i.unit, lang, i.value)}\n`;
    }
  }
  if (recipe.portion) {
    s += `\nРецепт на ${recipe.portion} порций \n`;
  }
  if (recipe.description) {
    s += `\n---\n\n${recipe.description}\n`;

  }
  return s;
}
