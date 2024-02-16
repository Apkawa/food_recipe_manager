// todo US units
export const VOLUME_UNITS = ['l', 'ml', 'US_fl_oz', 'US_gill', 'US_pint', 'US_quart'] as const;
// todo US units
export const WEIGHT_UNITS = ['kg', 'g', 'US_ounce', 'US_pound'] as const;
export const MEASURE_UNITS = [
  'tsp', // чайная ложка (tea spoon)
  'tbsp', // столовая ложка (table spoon)
  'cup', // Чашка или стакан
  'shot', // шот или рюмка
  'pinch', // Щепотка, 1/16 tsp
] as const;

export const COUNT_UNITS = [
  'pcs', // шт, штуки, piece
  'portion', // Special unit for parse portions
];

export const VALUE_UNITS = [
  ...VOLUME_UNITS,
  ...WEIGHT_UNITS,
  ...MEASURE_UNITS,
  ...COUNT_UNITS,
] as const;

export const NO_VALUE_UNITS = [
  'taste',
  // на кончике ножа
  // что то еще
] as const;

export const UNITS = [...VALUE_UNITS, ...NO_VALUE_UNITS] as const;

export type Unit = (typeof UNITS)[number];

// Объем в мл, вес в грамм
export const UnitConversions: Record<Unit, number> = {
  g: 1, // Базовая единица для веса
  kg: 1000,
  // US
  US_ounce: 28.34,
  US_pound: 453.59,

  l: 1000,
  ml: 1, // Базовая единица для объем
  cup: 250,
  tbsp: 15,
  tsp: 5,
  shot: 44,
  // US
  US_fl_oz: 28.41,
  US_gill: 118.29,
  US_pint: 473.18,
  US_quart: 946.36,

  pinch: 5 / 16,
};
