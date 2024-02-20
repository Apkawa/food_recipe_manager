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
import {cloneDeep, isNumber} from "@/utils";
import EditUnitSelect from "@/components/RecipeCalculator/IngredientLine/EditUnitSelect.vue";
import {Unit} from "@repo/food-recipe-core/src/food_recipe/core/unit/constants";
import {convertIngredientUnit} from "@repo/food-recipe-core/src/food_recipe/core/unit/convert";
import {valueDisplay} from "../utils";

interface Props {
  ingredient: Ingredient
}

const props = defineProps<Props>()
const ingredient = props.ingredient;
const emit = defineEmits(['save'])
const editIngredient = ref<Ingredient>(cloneDeep(props.ingredient))

const editConcentration = ref<number | undefined>(ingredient.type?.concentration)
const isEditConcentration = ingredient.type?.concentration;
const editUnit = ref<Unit | undefined>(ingredient.unit)

const updateConcentration = () => {
  const fromConcentration = ingredient.type?.concentration;
  const toConcentration = editConcentration.value;
  let value = props.ingredient.value as number;
  let calc_value = props.ingredient.calculated_value as number;
  if (editUnit.value && props.ingredient.unit !== editUnit.value) {
    const i =
        convertIngredientUnit(cloneDeep(props.ingredient), editUnit.value)
    if (isNumber(i.value)) {
      value = i.value;
    }
    if (isNumber(i.calculated_value)) {
      calc_value = i.calculated_value
    }
  }
  if (isNumber(fromConcentration) && isNumber(toConcentration)) {
    if (isNumber(value)) {
      editIngredient.value.value = calculateConcentration(value, fromConcentration, toConcentration)
    }

    if (isNumber(calc_value)) {
      editIngredient.value.calculated_value = calculateConcentration(calc_value,
          fromConcentration, toConcentration)
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

const editCalculatedValueCb = ($event: Event) => {
  editIngredient.value.calculated_value = Number.parseFloat(
      ($event.target as HTMLInputElement)?.value || "0")
}

const unitSelectCb = (unit: Unit) => {
  editUnit.value = unit
  editIngredient.value = convertIngredientUnit(editIngredient.value, unit)
}

const onFocusAllSelectCb = (e: Event) => {
  (e.target as HTMLInputElement).select()
}

watch(props, () => {
  editIngredient.value = cloneDeep(props.ingredient)
  editIngredient.value.unit = editUnit.value
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
                             v-model="editConcentration"
                             @change="updateConcentration"
                             @focus="onFocusAllSelectCb"
      />
      </template>
    </td>
    <td>
      <input
          class="edit-value"
          type="number"
          :value="valueDisplay(editIngredient.calculated_value)"
          @change="editCalculatedValueCb"
          @focus="onFocusAllSelectCb"
      /></td>
    <td>
      <EditUnitSelect
          :ingredient="editIngredient"
          @change="unitSelectCb"
      />
    </td>
    <td>
      <button @click="saveCb">Save</button>
    </td>
  </tr>

</template>

<style scoped>
.concentration {
  width: 4em;
}

.edit-value {
  width: 4em;
}
</style>