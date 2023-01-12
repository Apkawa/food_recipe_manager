import {Cases} from '@tests/unit/types';
import {recipeScale} from '@app/core/calculator';
import {Recipe} from '@app/core/types/recipe';

describe('cases', () => {
  const cases: Cases<[Recipe, number], Recipe> = [
    {
      arg: [
        {name: '', ingredient_groups: [{name: '', ingredients: [{name: 'foo', value: 1}]}]},
        2,
      ],
      expected: {
        name: '',
        ingredient_groups: [
          {name: '', ingredients: [{name: 'foo', value: 1, calculated_value: 2}]}],
      },
    },
    {
      arg: [
        {
          name: '', ingredient_groups: [
            {name: 'group1', ingredients: [{name: 'foo', value: 1, calculated_value: 123}]},
            {name: 'group2', ingredients: [{name: 'bar', value: 3}]},
          ],
        },
        0.5,
      ],
      expected: {
        name: '',
        ingredient_groups: [
          {name: 'group1', ingredients: [{name: 'foo', value: 1, calculated_value: 0.5}]},
          {name: 'group2', ingredients: [{name: 'bar', value: 3, calculated_value: 3 * 0.5}]},
        ],
      },
    },
  ];
  it.each(cases)('[$#] $arg -> $expected',
    ({arg: [recipe, scale], expected}) => {
      expect(recipeScale(recipe, scale)).toStrictEqual(expected);
    });
  it('Manual debug case', () => {
    const {arg: [recipe, scale], expected} = cases[cases.length - 1];
    expect(recipeScale(recipe, scale)).toStrictEqual(expected);
  });
});
