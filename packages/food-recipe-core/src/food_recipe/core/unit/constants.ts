/** Volume units; convertible among themselves and with measure units. */
// todo US units
export const VOLUME_UNITS = ['l', 'ml', 'US_fl_oz', 'US_gill', 'US_pint', 'US_quart'] as const;
/** Weight units; convertible only among themselves unless density is known. */
// todo US units
export const WEIGHT_UNITS = ['kg', 'g', 'US_ounce', 'US_pound'] as const;
/** Kitchen measures with a fixed milliliter equivalent (see UnitConversions). */
export const MEASURE_UNITS = [
  'tsp', // чайная ложка (tea spoon)
  'tbsp', // столовая ложка (table spoon)
  'cup', // Чашка или стакан
  'shot', // шот или рюмка
  'pinch', // Щепотка, 1/16 tsp
] as const;

/** Count-based units; `portion` marks the recipe servings line during parsing. */
export const COUNT_UNITS = [
  'pcs', // шт, штуки, piece
  'portion', // Special unit for parse portions
];

/** All units that carry a numeric value in an ingredient line. */
export const VALUE_UNITS = [
  ...VOLUME_UNITS,
  ...WEIGHT_UNITS,
  ...MEASURE_UNITS,
  ...COUNT_UNITS,
] as const;

/** Units without a numeric value (e.g. "to taste"). */
export const NO_VALUE_UNITS = [
  'taste',
  // на кончике ножа
  // что то еще
] as const;

/** Every unit supported by the parser and converters. */
export const UNITS = [...VALUE_UNITS, ...NO_VALUE_UNITS] as const;

/** Union of all supported measurement units. */
export type Unit = (typeof UNITS)[number];

/**
 * Conversion factor from each unit to its SI base: ml for volume, g for weight.
 *
 * Used as the normalization step in convertValueUnit.
 */
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
