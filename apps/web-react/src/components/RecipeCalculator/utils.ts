import type { Unit } from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import { round } from "@repo/food-recipe-core/src/food_recipe/utils";
import { numberToVulgar } from "@repo/food-recipe-core/src/food_recipe/utils/vulgar-fractions";

/** Units whose values are rendered with vulgar fraction glyphs (port of apps/web utils). */
export const VULGAR_UNITS: Unit[] = [
  "cup",
  "tsp", // чайная ложка (tea spoon)
  "tbsp", // столовая ложка (table spoon)
  "cup", // Чашка или стакан
  "shot",
];

export function allowVulgarDisplay(unit: Unit) {
  return VULGAR_UNITS.includes(unit);
}

/**
 * Format an ingredient value for display.
 *
 * Ranges are joined with " - "; values of vulgar units are converted to
 * fraction glyphs (e.g. 1.5 cup -> "1½").
 */
export function valueDisplay(value?: number | number[], unit?: Unit): string {
  let values: number[] = [];
  if (value) {
    if (Array.isArray(value)) {
      values = value.map((_v) => round(_v, 2));
    } else {
      values = [round(value, 2)];
    }
  }
  const valuesDisplay: string[] =
    unit && allowVulgarDisplay(unit)
      ? values.map((v) => numberToVulgar(v))
      : values.map((v) => v.toString());
  return valuesDisplay.join(" - ");
}
