import {parseRecipeLine} from '@app/core/parser/text';
import {Ingredient} from '@app/core/types/recipe';
import {Cases} from '@tests/unit/types';



describe('parseRecipeLine', () => {

  const cases: Cases<string, Ingredient> = [
    {arg: '123', expected: {name: ''}},
  ];

  it.each(cases)('[%#] parse $raw', (c) => {
    expect(parseRecipeLine(c.arg)).toStrictEqual(c.expected);
  });

  it.skip("Manual debug case", () => {
    const c = cases[1]
    expect(parseRecipeLine(c.arg)).toStrictEqual(c.expected)
  })
});
