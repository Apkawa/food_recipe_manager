import {IngredientType} from '@app/core/types/recipe';

interface DefinedIngredientType extends IngredientType {
  regexp: RegExp[];
}

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
];
