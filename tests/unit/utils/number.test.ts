import {Cases} from '@tests/unit/types';
import {parseNumber} from '@app/utils/number';


describe('parseNumber', () => {
  const cases: Cases<string, number> = [
    {arg: '1', expected: 1},
    {arg: '1.5', expected: 1.5},
    {arg: '0,5', expected: 0.5},
    {arg: '.5', expected: .5},
    {arg: '½', expected: 1/2},
    {arg: '1/2', expected: 1/2},
    {arg: '1 / 2', expected: 1/2},
  ];
  it.each(cases)('[$#] $arg -> $expected', c => {
    expect(parseNumber(c.arg)).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length-1];
    expect(parseNumber(c.arg)).toStrictEqual(c.expected);
  });
});
