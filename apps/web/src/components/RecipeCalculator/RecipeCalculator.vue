<script setup lang='ts'>
import {computed, reactive, ref, unref, watch} from 'vue';


import {Ingredient, type Recipe} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';

import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import IngredientLine from './IngredientLine/index.vue';
import {loadState, saveState} from './state';
import {type RecipeState} from './state';
import {recipeToText} from "@repo/food-recipe-core/src/food_recipe/core/export";
import {round} from "@repo/food-recipe-core/src/food_recipe/utils";
import {isNumber} from "@/utils";


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
    parsedRecipe.value = recipeScale(parsedRecipe.value, state.newScale / state.scale);
  }
};

// todo move to pinia

const state = reactive<RecipeState>(loadState());
watch(state, () => saveState(state));

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
            Рецепт на <input id='scale' v-model.number='state.scale' type='number' min='1'/> порций
          </div>
          <div>
            Пересчитать на
            <input id='new_scale' v-model.number='state.newScale' type='number' step="1" min='1'/> порций
          </div>
        </div>

      </div>
    </div>
    <hr>
    <br>
    <div class="rawRecipe-wrap">
      <h3>Текстовый рецепт</h3>
      <div>
        * Вставьте сюда текст скопированного рецепта
      </div>
      <textarea
          v-model.lazy='state.rawRecipe'  id='raw_recipe'></textarea>

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
  width: 2.5em;
}

#parsed_recipe table {
  width: 100%;
}

#raw_recipe {
  width: 100%;
  height: 420px

}
</style>