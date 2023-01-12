import {MEASURE_UNITS, UNITS, VOLUME_UNITS, WEIGHT_UNITS} from '@app/core/constants';

export interface Recipe {
  name: string;
  description?: string;
  ingredient_groups: IngredientGroup[];
}

export interface IngredientGroup {
  name: string;
  ingredients: Ingredient[];
}

interface RangeValue {
  // Если number[] - это значит 1-2 ложки, т.е. диапазон
  value?: number[];
  calculated_value?: number[];
}

interface Value {
  // Если нет, это значит "по вкусу" или еще какое то безразмерное значение
  value?: number;
  calculated_value?: number;
}

export interface BaseIngredient {
  name: string;
  // Какое то уточнение
  note?: string;
  unit?: Unit;
  type?: IngredientType;
}

export type SimpleIngredient = BaseIngredient & Value;
export type RangeIngredient = BaseIngredient & RangeValue;

export type Ingredient = SimpleIngredient | RangeIngredient;

export interface IngredientType {
  // Например, соль, сахар имеют определенную плотность.
  // Можно добавлять свои варианты
  name: string;
  density?: number;
}

export type VolumeUnit = (typeof VOLUME_UNITS)[number];
export type WeightUnit = (typeof WEIGHT_UNITS)[number];
export type MeasureUnit = (typeof MEASURE_UNITS)[number];
export type Unit = (typeof UNITS)[number];
