<script setup lang='ts'>
import {reactive, ref, watch} from 'vue';


import {Ingredient, type Recipe} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';

import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import {recipeToText} from "@repo/food-recipe-core/src/food_recipe/core/export";
import {round} from "@repo/food-recipe-core/src/food_recipe/utils";
import {isNumber} from "@/utils";
import Modal from "@/components/ui/UiModal.vue";
import IngredientLine from './IngredientLine/index.vue';
import {loadState, type RecipeState, saveState} from './state';
import Share from "./RecipeShare.vue";


const LANG = 'ru';

const updateRecipeCb = () => {
  parsedRecipe.value = parseTextRecipe(state.rawRecipe);
  if (parsedRecipe.value.portion) {
    state.scale = Number(parsedRecipe.value.portion)
  }
  updateScaleCb();
};
const updateScaleCb = () => {
  if (parsedRecipe.value) {
    parsedRecipe.value.portion = state.scale
    parsedRecipe.value.calculated_portion = state.newScale
    parsedRecipe.value = recipeScale(parsedRecipe.value, state.newScale / state.scale);
  }
};

// todo move to pinia

const state = reactive<RecipeState>(loadState());
watch(state, () => saveState(state));

const modalShow = ref(false)
watch(() => [state.scale, state.newScale],
    () => {
      if (state.scale < 0.1) {
        state.scale = Number(parsedRecipe.value?.portion || 1);
        console.log("Не балуй")
        modalShow.value = true
      }
      if (state.newScale < 0.1) {
        state.newScale = 1;
        console.log("Не балуй")
        modalShow.value = true
      }
    }
)


const parsedRecipe = ref<Recipe | null>(null);
updateRecipeCb();

watch(() => state.rawRecipe, updateRecipeCb);

watch(state, updateScaleCb);

watch(parsedRecipe, () => {
  // console.debug(parsedRecipe.value)
}, {deep: true})

const ingredientUpdateCb = (ingredient: Ingredient, g_i: number, i: number): void => {
  if (
      isNumber(ingredient.calculated_value) && isNumber(ingredient.value)

  ) {
    const customScale = round(ingredient.calculated_value / ingredient.value, 3)
    if (round(state.newScale / state.scale, 3) != customScale) {
      // x / scale = customScale -> x = scale * customScale
      state.newScale = round(state.scale * customScale, 2)
      updateScaleCb()
    }
  }
  if (parsedRecipe.value) {
    parsedRecipe.value.ingredient_groups[g_i].ingredients[i] = ingredient
  }
  state.rawRecipe = recipeToText(parsedRecipe.value as Recipe)
}
</script>

<template>
  <Modal v-model="modalShow">
    <div style="max-width: 500px;" @click="modalShow = false">
      <img src="@/../public/img/grandpa.jpg" style="width: 100%"/>
      <span style="font-size: 2em; font-weight: bold; top: -100px; position: relative; color: gainsboro">
            Не балуйся
          </span>
    </div>

  </Modal>
  <div>
    <div v-if='parsedRecipe?.ingredient_groups?.length'>
      <div id='parsed_recipe'>
        <h2>{{ parsedRecipe.name }}</h2>

        <table class="recipeTable">
          <colgroup>
            <col span='3' style='width: 100%'>
            <col span='3' style='width: auto'>
            <col span='3' style='width: auto'>
          </colgroup>
          <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
          </thead>
          <template v-for='(group, group_i) in parsedRecipe.ingredient_groups' :key='group_i'>
            <tr v-if='group.name'>
              <th colspan='4'>{{ group.name }}</th>
            </tr>
            <template v-for='(ingredient, i) in group.ingredients' :key='group_i + ":" + i'>
              <IngredientLine
                  :ingredient='ingredient'
                  :lang='LANG'
                  @update:ingredient="ingredientUpdateCb($event, group_i, i)"
              />
            </template>
          </template>

        </table>

        <div class='scale_wrap'>
          <div>
            Рецепт на <input id='scale'
                             v-model.number.lazy='state.scale'
                             type='number'
                             min='1'
          /> порций
          </div>
          <div>
            Пересчитать на
            <input id='new_scale' v-model.number.lazy='state.newScale' type='number' step="1" min='1'/> порций
          </div>
        </div>

      </div>
      <div v-if="parsedRecipe.description">

        <br>
        <h2>Описание:</h2>
        <pre>{{ parsedRecipe.description }}</pre>
      </div>
      <br>

      <Share :recipe="parsedRecipe"/>
    </div>

    <hr>
    <br>
    <div class="rawRecipe-wrap">
      <h3>Текстовый рецепт</h3>
      <div>
        * Вставьте сюда текст скопированного рецепта
      </div>
      <textarea
          v-model.lazy='state.rawRecipe' id='raw_recipe'></textarea>

    </div>
  </div>
</template>

<style scoped>
.scale_wrap {
  font-size: large;
  padding: 0.5em;
}

.scale_wrap > div {
  padding-top: 1em;
}

.scale_wrap input {
  font-size: larger;
  width: 3em;
}

#parsed_recipe table {
  width: 100%;
}

#raw_recipe {
  width: 100%;
  height: 420px
}

.modal {
  position: fixed;
  /*todo запрет скроллинга body.modal-open {overflow-y: hidden }*/
  overflow-y: hidden;
  top: 0;
  left: 0;


  width: 100vw;
  height: 100vh;
  background: rgb(127, 127, 127, 0.4);

  display: flex;
  align-items: center;
  justify-content: center;
}

.modal .modal-content {
  text-align: center;
}
</style>