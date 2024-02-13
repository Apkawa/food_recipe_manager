<script setup lang="ts">
import {computed,} from "vue";

import {Ingredient} from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import {Unit} from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import {getAvailableConvertUnits} from "@repo/food-recipe-core/src/food_recipe/core/unit/convert";
import {getUnitDisplay} from "@repo/food-recipe-core/src";

interface Props {
  ingredient: Ingredient
}

const props = defineProps<Props>()
const emit = defineEmits(['change'])

const availableUnits = computed<{ display: string, unit: Unit }[]>(() => {
  const units = getAvailableConvertUnits(props.ingredient)
  return units.map(u => {
    return {unit: u, display: getUnitDisplay(u, 'ru', props.ingredient.value)}
  });
})

const onChangeCb = (e: Event) => {
  emit('change', (e.target as HTMLSelectElement).value as Unit)
}
</script>

<template>
  <select
      v-if="availableUnits.length > 0"
      @change="onChangeCb"
  >

    <option v-for="u in availableUnits"
            :value="u.unit"
            :selected="u.unit === props.ingredient.unit"
            :key="u.unit"
    >{{ u.display }}
    </option>
  </select>

</template>

<style scoped>

</style>