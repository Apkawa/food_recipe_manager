export interface Recipe {
  name: string;
  description: string;
  ingredient_groups: IngredientGroup[];
}

export interface IngredientGroup {
  name: string;
  ingredients: Ingredient[];
}

export interface Ingredient {
  name: string;
  // Если нет, это значит "по вкусу"
  value?: number;
  unit?: Unit;
  type?: IngredientType;
}

export interface IngredientType {
  // Например, соль, сахар имеют определенную плотность.
  // Можно добавлять свои варианты
  name: string;
  density?: number;
}

export type VolumeUnit = 'l' | 'ml';
export type WeightUnit = 'kg' | 'g';
export type MeasureUnit =
  | 'tsp' // чайная ложка (tea spoon)
  | 'tbsp' // столовая ложка (table spoon)
  | 'cup' // Чашка  или стакан
  | 'pinch' // Щепотка, 1/16 tsp
  | 'pcs'; // шт, штуки, piece
export type Unit = VolumeUnit | WeightUnit | MeasureUnit;
