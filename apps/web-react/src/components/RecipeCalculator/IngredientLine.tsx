import { getUnitDisplay, type LANG_TYPE } from "@repo/food-recipe-core/src/food_recipe/core/i18n";
import type { Ingredient } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { useState } from "react";
import IngredientLineEdit from "./IngredientLineEdit";
import { valueDisplay } from "./utils";

interface IngredientLineProps {
  lang: LANG_TYPE;
  ingredient: Ingredient;
  onUpdate: (ingredient: Ingredient) => void;
}

/**
 * One ingredient row of the parsed recipe table.
 * Port of apps/web/src/components/RecipeCalculator/IngredientLine/index.vue —
 * the display row stays visible while the edit row is open below it.
 */
function IngredientLine({ lang, ingredient, onUpdate }: IngredientLineProps) {
  const [editMode, setEditMode] = useState(false);
  const [checked, setChecked] = useState(false);
  const allowEdit = ingredient.unit && !["taste"].includes(ingredient.unit);

  return (
    <>
      <tr>
        <td className={checked ? "checked" : ""}>
          <label className="name">
            <input
              className="checkbox"
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />{" "}
            {ingredient.name}
            {ingredient.type?.concentration ? ` [${ingredient.type.concentration}%]` : null}
          </label>
        </td>
        <td>
          <span className="fraction">
            {valueDisplay(ingredient.calculated_value, ingredient.unit)}
          </span>
        </td>
        <td>{getUnitDisplay(ingredient.unit, lang, ingredient.value)}</td>
        <td>
          {!editMode && allowEdit ? (
            <button type="button" onClick={() => setEditMode((m) => !m)}>
              Edit
            </button>
          ) : null}
        </td>
      </tr>
      {editMode ? (
        <IngredientLineEdit
          ingredient={ingredient}
          onSave={(updated) => {
            onUpdate(updated);
            setEditMode(false);
          }}
        />
      ) : null}
    </>
  );
}

export default IngredientLine;
