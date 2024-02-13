import {Unit} from '@app/core/unit/constants';

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
  // если единица измерения не указана - по вкусу (taste)
  unit?: Unit;
  type?: IngredientType;
}

export type SimpleIngredient = BaseIngredient & Value;
export type RangeIngredient = BaseIngredient & RangeValue;

export type Ingredient = SimpleIngredient | RangeIngredient;

/**
 *
 * Например, соль, сахар имеют определенную плотность.
 * Можно добавлять свои варианты
 */
export interface IngredientType {
  name: string;
  /**
   *  плотность, г/л или кг/м^3
   *  Чтобы расчитать сколько будет весить литр, например сахара,
   *  нужно объем разделить на плотность
   *  Пример: Сахар, 900г/л. Литр сахара весит: (900г/л / (1л * 1000)) * 1000 = 900 г
   *  Пример2: Сахар, 900г/л. Килограмм сахара займет: ((1кг*1000) / 900г/л) * 1000 = 1111 мл
   */
  density?: number;

  /**
   * Концентрация водного раствора, в процентах.
   */
  concentration?: number;
}
