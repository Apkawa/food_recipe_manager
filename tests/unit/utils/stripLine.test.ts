import {Cases} from '@tests/unit/types';
import {stripLine} from '@app/utils';

describe('stripLine', () => {
  const cases: Cases<string, string> = [
    {
      arg: ' --- foo    bar   123 ---', expected: 'foo bar 123',
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', c => {
    expect(stripLine(c.arg)).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(stripLine(c.arg)).toStrictEqual(c.expected);
  });
});
