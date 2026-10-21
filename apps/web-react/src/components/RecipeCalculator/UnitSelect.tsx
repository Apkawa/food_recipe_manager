import { getUnitDisplay } from "@repo/food-recipe-core/src/food_recipe/core/i18n";
import type { Ingredient } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import type { Unit } from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import { getAvailableConvertUnits } from "@repo/food-recipe-core/src/food_recipe/core/unit/convert";
import { Select } from "@repo/ui";
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
    <Select
      aria-label="Единица измерения"
      value={ingredient.unit ?? ""}
      onChange={(value) => onChange(value as Unit)}
      className="shrink-0"
    >
      {availableUnits.map((u) => (
        <option key={u.unit} value={u.unit}>
          {u.display}
        </option>
      ))}
    </Select>
  );
}

export default UnitSelect;
