import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { useEffect, useState } from "react";

import { cloneDeep } from "../../lib/utils";
import Modal from "../ui/Modal";

interface RecipeShareProps {
  recipe: Recipe;
}

/**
 * Copy/Share button + modal with a readonly textarea of the scaled recipe text.
 * Port of apps/web/src/components/RecipeCalculator/RecipeShare.vue — opening the
 * modal bakes `calculated_value` into `value` on a clone (the core mutates in
 * place), serializes via `recipeToText`, copies to the clipboard and, when
 * supported, opens the native share sheet. The inner `.modal-content` div is
 * kept: the Vue template nests it inside UiModal's own `.modal-content`.
 */
function RecipeShare({ recipe }: RecipeShareProps) {
  const [textRecipe, setTextRecipe] = useState("");
  const [showModal, setShowModal] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: parity with the Vue watch(showModal) — recompute only when the modal opens
  useEffect(() => {
    if (!showModal) return;
    const shared = cloneDeep(recipe) as Recipe;
    // TODO parity with the Vue original: make the recipe immutable instead.
    shared.portion = shared.calculated_portion;
    for (const g of shared.ingredient_groups) {
      for (const i of g.ingredients) {
        i.value = i.calculated_value;
      }
    }
    const text = recipeToText(shared);
    setTextRecipe(text);
    const shareData: ShareData = { title: text, text, url: window.location.toString() };
    if (navigator.canShare?.(shareData)) {
      navigator.share(shareData);
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }, [showModal]);

  const writeToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textRecipe);
    }
  };

  const onFocusAllSelectCb = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select();
    writeToClipboard();
  };

  return (
    <>
      <button type="button" onClick={() => setShowModal(true)}>
        Copy/Share
      </button>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="modal-content">
          <textarea readOnly value={textRecipe} onFocus={onFocusAllSelectCb} />
        </div>
      </Modal>
    </>
  );
}

export default RecipeShare;
