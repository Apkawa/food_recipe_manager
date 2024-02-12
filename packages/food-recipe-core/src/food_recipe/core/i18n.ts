import {Unit} from './types/recipe';

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
    pinch: 'pinch',
    pcs: 'pcs',
    taste: 'taste',
  },
  ru: {
    l: 'л',
    ml: 'мл',
    kg: 'кг',
    g: 'г',
    tsp: 'ч.л.',
    tbsp: 'ст.л.',
    cup: 'стакан',
    pinch: 'щепотка', // TODO plural forms
    pcs: 'штук',
    taste: 'по вкусу',
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
