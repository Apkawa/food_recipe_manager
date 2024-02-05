import {IngredientType} from '@app/core/types/recipe';
import {DEFINED_INGREDIENT_TYPES} from './defined_types';
import {groupRegExp} from '@app/utils/regexp';

interface CompiledIngredientType extends IngredientType {
  regexp: RegExp;
}

function compileDefinedTypes(): CompiledIngredientType[] {
  const types: CompiledIngredientType[] = [];
  for (const t of DEFINED_INGREDIENT_TYPES) {
    types.push({...t, regexp: groupRegExp(t.regexp, {flags: 'mu'})});
  }
  return types;
}

export function extractVinegarConcentration(str: string): number | null {
  const concentrationRegExp = /(\d+)\s*%/;
  const m = concentrationRegExp.exec(str);
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
