import {RangeValue, Recipe, Value} from '../types/recipe';
import {getUnitDisplay, LANG_TYPE} from '../i18n';

/**
 * Format an ingredient value (single number or min-max range) for display.
 *
 * @param value - Value holder with a plain or ranged quantity.
 * @param lang - Target language; Russian output swaps `.` for `,`.
 * @returns Display string, empty when no value is set ("to taste").
 */
export function valueToString(value: Value | RangeValue, lang: LANG_TYPE='ru'): string {
  let str_value = '';
  if (value.value) {
    if (Array.isArray(value.value)) {
      str_value = value.value.join('-');
    } else {
      str_value = value.value.toString();
    }
  }
  if (lang == 'ru') {
    // Исправляем точки на запятые в соответствии с локалью
    str_value = str_value.replace('.', ',')
  }
  return str_value

}

/**
 * Serialize a Recipe back to plain text (inverse of parseTextRecipe).
 *
 * Uses localized unit labels via getUnitDisplay and appends the type
 * concentration (e.g. "50%") to the ingredient name when present.
 *
 * @param recipe - Recipe to serialize.
 * @param lang - Target language for unit labels; defaults to Russian.
 * @returns The recipe as plain text.
 */
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
        value = valueToString(i)
      }
      if (i.type?.concentration) {
        name += ` ${i.type.concentration}%`;
      }
      s += `${name} \t ${value} \t ${getUnitDisplay(i.unit, lang, i.value)}\n`;
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
