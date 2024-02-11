<script setup lang='ts'>
import {Ingredient} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';
import {getUnitDisplay, LANG_TYPE} from '@repo/food-recipe-core/src/food_recipe/core/i18n';

import {valueDisplay} from './utils';

interface Props {
  lang: LANG_TYPE,
  ingredient: Ingredient
}

const props = defineProps<Props>();


</script>

<template>
  <tr>
    <th>
      {{ props.ingredient.name }}

      <template v-if='props.ingredient?.type?.concentration'>
        [{{ props.ingredient.type.concentration }}%]
      </template>
    </th>
    <th>{{ valueDisplay(props.ingredient.value) }}</th>
    <th>{{ valueDisplay(props.ingredient.calculated_value) }}</th>
    <th>{{ getUnitDisplay(props.ingredient.unit, props.lang, props.ingredient.value) }}</th>
  </tr>
</template>

<style scoped>

</style>