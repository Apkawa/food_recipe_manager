import {Ingredient} from '@app/core/types/recipe';
import {Cases} from '@tests/unit/types';
import {parseRecipeLine} from '@app/core/parser/recipe_line';
import {stripLine} from '@app/utils';

describe('stripLine', () => {
  const cases: Cases<string, string> = [
    {arg: '-- -- foo bar- --  ', expected: 'foo bar'},
    {arg: 'Тушёнка мясная — ', expected: 'Тушёнка мясная'},
  ];
  it.each(cases)('[$#] $arg', (c) => {
    expect(stripLine(c.arg)).toStrictEqual(c.expected);
  });
});

describe('parseRecipeLine', () => {
  const cases: Cases<string, Ingredient> = [
    {
      arg: 'Тушёнка мясная (у меня говяжья) — 500 г',
      expected: {
        'name': 'Тушёнка мясная (у меня говяжья',
        'unit': 'g',
        'value': 500,
      },
    },
    {
      arg: 'Томатный соус — 1.5кг', expected: {
        'name': 'Томатный соус',
        'unit': 'kg',
        'value': 1.5,
      },
    },
    {
      arg: 'Мука — 1 ч. ложка', expected: {
        'name': 'Мука',
        'unit': 'tsp',
        'value': 1,
      },
    },
    {
      arg: 'Соль - 0,5 ч.л.', expected: {
        'name': 'Соль',
        'unit': 'tsp',
        'value': 0.5,
      },
    },
    {
      arg: 'Яйцо перепелиное – 6 шт.', expected: {
        'name': 'Яйцо перепелиное',
        'unit': 'pcs',
        'value': 6,
      },
    },
    {
      arg: 'Соль по вкусу', expected: {'name': 'Соль', 'unit': 'taste'},
    },
    {
      arg: 'bla bla foo bar', expected: null,
    },
    {
      arg: 'Сок 0,5 лимона', expected: {name: 'Сок лимона', unit: 'pcs', value: 0.5},
    },
    {
      arg: '🧄 Чеснок – ½ головки', expected: {
        name: 'Чеснок – головки', unit: 'pcs', value: 0.5,
      },
    },
    {
      arg: '🌶 Красный перец – 1-2 чайные ложки', expected: {
        name: 'Красный перец', unit: 'tsp', value: [1, 2],
      },
    },
    {
      arg: 'Вино – 1/4 - ½ стакана', expected: {
        name: 'Вино', unit: 'cup', value: [1/4, 1/2],
      },
    },
  ];

  it.each(cases)('[$#] parse $arg', (c) => {
    expect(parseRecipeLine(c.arg)).toStrictEqual(c.expected);
  });

  it('Manual debug case', () => {
    const c = cases[cases.length - 1];
    expect(parseRecipeLine(c.arg)).toStrictEqual(c.expected);
  });

});
