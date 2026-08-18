import { getUnitDisplay } from "@repo/food-recipe-core/src/food_recipe/core/i18n";
import type { Ingredient } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import type { Unit } from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import { getAvailableConvertUnits } from "@repo/food-recipe-core/src/food_recipe/core/unit/convert";
import { useMemo } from "react";

interface UnitSelectProps {
  ingredient: Ingredient;
  onChange: (unit: Unit) => void;
}

/**
 * Unit picker for the ingredient edit row.
 * Port of apps/web/src/components/RecipeCalculator/IngredientLine/EditUnitSelect.vue —
 * renders nothing when the ingredient has no convertible units.
 */
function UnitSelect({ ingredient, onChange }: UnitSelectProps) {
  const availableUnits = useMemo(() => {
    const units = getAvailableConvertUnits(ingredient);
    return units.map((u) => ({ unit: u, display: getUnitDisplay(u, "ru", ingredient.value) }));
  }, [ingredient]);

  if (availableUnits.length === 0) {
    return null;
  }

  return (
    <select value={ingredient.unit} onChange={(e) => onChange(e.target.value as Unit)}>
      {availableUnits.map((u) => (
        <option key={u.unit} value={u.unit}>
          {u.display}
        </option>
      ))}
    </select>
  );
}

export default UnitSelect;
