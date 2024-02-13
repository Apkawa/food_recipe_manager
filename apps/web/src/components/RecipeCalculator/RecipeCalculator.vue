<script setup lang='ts'>
import {reactive, ref, watch} from 'vue';


import {Ingredient, type Recipe} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';

import {parseTextRecipe} from '@repo/food-recipe-core/src/food_recipe/core/parser/text';
import {recipeScale} from '@repo/food-recipe-core/src/food_recipe/core/calculator';
import IngredientLine from './IngredientLine/index.vue';
import {loadState, saveState} from './state';
import {type RecipeState} from './state';
import {recipeToText} from "@repo/food-recipe-core/src/food_recipe/core/export";


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

watch(parsedRecipe, () => {
  console.debug(parsedRecipe.value)
}, {deep: true})

const ingredientUpdateCb = (ingredient: Ingredient, g_i: number, i: number): void => {
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
            <input id='new_scale' v-model.number='state.newScale' type='number' min='1'/> порций
          </div>
        </div>

      </div>
    </div>
    <textarea v-model.lazy='state.rawRecipe'  id='raw_recipe'></textarea>
    <pre>
    </pre>
  </div>
</template>

<style scoped>
.scale_wrap {
  font-size: large;
  padding: 2em;
}

.scale_wrap > div {
  padding-top: 1em;
}

.scale_wrap input {
  font-size: larger;
  width: 2em;
}

#raw_recipe {
  width: 100%;
  height: 420px

}
</style>