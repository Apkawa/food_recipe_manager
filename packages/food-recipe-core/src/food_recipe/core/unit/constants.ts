// todo US units
export const VOLUME_UNITS = ['l', 'ml'] as const;
// todo US units
export const WEIGHT_UNITS = ['kg', 'g'] as const;
export const MEASURE_UNITS = [
  'tsp', // чайная ложка (tea spoon)
  'tbsp', // столовая ложка (table spoon)
  'cup', // Чашка или стакан
  'pinch', // Щепотка, 1/16 tsp
] as const;

export const COUNT_UNITS = [
  'pcs', // шт, штуки, piece
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
  l: 1000,
  ml: 1, // Базовая единица для объем
  cup: 250,
  pinch: 5 / 16,
  tbsp: 15,
  tsp: 5,
};
