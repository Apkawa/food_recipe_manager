import {Ingredient} from '@app/core/types/recipe';
import {Cases} from '@tests/unit/types';
import {calculateScale} from '@app/core/calculator';

describe('calculateScale', () => {
  const cases: Cases<Ingredient, number | null> = [
    {arg: {name: '', value: 1, calculated_value: 2}, expected: 2},
    {arg: {name: '', value: 2, calculated_value: 1}, expected: 0.5},
    {arg: {name: '', value: [1 - 2], calculated_value: [2 - 4]}, expected: 2},
    {arg: {name: '', value: [2 - 4], calculated_value: [1 - 2]}, expected: 0.5},
    {arg: {name: ''}, expected: null},
  ];
  it.each(cases)('[$#] $arg -> $expected', (c) => {
    expect(calculateScale(c.arg)).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(calculateScale(c.arg)).toStrictEqual(c.expected);
  });
});
