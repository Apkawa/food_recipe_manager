import {Ingredient, IngredientType} from '../types/recipe';
import {DEFINED_INGREDIENT_TYPES} from './defined_types';
import {groupRegExp} from '../../utils/regexp';

interface CompiledIngredientType extends IngredientType {
  regexp: RegExp;
}

function compileDefinedTypes(): CompiledIngredientType[] {
  const types: CompiledIngredientType[] = [];
  for (const t of DEFINED_INGREDIENT_TYPES) {
    types.push({...t, regexp: groupRegExp(t.regexp, {flags: 'imu'})});
  }
  return types;
}

const CONCENTRATION_RE = /(\d+)\s*%/;

export function extractVinegarConcentration(str: string): number | null {
  const m = CONCENTRATION_RE.exec(str);
  if (m) {
    return Number.parseInt(m[1]);
  }
  return null;
}

/**
 * Пытаемся парсить название ингредиента и возвращаем метаинформацию
 * вроде плотности которая нужна будет для пересчета в другие системы измерения.
 *
 * @param str
 * @return IngredientType | null
 */
export function parseIngredientType(str: string): IngredientType | null {
  for (const t of compileDefinedTypes()) {
    if (t.regexp.test(str)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {regexp: _, ...r_t} = t;
      if (t.name.startsWith('vinegar')) {
        r_t.concentration = extractVinegarConcentration(str) || r_t.concentration;
      }
      return r_t;
    }
  }
  return null;
}

/**
 *
 * @param ingredient
 */
export function prepareIngredient(ingredient: Ingredient): Ingredient {
  if (!ingredient.type) {
    // Пробуем угадать тип ингредиента по его имени
    const ingredientType = parseIngredientType(ingredient.name);
    if (ingredientType) {
      ingredient.type = ingredientType;
      if (ingredientType.concentration) {
        // Удаляем процент если это возможно
        ingredient.name = ingredient.name.replace(CONCENTRATION_RE, '').trim();
      }
    }
  }
  return ingredient;
}
