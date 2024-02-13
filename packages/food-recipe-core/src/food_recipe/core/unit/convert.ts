import {Ingredient} from '../types/recipe';
import {WEIGHT_UNITS, VOLUME_UNITS, MEASURE_UNITS, Unit, UnitConversions} from '../unit/constants';
import {isMeasureUnit, isVolumeUnit, isWeightUnit} from './utils';

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

export interface ConvertValueUnitOption {
  fromUnit: Unit;
  toUnit: Unit;
  density?: number;
}

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
