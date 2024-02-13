import {IngredientType} from '../types/recipe';

interface DefinedIngredientType extends IngredientType {
  regexp: RegExp[];
}

/**
 *  плотность, г/л или кг/м^3
 *
 *  Пример: Сахар, 900г/л. Литр сахара весит: (900г/л / (1л * 1000)) * 1000 = 900 г
 *  Пример2: Сахар, 900г/л. Килограмм сахара займет: ((1кг*1000) / 900г/л) * 1000 = 1111 мл
 */
export const DEFINED_INGREDIENT_TYPES: DefinedIngredientType[] = [
  {
    name: 'sugar',
    density: 900,
    regexp: [/сахар/gm, /sugar/],
  },
  {
    name: 'kosher salt',
    density: 1030,
    regexp: [/сол[ьи]/gm, /поварен(?:ой|ая) сол[ьи]/gm, /kosher salt/gm],
  },
  {
    name: 'table salt',
    density: 1300,
    regexp: [/мелк(?:ой|ая) сол[ьи]/gm, /table salt/gm],
  },
  {
    name: 'vinegar acid',
    concentration: 70,
    regexp: [/уксусная (?:кислота|эссенция)/gm, /vinegar (?:acid|essence)/gm],
  },
  {
    name: 'vinegar',
    concentration: 9,
    regexp: [/уксусa?/m, /vinegar/m],
  },
];
