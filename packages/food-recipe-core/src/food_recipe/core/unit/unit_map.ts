import {Unit} from './constants';

type UnitMap = {
  [k in Unit]: string[];
};

function buildPluralRe(base: string, plurals: string[]): string {
  let re = `${base}`;
  if (plurals.length <= 0) {
    return re;
  }
  if (plurals.length == 1) {
    re += `${plurals.join('')}?`;
  } else {
    re += `(?:${plurals.join('|')})?`;
  }

  return re;
}

export const UNIT_PARSE_MAP: UnitMap = {
  pcs: ['шт', 'pcs', 'ps', 'зубчик(?:а|ов)?', 'штук(?:а|и)?'],
  // Volume
  l: ['л', 'литр', 'litre', 'l'],
  ml: ['мл', 'миллилитр', 'ml', 'millilitre'],
  // Weight
  kg: ['кг', 'килограмм', 'kg', 'kilogram'],
  g: ['г', 'гр', 'грамм', 'g', 'gram'],
  // Measures
  tsp: ['(?:ч\\.|чайн(?:ая|ые))\\s*?(?:л\\.|ложк[аи])', 'tea\\s*spoons?', 'tsp'],
  tbsp: ['(?:ст?\\.|столов(?:ая|ые))\\s*?(?:л\\.?|ложк[аи])', 'table\\s*spoons?', 'tbsp'],
  cup: ['стакан(?:а|ов)?', 'ст', 'cup'],
  pinch: ['щепотка', 'pinch'],
  // no value unit
  taste: ['по вкусу', 'to taste'],

  shot: ['shots?', buildPluralRe('рюм', ['ка', 'ки', 'ок'])],

  US_ounce: ['ounces?', buildPluralRe('унци', ['я', 'й'])],
  US_pound: ['lb', 'pounds?', buildPluralRe('фунт', ['а', 'ов'])],
  // US
  US_fl_oz: ['oz', 'fl[s.]oz', 'fluid ounces?'],
  US_gill: ['gi', 'gill'],
  US_pint: ['pi', 'pints?', buildPluralRe('пинт', ['а', 'ы'])],
  US_quart: ['qt', 'quarts?', buildPluralRe('кварт', ['а', 'ы'])],
  // Special
  portion: [
    'serves?',
    'dish(?:es)',
    'portions?',
    buildPluralRe('порци', ['я', 'и', 'й']),
    buildPluralRe('блюд', ['о', 'а']),
  ],
};
