import {Unit} from '@app/core/types/recipe';

type Unit_map = {
  [k in Unit]: string[];
};

export const UNIT_MAP: Unit_map = {
  pcs: ['шт', 'pcs', 'ps'],
  // Volume
  l: ['л', 'литр', 'litre', 'l'],
  ml: ['мл', 'миллилитр', 'ml', 'millilitre'],
  // Weight
  kg: ['кг', 'килограмм', 'kg', 'kilogram'],
  g: ['г', 'гр', 'грамм', 'g', 'gram'],
  // Measures
  tsp: ['(?:ч\\.|чайн(?:ая|ые))\\s*?(?:л\\.|ложк[аи])', 'tea\\s*spoons?', 'tsp'],
  tbsp: ['(?:ст?\\.|столов(?:ая|ые))\\s*?(?:л\\.|ложк[аи])', 'table\\s*spoons?', 'tbsp'],
  cup: ['стакан(?:а|ов)', 'ст', 'cup'],
  pinch: ['щепотка', 'pinch'],
  // no value unit
  taste: ['по вкусу', 'to taste'],
};
