import {parseTextRecipe} from '@app/core/parser/text';


describe('parseTextRecipe', () => {
  it('generic', () => {
    const t = `Яйцо перепелиное – 6 шт.
Масло растительное – 150 мл
Соль - 0,5 ч.л.`;
    expect(parseTextRecipe(t)).toStrictEqual({

        'ingredient_groups': [
          {
            'ingredients': [
              {
                'name': 'Яйцо перепелиное',
                'unit': 'pcs',
                'value': 6,
              },
              {
                'name': 'Масло растительное',
                'unit': 'ml',
                'value': 150,
              },
              {
                'name': 'Соль',
                'unit': 'tsp',
                'value': 0.5,
              },
            ],
            'name': '',
          },
        ],
        'name': '',
      },
    );
  });
  it('with name and groups', () => {
    const t = `
    Картофельные дольки с чесноком⁠⁠
    
Ингредиенты:
🥔 Картофель - 1 кг
🧄 Чеснок – ½ головки
🌶 Красный перец – 1-2 чайные ложки
🧈 Растительное масло – 3 столовые ложки
`;
    expect(parseTextRecipe(t)).toStrictEqual({
      'ingredient_groups': [
        {
          'ingredients': [
            {
              'name': 'Картофель',
              'unit': 'kg',
              'value': 1,
            },
            {
              'name': 'Чеснок – головки',
              'unit': 'pcs',
              'value': 0.5,
            },
            {
              'name': 'Красный перец',
              'unit': 'tsp',
              'value': [
                1,
                2,
              ],
            },
            {
              'name': 'Растительное масло',
              'unit': 'tbsp',
              'value': 3,
            },
          ],
          'name': 'Ингредиенты',
        },
      ],
      'name': 'Картофельные дольки с чесноком',
    });
  });

});
