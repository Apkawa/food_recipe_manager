import {Ingredient} from '@app/core/types/recipe';
import {
  WEIGHT_UNITS,
  VOLUME_UNITS,
  MEASURE_UNITS,
  Unit,
  UnitConversions,
} from '@app/core/unit/constants';
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
  // Нормализация до г и мл
  let valueSi = value * UnitConversions[fromUnit];
  // Конвертация по плотности если возможно
  if (ingredient.type?.density) {
    const unitCompare = [isWeightUnit(fromUnit), isWeightUnit(toUnit)];
    /**
     *  Пример: Сахар, 900г/л. Литр сахара весит: (900г/л / (1л * 1000)) * 1000 = 900 г
     *  Пример2: Сахар, 900г/л. Килограмм сахара займет: ((1кг*1000) / 900г/л) * 1000 = 1111 мл
     */
    if (unitCompare[0] != unitCompare[1]) {
      if (unitCompare[0] && !unitCompare[1]) {
        // Из веса в объем
        valueSi = (valueSi / ingredient.type.density) * 1000;
      }
      if (!unitCompare[0] && unitCompare[1]) {
        // Из объема в вес
        valueSi = (ingredient.type.density / valueSi) * 1000;
      }
    }
  }
  ingredient.value = valueSi / UnitConversions[toUnit];
  ingredient.unit = toUnit;
  return ingredient;
}
