<script setup lang='ts'>
import {reactive, ref, watch} from 'vue';


import {type Recipe} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';

import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import IngredientLine from './IngredientLine.vue';
import {loadState, saveState} from './state';
import {type RecipeState} from './state';


const LANG = 'ru';

const updateRecipeCb = () => {
  parsedRecipe.value = parseTextRecipe(state.rawRecipe);
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


watch(state, updateRecipeCb);

watch(state, updateScaleCb);


</script>

<template>
  <div>

    <textarea v-model.lazy='state.rawRecipe' style='width: 500px; height: 500px' id='raw_recipe'></textarea>

    <div id='scale_wrap' v-if='parsedRecipe'>
      Рецепт на <input id='scale' style='width: 30px' v-model.number='state.scale' type='number' min='1' /> порций
      <br />

      Пересчитать на
      <input id='new_scale' style='width: 30px' v-model.number='state.newScale' type='number' min='1' /> порций
    </div>

    <div id='parsed_recipe' v-if='parsedRecipe'>
      <h2>{{ parsedRecipe.name }}</h2>

      <table>
        <colgroup>
          <col span='3' style='width: auto'>
          <col span='3' style='width: 100px'>
          <col span='3' style='width: 100px'>
        </colgroup>
        <thead>
        <tr>
          <th></th>
          <th>Оригинал</th>
          <th>Пересчет</th>
          <th>Единица измерения</th>
        </tr>
        </thead>
        <template v-for='(group, group_i) in parsedRecipe.ingredient_groups' :key='group_i'>
          <tr v-if='group.name'>
            <th colspan='4'>{{ group.name }}</th>
          </tr>
          <template v-for='(ingredient, i) in group.ingredients' :key='group_i + ":" + i'>
            <IngredientLine :ingredient='ingredient' :lang='LANG' />
          </template>
        </template>

      </table>
    </div>
  </div>
</template>

<style scoped>

</style>