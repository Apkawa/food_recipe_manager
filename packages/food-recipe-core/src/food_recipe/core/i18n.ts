import type { Unit } from "./unit/constants";
/**
 * Supported language codes for localization.
 */
export const LANG_LIST = ["ru", "en"] as const;

/**
 * Language type used throughout the library for localized output.
 */
export type LANG_TYPE = (typeof LANG_LIST)[number];

/**
 * Maps language codes to unit labels for all supported units.
 * Used by getUnitDisplay for localized ingredient output.
 */
export type UNIT_TRANSLATIONS = {
  [lang in LANG_TYPE]: {
    [unit in Unit]: string;
  };
};

/**
 * Translation table of unit labels keyed by language and unit.
 */
export const UNIT_TRANSLATIONS: UNIT_TRANSLATIONS = {
  en: {
    l: "l",
    ml: "ml",
    kg: "kg",
    g: "g",
    tsp: "tsp",
    tbsp: "tbsp",
    cup: "cup",
    shot: "shot",
    pinch: "pinch",
    pcs: "pcs",
    taste: "taste",
    US_ounce: "ounce",
    US_pound: "pound",
    // US
    US_fl_oz: "oz",
    US_gill: "gi",
    US_pint: "pint",
    US_quart: "quart",
  },
  ru: {
    l: "л",
    ml: "мл",
    kg: "кг",
    g: "г",
    tsp: "ч.л.",
    tbsp: "ст.л.",
    cup: "стакан",
    shot: "рюмка",
    pinch: "щепотка", // TODO plural forms
    pcs: "штук",
    taste: "по вкусу",

    US_ounce: "унция",
    US_pound: "фунт",
    // US
    US_fl_oz: "oz",
    US_gill: "gi",
    US_pint: "пинта",
    US_quart: "кварта",
  },
};

/**
 * Returns a localized display string for a unit.
 *
 * @param unit - The unit to display; if null/undefined, returns "to taste" label.
 * @param lang - Target language code.
 * @param value - Currently unused; kept for potential future pluralization support.
 * @returns Localized unit label.
 */
export function getUnitDisplay(
  unit: Unit | null | undefined,
  lang: LANG_TYPE,
  value: number | number[] | undefined = undefined,
): string {
  return UNIT_TRANSLATIONS[lang][unit || "taste"];
}
