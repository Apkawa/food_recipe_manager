import {Ingredient} from '../types/recipe';
import {WEIGHT_UNITS, VOLUME_UNITS, MEASURE_UNITS, Unit, UnitConversions} from '../unit/constants';
import {isMeasureUnit, isVolumeUnit, isWeightUnit} from './utils';

/**
 * List all units an ingredient can currently be converted to.
 *
 * Volume and measure units convert freely; weight units only among themselves,
 * unless the ingredient type provides a density, which unlocks volume-to-weight
 * conversion in both directions.
 *
 * @param ingredient - Ingredient whose `unit` (and optional density) decides the set.
 * @returns Target units available for conversion; empty for "to taste".
 */
export function getAvailableConvertUnits(ingredient: Ingredient): Unit[] {
  const units: Unit[] = [];
  const fromUnit = ingredient.unit as Unit;
  if (!fromUnit) {
    // по-вкусу
    return [];
  }
  const isVolume = isVolumeUnit(fromUnit);
  const isMeasure = isMeasureUnit(fromUnit);
  const isWeight = isWeightUnit(fromUnit);
  // Объемные напрямую конвертируются в чашки и ложки
  if (isVolume) {
    units.push(...VOLUME_UNITS, ...MEASURE_UNITS);
  }
  // Чашки и ложки - это объемные единицы
  if (isMeasure) {
    units.push(...MEASURE_UNITS, ...VOLUME_UNITS);
  }
  if (isWeight) {
    units.push(...WEIGHT_UNITS);
  }

  if (ingredient.type?.density) {
    if (isVolume || isMeasure) {
      units.push(...WEIGHT_UNITS);
    }
    if (isWeight) {
      units.push(...VOLUME_UNITS, ...MEASURE_UNITS);
    }
  }
  return units;
}

/**
 * Options describing a single value conversion between two units.
 *
 * @property fromUnit - Unit of the input value.
 * @property toUnit - Desired target unit.
 * @property density - Density in g/l; required for volume-to-weight conversions.
 */
export interface ConvertValueUnitOption {
  fromUnit: Unit;
  toUnit: Unit;
  density?: number;
}

/**
 * Convert a numeric value between units by normalizing to the SI base (ml/g).
 *
 * When `density` is provided and the source and target differ in kind
 * (volume vs weight), the conversion goes through mass using g/l.
 *
 * @param value - Quantity expressed in `options.fromUnit`.
 * @param options - Source unit, target unit and optional density.
 * @returns The quantity expressed in `options.toUnit` (not rounded).
 */
export function convertValueUnit(value: number, options: ConvertValueUnitOption) {
  const fromUnit = options.fromUnit;
  const toUnit = options.toUnit;
  // Нормализация до г и мл
  let valueSi = value * UnitConversions[fromUnit];
  // Конвертация по плотности если возможно
  if (options.density) {
    const unitCompare = [isWeightUnit(fromUnit), isWeightUnit(toUnit)];
    /**
     *  Пример: Сахар, 900г/л. 250мл сахара весит:
     *  900г -> 1000мл
     *  х    -> 250мл   => (900г * 250мл) / 1000мл
     *  Пример2: Сахар, 900г/л. 250г сахара займет:
     *  900г -> 1000мл
     *  250г -> x       => (250мл * 1000мл) / 900г
     */
    if (unitCompare[0] != unitCompare[1]) {
      if (unitCompare[0] && !unitCompare[1]) {
        // Из веса в объем
        valueSi = (valueSi * 1000) / options.density;
      }
      if (!unitCompare[0] && unitCompare[1]) {
        // Из объема в вес
        valueSi = (options.density * valueSi) / 1000;
      }
    }
  }
  return valueSi / UnitConversions[toUnit];
}

/**
 * Convert an ingredient's unit to another supported unit, in-place.
 *
 * Both `value` and `calculated_value` are converted when present. Returns the
 * ingredient unchanged when it has no numeric value or the target unit is not
 * available for its current unit (see getAvailableConvertUnits).
 *
 * @param ingredient - Ingredient to convert; mutated in-place.
 * @param toUnit - Desired target unit.
 * @returns The same ingredient object, with `unit` switched when applied.
 */
export function convertIngredientUnit(ingredient: Ingredient, toUnit: Unit): Ingredient {
  const fromUnit = ingredient.unit;
  const value = ingredient.value;
  if (!fromUnit || typeof value !== 'number') {
    return ingredient;
  }
  const availableUnits = getAvailableConvertUnits(ingredient);

  if (!availableUnits.includes(toUnit)) {
    return ingredient;
  }
  ingredient.value = convertValueUnit(value, {fromUnit, toUnit, density: ingredient.type?.density});
  if (ingredient.calculated_value && typeof ingredient.calculated_value == 'number') {
    ingredient.calculated_value = convertValueUnit(ingredient.calculated_value, {
      fromUnit,
      toUnit,
      density: ingredient.type?.density,
    });
  }
  ingredient.unit = toUnit;
  return ingredient;
}
