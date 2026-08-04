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

/**
 * Extract a concentration percentage from an ingredient name.
 *
 * @param str - Ingredient name to inspect, e.g. "уксус 9%".
 * @returns The percent value, or null when no explicit percentage is present.
 */
export function extractVinegarConcentration(str: string): number | null {
  const m = CONCENTRATION_RE.exec(str);
  if (m) {
    return Number.parseInt(m[1]);
  }
  return null;
}

/**
 * Detect a known ingredient type from its name and return its metadata.
 *
 * For vinegar names the explicit percentage (e.g. "уксус 9%") overrides the
 * default concentration of the matched type.
 *
 * @param str - Ingredient name to match against defined types.
 * @returns The matched IngredientType, or null for unknown ingredients.
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
 * Attach ingredient-type metadata to an ingredient based on its name.
 *
 * When no explicit type is set, tries to recognize a defined type (density,
 * concentration). For vinegar the percentage is moved from the name into
 * `type.concentration`. Mutates and returns the same ingredient.
 *
 * @param ingredient - Ingredient to enrich; mutated in-place.
 * @returns The same ingredient object.
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
