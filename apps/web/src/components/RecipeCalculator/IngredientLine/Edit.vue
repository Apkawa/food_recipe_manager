<script lang="ts">
// declare additional options
export default {
  name: "IngredientLineEdit",
  inheritAttrs: false,
  customOptions: {}
}
</script>
<script setup lang="ts">
import {ref, watch,} from "vue";

import {Ingredient} from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import {calculateConcentration} from "@repo/food-recipe-core/src/food_recipe/core/ingredient_type/calculate";
import {round} from "@repo/food-recipe-core/src/food_recipe/utils";
import {cloneDeep, isNumber} from "@/utils";
import EditUnitSelect from "@/components/RecipeCalculator/IngredientLine/EditUnitSelect.vue";
import {Unit} from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import {convertIngredientUnit} from "@repo/food-recipe-core/src/food_recipe/core/unit/convert";

interface Props {
  ingredient: Ingredient
}

const props = defineProps<Props>()
const ingredient = props.ingredient;
const emit = defineEmits(['save'])
const editIngredient = ref<Ingredient>(cloneDeep(props.ingredient))

const editConcentration = ref<number|undefined>(ingredient.type?.concentration)
const isEditConcentration = ingredient.type?.concentration;

const updateConcentration  = () => {
  const fromConcentration = ingredient.type?.concentration;
  const toConcentration = editConcentration.value;
  const value = props.ingredient.value as number;
  const calc_value = props.ingredient.calculated_value as number;
  if (isNumber(fromConcentration) && isNumber(toConcentration)) {
    if (isNumber(value)) {
      editIngredient.value.value = round(calculateConcentration(value, fromConcentration, toConcentration), 2)
    }

    if (isNumber(calc_value)) {
      editIngredient.value.calculated_value = round(calculateConcentration(calc_value,
          fromConcentration, toConcentration), 2)
    }
  }
}

const saveCb = () => {
  const ingredient = cloneDeep(editIngredient.value)
  if (isEditConcentration && ingredient.type?.concentration) {
    ingredient.type.concentration = editConcentration.value;
  }
  emit('save', ingredient)
}

const unitSelectCb = (unit: Unit) => {
  console.log(unit)
  editIngredient.value = convertIngredientUnit(editIngredient.value, unit)
}

watch(props, () => {
  editIngredient.value = cloneDeep(props.ingredient)
  updateConcentration()
}, {deep: true})
</script>

<template>
  <tr>
    <td>
      <template v-if="isEditConcentration">


      Концентрация: <input class="concentration"
                           type="number"
                           min="1"
                           max="100"
                           required
                           @change="updateConcentration"
                           v-model="editConcentration"/>
      </template>
    </td>
    <td>{{ editIngredient.value }}</td>
    <td>{{ editIngredient.calculated_value }}</td>
    <td>
      <EditUnitSelect
          :ingredient="editIngredient"
          @change="unitSelectCb"
      />
    </td>
    <td><button @click="saveCb">Save</button></td>
  </tr>

</template>

<style scoped>
  .concentration {
    width: 4em;
  }
</style>