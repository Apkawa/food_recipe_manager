import {Cases} from '@tests/unit/types';
import {Ingredient} from '../../../../src/food_recipe/core/types/recipe';
import {convertIngredientUnit} from '../../../../src/food_recipe/core/unit/convert';
import {Unit} from '../../../../src/food_recipe/core/unit/constants';

describe('convertIngredientUnit', () => {
  const cases: Cases<[Ingredient, Unit], Partial<Ingredient>> = [
    {
      arg: [{name: 'sugar', value: 1, unit: 'l', type: {name: 'sugar', density: 900}}, 'kg'],
      expected: {name: 'sugar', type: {name: 'sugar', density: 900}, value: 0.9, unit: 'kg'},
    },
    {
      arg: [{name: 'sugar', value: 1, unit: 'tbsp', type: {name: 'sugar', density: 900}}, 'tsp'],
      expected: {name: 'sugar', type: {name: 'sugar', density: 900}, value: 3, unit: 'tsp'},
    },
    {
      arg: [{name: 'water', value: 3, unit: 'cup'}, 'ml'],
      expected: {name: 'water', value: 250 * 3, unit: 'ml'},
    },
    {
      arg: [
        {
          name: 'sugar',
          value: 2,
          calculated_value: 8,
          unit: 'tbsp',
          type: {name: 'sugar', density: 900},
        },
        'g',
      ],
      expected: {
        name: 'sugar',
        type: {name: 'sugar', density: 900},
        value: 27,
        calculated_value: 108,
        unit: 'g',
      },
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', (c) => {
    expect(convertIngredientUnit(...c.arg)).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(convertIngredientUnit(...c.arg)).toStrictEqual(c.expected);
  });
});
