<script setup lang="ts">
import {RecipeItem, useRecipeFavoriteListStore} from "@/stores/recipe";
import {recipeToText} from "@repo/food-recipe-core/src/food_recipe/core/export";
import {bytesToBase64} from "@/components/RecipeCalculator/state";
import {useRouter} from "vue-router";

const recipes = useRecipeFavoriteListStore()


const router = useRouter()
const onClickRecipe = (recipe: RecipeItem) => {
  const textRecipe = recipeToText(recipe)
  router.push({
    path: '/',
    query: {
      rawRecipe: bytesToBase64(textRecipe),
      scale: recipe.portion,
      newScale: recipe.calculated_portion,
    }
  })
}

</script>

<template>
  <h1>Избранные рецепты</h1>
  <table class="table">
    <template v-if="recipes.recipes.length">

    <tr v-for="(recipe, i) in recipes.recipes" :key="recipe.name"
    >
      <td><a @click="onClickRecipe(recipe)">{{ recipe.name }}</a></td>
      <td><button class="remove-item" @click="recipes.removeByIndex(i)">X</button></td>
    </tr>
    </template>
    <template v-else>
      <tr>
        <td>Пусто, добавьте из каркурлятора</td>
      </tr>
    </template>
  </table>

</template>

<style scoped>

.table {
  width: 100%;
}

</style>