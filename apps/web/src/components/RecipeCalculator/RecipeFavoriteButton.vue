<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {Recipe} from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import {cloneDeep} from "@/utils";
import {useRecipeFavoriteListStore} from "@/stores/recipe";

interface Props {
  recipe: Recipe
}
const props = defineProps<Props>()

const recipes = useRecipeFavoriteListStore()
const isFavorited = computed(() => recipes.getIndexByName(props.recipe) !== -1)
const buttonText = computed(() => isFavorited.value ? "Обновить избранное" : "Добавить в избранное")
</script>

<template>
  <button
      @click="recipes.addOrUpdateByName(recipe)">
    {{buttonText}}
  </button>
</template>

<style scoped>

</style>