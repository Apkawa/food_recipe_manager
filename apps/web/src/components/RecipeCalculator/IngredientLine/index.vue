<script lang="ts">
// declare additional options
export default {
  name: "IngredientLine",
  inheritAttrs: false,
  customOptions: {}
}
</script>

<script setup lang='ts'>
import {ref, toRef} from "vue";

import {Ingredient} from '@repo/food-recipe-core/src/food_recipe/core/types/recipe';
import {getUnitDisplay, LANG_TYPE} from '@repo/food-recipe-core/src/food_recipe/core/i18n';

import {valueDisplay} from '../utils';
import IngredientLineEdit from "./Edit.vue";

interface Props {
  lang: LANG_TYPE,
  ingredient: Ingredient
}

const props = defineProps<Props>()
const ingredient = toRef(props, 'ingredient')
const emit = defineEmits(['update:ingredient'])


const editMode = ref(false)
const allowEdit = ingredient.value.unit && !['taste',].includes(ingredient.value.unit)

const checked = ref(false)

const lineEditSaveCb = ($event: Ingredient) => {
  emit('update:ingredient', $event)
  editMode.value = false;
}
</script>

<template>
  <tr>
    <td :class="checked?'checked':''">
      <label class="name">
        <input class="checkbox" type="checkbox" v-model="checked"/>
        {{ ingredient.name }}

        <template v-if='ingredient?.type?.concentration'>
          [{{ ingredient.type.concentration }}%]
        </template>
      </label>
    </td>
    <td><span class="fraction">{{ valueDisplay(ingredient.calculated_value, ingredient.unit) }}</span></td>
    <td>{{ getUnitDisplay(ingredient.unit, props.lang, ingredient.value) }}</td>
    <td>
      <button v-if="!editMode && allowEdit" @click="editMode = !editMode">Edit</button>
    </td>
  </tr>
  <IngredientLineEdit
      v-if="editMode"
      :ingredient="ingredient"
      @save="lineEditSaveCb"
  />
</template>

<style scoped>
.checked .name {
  text-decoration-line: line-through;
}
.value-display {
  font-size: larger;
}

.fraction {
  font-feature-settings: afrc;
  font-size: 1.5em;
}

@supports (font-variant-numeric: stacked-fractions) {
  .fraction {
    font-feature-settings: afrc;
    font-variant-numeric: stacked-fractions;
  }
}
</style>