import { getUnitDisplay, type LANG_TYPE } from "@repo/food-recipe-core/src/food_recipe/core/i18n";
import type { Ingredient } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { Checkbox, DragHandle, IconButton, PencilIcon, Row } from "@repo/ui";
import { useState } from "react";
import { isNumber } from "@/lib/utils";
import IngredientLineEdit from "./IngredientLineEdit";
import { valueDisplay } from "./utils";

interface IngredientLineProps {
  lang: LANG_TYPE;
  ingredient: Ingredient;
  onUpdate: (ingredient: Ingredient) => void;
}

/**
 * One ingredient row of the parsed recipe list.
 * Port of apps/web/src/components/RecipeCalculator/IngredientLine/index.vue:
 * drag handle, include checkbox, name, and the scaled value. A user-edited
 * (rescaled) amount shows the original struck through next to the new one;
 * the edit controls ({@link IngredientLineEdit}) open inline in the same row.
 */
function IngredientLine({ lang, ingredient, onUpdate }: IngredientLineProps) {
  const [editMode, setEditMode] = useState(false);
  const [checked, setChecked] = useState(false);
  const allowEdit = ingredient.unit && !["taste"].includes(ingredient.unit);

  // "Edited": the scaled value differs from the original base value. User-typed
  // amounts are folded into the scale factor, so the two only match when the
  // rescale factor leaves the amount untouched.
  const isEdited =
    isNumber(ingredient.calculated_value) &&
    isNumber(ingredient.value) &&
    ingredient.calculated_value !== ingredient.value;

  const highlighted = editMode;
  const unitDisplay = getUnitDisplay(ingredient.unit, lang, ingredient.value);

  return (
    <Row highlighted={highlighted}>
      <DragHandle active={highlighted} />
      <Checkbox
        checked={checked}
        onChange={setChecked}
        aria-label={checked ? `Исключить: ${ingredient.name}` : `Включить: ${ingredient.name}`}
      />
      <span
        className={[
          "min-w-0 flex-1 truncate text-sm font-medium",
          checked ? "line-through text-muted2" : "text-text",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {ingredient.name}
        {ingredient.type?.concentration ? ` [${ingredient.type.concentration}%]` : null}
      </span>
      {editMode ? (
        <IngredientLineEdit
          ingredient={ingredient}
          onSave={(updated) => {
            onUpdate(updated);
            setEditMode(false);
          }}
        />
      ) : (
        <>
          {isEdited ? (
            <span className="shrink-0 text-sm tabular-nums">
              <s className="text-xs text-muted2">
                {valueDisplay(ingredient.value, ingredient.unit)}
                {unitDisplay ? ` ${unitDisplay}` : null}
              </s>{" "}
              <span className="font-bold text-accent">
                <span>{valueDisplay(ingredient.calculated_value, ingredient.unit)}</span>
                {unitDisplay ? ` ${unitDisplay}` : null}
              </span>
            </span>
          ) : (
            <span
              className={
                checked
                  ? "shrink-0 text-sm tabular-nums text-muted2"
                  : "shrink-0 text-sm tabular-nums text-text2"
              }
            >
              <span>{valueDisplay(ingredient.calculated_value, ingredient.unit)}</span>
              {unitDisplay ? ` ${unitDisplay}` : null}
            </span>
          )}
          {allowEdit ? (
            <IconButton
              variant="ghost"
              aria-label="Редактировать количество"
              onClick={() => setEditMode(true)}
            >
              <PencilIcon className="h-5 w-5" />
            </IconButton>
          ) : null}
        </>
      )}
    </Row>
  );
}

export default IngredientLine;
