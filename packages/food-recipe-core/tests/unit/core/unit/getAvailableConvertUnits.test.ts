import {Cases} from '@tests/unit/types';
import {Ingredient} from '../../../../src/food_recipe/core/types/recipe';
import {
  convertIngredientUnit,
  getAvailableConvertUnits,
} from '../../../../src/food_recipe/core/unit/convert';
import {Unit} from '../../../../src/food_recipe/core/unit/constants';

describe('getAvailableConvertUnits', () => {
  const cases: Cases<Ingredient, Unit[]> = [
    {
      arg: {name: 'sugar', value: 1, unit: 'l', type: {name: 'sugar', density: 900}},
      expected: ['l', 'ml', 'tsp', 'tbsp', 'cup', 'pinch', 'kg', 'g'],
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', (c) => {
    expect(getAvailableConvertUnits(c.arg)).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(getAvailableConvertUnits(c.arg)).toStrictEqual(c.expected);
  });
});
