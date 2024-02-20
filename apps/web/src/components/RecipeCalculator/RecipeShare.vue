<script setup lang="ts">

import {ref, watch} from "vue";
import Modal from "@/components/ui/UiModal.vue";
import {Recipe} from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import {recipeToText} from "@repo/food-recipe-core/src/food_recipe/core/export";
import {cloneDeep} from "@/utils";

interface Props {
  recipe: Recipe
}

const props = defineProps<Props>()
const textRecipe = ref<string>("")
const showModal = ref(false)


const onFocusAllSelectCb = (e: Event) => {
  (e.target as HTMLInputElement).select()
}

watch(showModal,
    () => {
      if (showModal.value == true) {
        const recipe = cloneDeep(props.recipe) as Recipe
        // TODO Костыль, надо рецепт сделать иммутабельным
        recipe.portion = recipe.calculated_portion
        for (const g of recipe.ingredient_groups) {
          for (const i of g.ingredients) {
            i.value = i.calculated_value;
          }
        }
        console.log(recipe)
        textRecipe.value = recipeToText(recipe)
        const shareData: ShareData = {
          title: textRecipe.value,
          text: textRecipe.value,
          url: window.location.toString()
        }
        if (navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData)
        }

      }
    }
)
</script>

<template>
  <button @click="showModal = true">Share</button>
  <Modal v-model="showModal">
    <div class="modal-content">

      <textarea
          :value="textRecipe"
          readonly
          @focus="onFocusAllSelectCb"
      />

    </div>
  </Modal>
</template>

<style scoped>
.modal-content textarea {
  width: 100%;
  height: 50vh;
}
</style>