import {IngredientType} from '../types/recipe';

interface DefinedIngredientType extends IngredientType {
  regexp: RegExp[];
}

/**
 * Built-in ingredient types with known physical properties used for unit
 * conversion and concentration math.
 *
 * Density is expressed in g/l (e.g. sugar 900 g/l, table salt 1300 g/l);
 * concentration is the percent of active substance (vinegar essence 70%).
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
