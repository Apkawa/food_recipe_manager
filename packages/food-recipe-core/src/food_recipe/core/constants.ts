export const VOLUME_UNITS = ['l', 'ml'] as const;
export const WEIGHT_UNITS = ['kg', 'g'] as const;
export const MEASURE_UNITS = [
  'tsp', // чайная ложка (tea spoon)
  'tbsp', // столовая ложка (table spoon)
  'cup', // Чашка  или стакан
  'pinch', // Щепотка, 1/16 tsp
  'pcs', // шт, штуки, piece
] as const;

export const VALUE_UNITS = [...VOLUME_UNITS, ...WEIGHT_UNITS, ...MEASURE_UNITS] as const;

export const NO_VALUE_UNITS = [
  'taste',
  // на кончике ножа
  // что то еще
] as const;

export const UNITS = [...VALUE_UNITS, ...NO_VALUE_UNITS] as const;
