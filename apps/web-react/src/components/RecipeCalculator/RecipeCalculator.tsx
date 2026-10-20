import { recipeScale } from "@repo/food-recipe-core/src/food_recipe/core/calculator";
import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import { parseTextRecipe } from "@repo/food-recipe-core/src/food_recipe/core/parser/text";
import type { Ingredient } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { round } from "@repo/food-recipe-core/src/food_recipe/utils";
import { useEffect, useMemo, useState } from "react";
import { isNumber } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import GrandMother from "../GrandMother";
import Modal from "../ui/Modal";
import ParsedRecipeTable from "./ParsedRecipeTable";
import RawRecipeEditor from "./RawRecipeEditor";
import RecipeFavoriteButton from "./RecipeFavoriteButton";
import RecipeShare from "./RecipeShare";
import ScaleControls from "./ScaleControls";

const LANG = "ru" as const;

/**
 * Recipe calculator screen.
 * Port of apps/web/src/components/RecipeCalculator/RecipeCalculator.vue:
 * parse the raw text, scale it by newScale/scale, and keep state in the
 * recipe store (persisted + mirrored to the URL).
 */
function RecipeCalculator() {
  const rawRecipe = useRecipeStore((s) => s.rawRecipe);
  const scale = useRecipeStore((s) => s.scale);
  const newScale = useRecipeStore((s) => s.newScale);
  const setRawRecipe = useRecipeStore((s) => s.setRawRecipe);
  const setScale = useRecipeStore((s) => s.setScale);
  const setNewScale = useRecipeStore((s) => s.setNewScale);

  const [modalShow, setModalShow] = useState(false);

  const parsed = useMemo(() => parseTextRecipe(rawRecipe), [rawRecipe]);

  // Port of Vue updateRecipeCb: adopt the "Рецепт на N порций" line as scale.
  useEffect(() => {
    if (parsed.portion) {
      setScale(Number(parsed.portion));
    }
  }, [parsed, setScale]);

  // Port of the Vue guard watcher: scale/newScale below 0.1 are reset and
  // the GrandMother modal is shown.
  useEffect(() => {
    if (scale < 0.1) {
      setScale(Number(parsed.portion || 1));
      console.log("Не балуй");
      setModalShow(true);
    }
    if (newScale < 0.1) {
      setNewScale(1);
      console.log("Не балуй");
      setModalShow(true);
    }
  }, [scale, newScale, parsed.portion, setScale, setNewScale]);

  // Port of Vue updateScaleCb: rescale the base recipe by newScale/scale.
  const scaled = useMemo(() => {
    const clone = structuredClone(parsed);
    clone.portion = scale;
    clone.calculated_portion = newScale;
    const factor = newScale / scale;
    if (!Number.isFinite(factor)) {
      return clone; // guard resets invalid values on the next tick
    }
    return recipeScale(clone, factor);
  }, [parsed, scale, newScale]);

  // Port of Vue ingredientUpdateCb: an edited calculated_value implies a
  // custom ratio, so newScale is adjusted to keep it consistent.
  const onIngredientUpdate = (ingredient: Ingredient, groupIndex: number, i: number) => {
    let nextNewScale = newScale;
    if (isNumber(ingredient.calculated_value) && isNumber(ingredient.value)) {
      const customScale = round(ingredient.calculated_value / ingredient.value, 3);
      if (round(newScale / scale, 3) !== customScale) {
        nextNewScale = round(scale * customScale, 2);
        setNewScale(nextNewScale);
      }
    }
    const updated = structuredClone(parsed);
    updated.portion = scale;
    updated.calculated_portion = nextNewScale;
    updated.ingredient_groups[groupIndex].ingredients[i] = ingredient;
    setRawRecipe(recipeToText(updated));
  };

  return (
    <>
      <Modal
        open={modalShow}
        onClose={() => setModalShow(false)}
        ariaLabel="Внимание — рецепт не рассчитан"
      >
        <GrandMother />
      </Modal>
      {scaled.ingredient_groups.length > 0 ? (
        <>
          <div id="parsed_recipe">
            {parsed.name.trim() ? <h2>{parsed.name}</h2> : null}
            <ParsedRecipeTable
              recipe={scaled}
              lang={LANG}
              onIngredientUpdate={onIngredientUpdate}
            />
            <ScaleControls
              scale={scale}
              newScale={newScale}
              onScaleChange={setScale}
              onNewScaleChange={setNewScale}
            />
          </div>
          {parsed.description ? (
            <div>
              <br />
              <h2>Описание:</h2>
              <pre>{parsed.description}</pre>
            </div>
          ) : null}
          <br />
          <div>
            <RecipeShare recipe={parsed} />
            <RecipeFavoriteButton recipe={parsed} />
          </div>
        </>
      ) : null}
      <hr />
      <br />
      <div className="rawRecipe-wrap">
        <h3>Текстовый рецепт</h3>
        <div>* Вставьте сюда текст скопированного рецепта</div>
        <RawRecipeEditor value={rawRecipe} onChange={setRawRecipe} />
      </div>
    </>
  );
}

export default RecipeCalculator;
