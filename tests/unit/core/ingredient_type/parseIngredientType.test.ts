import {Cases} from '@tests/unit/types';
import {parseIngredientType} from '@app/core/ingredient_type/parse';
import {IngredientType} from '@app/core/types/recipe';

describe('parseIngredientType', () => {
  const cases: Cases<string, IngredientType> = [
    {
      arg: 'sugar', expected: {name: 'sugar', density: 900},
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', c => {
    expect(parseIngredientType(c.arg)).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(parseIngredientType(c.arg)).toStrictEqual(c.expected);
  });
});
