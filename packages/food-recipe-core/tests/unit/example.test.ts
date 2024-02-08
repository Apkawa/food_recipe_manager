import {Cases} from '@tests/unit/types';

describe('foo', () => {
  it('bar', () => {
    expect(1).toStrictEqual(1);
  });
});

describe('cases', () => {
  const cases: Cases<string, string> = [
    {
      arg: '',
      expected: '',
    },
  ];
  it.each(cases)('[$#] $arg -> $expected', (c) => {
    expect(c.arg).toStrictEqual(c.expected);
  });
  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(c.arg).toStrictEqual(c.expected);
  });
});
