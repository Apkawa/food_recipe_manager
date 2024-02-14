import {Unit} from './unit/constants';
export const LANG_LIST = ['ru', 'en'] as const;
export type LANG_TYPE = (typeof LANG_LIST)[number];

export type UNIT_TRANSLATIONS = {
  [lang in LANG_TYPE]: {
    [unit in Unit]: string;
  };
};

export const UNIT_TRANSLATIONS: UNIT_TRANSLATIONS = {
  en: {
    l: 'l',
    ml: 'ml',
    kg: 'kg',
    g: 'g',
    tsp: 'tsp',
    tbsp: 'tbsp',
    cup: 'cup',
    shot: 'shot',
    pinch: 'pinch',
    pcs: 'pcs',
    taste: 'taste',
    US_ounce: 'ounce',
    US_pound: 'pound',
    // US
    US_fl_oz: 'oz',
    US_gill: 'gi',
    US_pint: 'pint',
    US_quart: 'quart',
  },
  ru: {
    l: 'л',
    ml: 'мл',
    kg: 'кг',
    g: 'г',
    tsp: 'ч.л.',
    tbsp: 'ст.л.',
    cup: 'стакан',
    shot: 'рюмка',
    pinch: 'щепотка', // TODO plural forms
    pcs: 'штук',
    taste: 'по вкусу',

    US_ounce: 'унция',
    US_pound: 'фунт',
    // US
    US_fl_oz: 'oz',
    US_gill: 'gi',
    US_pint: 'пинта',
    US_quart: 'кварта',
  },
};

export function getUnitDisplay(
  unit: Unit | null | undefined,
  lang: LANG_TYPE,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  value: number | number[] | undefined = undefined,
): string {
  return UNIT_TRANSLATIONS[lang][unit || 'taste'];
}
