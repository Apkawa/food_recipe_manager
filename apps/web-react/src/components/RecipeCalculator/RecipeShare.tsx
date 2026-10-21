import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { IconButton, Modal, ShareIcon } from "@repo/ui";
import { useEffect, useState } from "react";

import { cloneDeep } from "../../lib/utils";

interface RecipeShareProps {
  recipe: Recipe;
}

/**
 * Copy/Share button + modal with a readonly textarea of the scaled recipe text.
 * Port of apps/web/src/components/RecipeCalculator/RecipeShare.vue — opening the
 * modal bakes `calculated_value` into `value` on a clone (the core mutates in
 * place), serializes via `recipeToText`, copies to the clipboard and, when
 * supported, opens the native share sheet.
 */
function RecipeShare({ recipe }: RecipeShareProps) {
  const [textRecipe, setTextRecipe] = useState("");
  const [showModal, setShowModal] = useState(false);

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
      <IconButton type="button" aria-label="Поделиться" onClick={() => setShowModal(true)}>
        <ShareIcon className="h-5 w-5" />
      </IconButton>
      <Modal open={showModal} onClose={() => setShowModal(false)} ariaLabel="Поделиться рецептом">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
          Поделиться рецептом
        </h2>
        <p className="pt-1 text-xs text-muted">Ссылка/текст копируется при открытии</p>
        <textarea
          readOnly
          aria-label="Текст для обмена"
          className="mt-3 h-[50vh] w-full rounded-md border border-border bg-input p-2 font-mono text-sm text-text"
          value={textRecipe}
          onFocus={onFocusAllSelectCb}
        />
      </Modal>
    </>
  );
}

export default RecipeShare;
