import { calculateConcentration } from "@repo/food-recipe-core/src/food_recipe/core/ingredient_type/calculate";
import type { Ingredient } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import type { Unit } from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import { convertIngredientUnit } from "@repo/food-recipe-core/src/food_recipe/core/unit/convert";
import { useState } from "react";
import { cloneDeep, isNumber } from "@/lib/utils";
import UnitSelect from "./UnitSelect";
import { valueDisplay } from "./utils";

interface IngredientLineEditProps {
  ingredient: Ingredient;
  onSave: (ingredient: Ingredient) => void;
}

/** Assign a scalar calculated_value on the draft (the edit UI treats values as scalars). */
function setCalculated(draft: Ingredient, value: number): void {
  (draft as { calculated_value?: number }).calculated_value = value;
}

/**
 * Inline editor row for a single ingredient.
 * Port of apps/web/src/components/RecipeCalculator/IngredientLine/Edit.vue.
 *
 * Deliberate deviations from the Vue source (documented in the status doc):
 * - concentration input keeps a numeric state, so changing it actually
 *   recalculates the values via calculateConcentration (the Vue v-model there
 *   stored strings, which isNumber() rejected — an apparent bug);
 * - no deep watch resetting the draft when the parent re-renders with a new
 *   ingredient object; the draft stays stable while editing.
 */
function IngredientLineEdit({ ingredient, onSave }: IngredientLineEditProps) {
  const [editIngredient, setEditIngredient] = useState<Ingredient>(() => cloneDeep(ingredient));
  const [editConcentration, setEditConcentration] = useState<number | undefined>(
    ingredient.type?.concentration,
  );
  const [editUnit, setEditUnit] = useState<Unit | undefined>(ingredient.unit);
  // Value field text; committed to the draft on blur/Enter (Vue @change semantics).
  const [valueText, setValueText] = useState<string>(() =>
    valueDisplay(ingredient.calculated_value),
  );

  const isEditConcentration = ingredient.type?.concentration;

  /** Port of Vue updateConcentration: recalc draft values for a new concentration. */
  const updateConcentration = (toConcentration: number | undefined) => {
    const fromConcentration = ingredient.type?.concentration;
    let value = ingredient.value as number;
    let calcValue = ingredient.calculated_value as number;
    if (editUnit && ingredient.unit !== editUnit) {
      const converted = convertIngredientUnit(cloneDeep(ingredient), editUnit);
      if (isNumber(converted.value)) {
        value = converted.value as number;
      }
      if (isNumber(converted.calculated_value)) {
        calcValue = converted.calculated_value as number;
      }
    }
    setEditIngredient((prev) => {
      const next = cloneDeep(prev);
      if (isNumber(fromConcentration) && isNumber(toConcentration)) {
        if (isNumber(value)) {
          (next as { value?: number }).value = calculateConcentration(
            value,
            fromConcentration,
            toConcentration,
          );
        }
        if (isNumber(calcValue)) {
          setCalculated(
            next,
            calculateConcentration(calcValue, fromConcentration, toConcentration),
          );
        }
      }
      return next;
    });
  };

  const commitValue = (e: React.FormEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat((e.target as HTMLInputElement).value || "0");
    setEditIngredient((prev) => {
      const next = cloneDeep(prev);
      setCalculated(next, parsed);
      return next;
    });
    setValueText(valueDisplay(parsed));
  };

  const onUnitChange = (unit: Unit) => {
    setEditUnit(unit);
    const next = convertIngredientUnit(cloneDeep(editIngredient), unit);
    setEditIngredient(next);
    setValueText(valueDisplay(next.calculated_value));
  };

  const saveCb = () => {
    const next = cloneDeep(editIngredient);
    if (isEditConcentration && next.type?.concentration) {
      next.type.concentration = editConcentration;
    }
    onSave(next);
  };

  const onFocusSelect = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <tr>
      <td>
        {isEditConcentration ? (
          <>
            Концентрация:{" "}
            <input
              className="concentration"
              aria-label="Концентрация"
              type="number"
              min={1}
              max={100}
              required
              value={editConcentration ?? ""}
              onFocus={onFocusSelect}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setEditConcentration(undefined);
                  return;
                }
                const n = Number(v);
                if (Number.isFinite(n)) {
                  setEditConcentration(n);
                }
              }}
              onBlur={() => updateConcentration(editConcentration)}
            />
          </>
        ) : null}
      </td>
      <td>
        <input
          className="edit-value"
          aria-label="Значение"
          type="number"
          value={valueText}
          onFocus={onFocusSelect}
          onChange={(e) => setValueText(e.target.value)}
          onBlur={commitValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitValue(e);
            }
          }}
        />
      </td>
      <td>
        <UnitSelect ingredient={editIngredient} onChange={onUnitChange} />
      </td>
      <td>
        <button type="button" onClick={saveCb}>
          Сохранить
        </button>
      </td>
    </tr>
  );
}

export default IngredientLineEdit;
