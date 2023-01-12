import {IngredientType} from '@app/core/types/recipe';
import {DEFINED_INGREDIENT_TYPES} from './defined_types';
import {groupRegExp} from '@app/utils/regexp';

interface CompiledIngredientType extends IngredientType {
  regexp: RegExp;
}

function compileDefinedTypes(): CompiledIngredientType[] {
  const types: CompiledIngredientType[] = [];
  for (const t of DEFINED_INGREDIENT_TYPES) {
    types.push({...t, regexp: groupRegExp(t.regexp)});
  }
  return types;
}

export function parseIngredientType(str: string): IngredientType | null {
  for (const t of compileDefinedTypes()) {
    if (t.regexp.test(str)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {regexp: _, ...r_t} = t;
      return r_t;
    }
  }
  return null;
}
