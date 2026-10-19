import { Unit } from "../unit/constants";

/**
 * Represents a complete recipe with name, optional portions, description, and ingredient groups.
 *
 * @property portion - Original portion count as specified in the recipe.
 * @property calculated_portion - Scaled portion after recipeScale operations.
 */
export interface Recipe {
  name: string;
  portion?: number;
  calculated_portion?: number;
  description?: string;
  ingredient_groups: IngredientGroup[];
}

/**
 * Represents a logical grouping of ingredients within a recipe, e.g.
 * "For the dough" or "For the filling".
 *
 * @property name - Group label or description.
 * @property ingredients - Ingredients that belong to this group.
 */
export interface IngredientGroup {
  name: string;
  ingredients: Ingredient[];
}

/**
 * Value fields for range ingredients; arrays hold the min/max bounds
 * (e.g. "1-2 spoons").
 */
interface RangeValue {
  value?: number[];
  calculated_value?: number[];
}

/**
 * Value fields for simple ingredients; a missing value means "to taste" or
 * another dimensionless amount.
 */
interface Value {
  value?: number;
  calculated_value?: number;
}

/**
 * Base type for all ingredients with common properties.
 *
 * @property name - Ingredient name.
 * @property note - Optional clarification text.
 * @property unit - Measurement unit; defaults to "taste" if not specified.
 * @property type - Optional ingredient type for density/concentration calculations.
 */
export interface BaseIngredient {
  name: string;
  note?: string;
  unit?: Unit;
  type?: IngredientType;
}

/**
 * Standard ingredient with a single numeric value (as opposed to a range).
 *
 * Combines BaseIngredient properties with optional value and calculated_value fields.
 *
 * @property value - Single numeric quantity.
 * @property calculated_value - Scaled quantity after recipeScale operations.
 */
export type SimpleIngredient = BaseIngredient & Value;

/**
 * Ingredient with a numeric range instead of a single value (e.g., "1-2 spoons").
 *
 * Combines BaseIngredient properties with range value fields where arrays represent
 * minimum and maximum values.
 *
 * @property value - Array with min and max quantities.
 * @property calculated_value - Scaled range after recipeScale operations.
 */
export type RangeIngredient = BaseIngredient & RangeValue;

/**
 * Union type representing any ingredient — either a single-value ingredient or a range.
 *
 * Used as the primary type for ingredient lists throughout the recipe model.
 *
 * @see SimpleIngredient - Ingredient with a single numeric value.
 * @see RangeIngredient - Ingredient with a min/max range (e.g., "1-2 spoons").
 */
export type Ingredient = SimpleIngredient | RangeIngredient;

/**
 * Defines known ingredient types with physical properties for calculation support.
 *
 * @property name - Type identifier (e.g., "salt", "sugar").
 * @property density - Density in g/l, used for volume-to-weight conversions.
 * @property concentration - Percentage of active ingredient in solutions (e.g., vinegar).
 * Custom types can be added to extend supported ingredient calculations.
 */
export interface IngredientType {
  name: string;
  density?: number;
  concentration?: number;
}
