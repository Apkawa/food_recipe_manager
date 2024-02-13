import {Cases} from '@tests/unit/types';
import {
  calculateConcentration,
  calculateConcentrationDiluting,
  ConcentrationResult,
} from '../../../../src/food_recipe/core/ingredient_type/calculate';

describe('calculateConcentration', () => {
  const cases: Cases<[number, number, number], number> = [
    {
      arg: [250, 9, 70],
      expected: 32.14,
    },
    {
      arg: [20, 70, 4],
      expected: 350,
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', (c) => {
    expect(calculateConcentration(...c.arg)).toBeCloseTo(c.expected, 2);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(calculateConcentration(...c.arg)).toBeCloseTo(c.expected, 2);
  });
});

describe('calculateConcentrationDiluting', () => {
  const cases: Cases<[number, number, number], ConcentrationResult> = [
    {
      arg: [250, 9, 70],
      expected: {value: 32.14, water: 250 - 32.14},
    },
    {
      arg: [20, 70, 4],
      expected: {value: 350, water: 20 - 350},
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', (c) => {
    expect(calculateConcentrationDiluting(...c.arg).water).toBeCloseTo(c.expected.water, 2);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(calculateConcentrationDiluting(...c.arg).water).toBeCloseTo(c.expected.water, 2);
  });
});
