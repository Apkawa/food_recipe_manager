import { round } from '@repo/food-recipe-core/src/food_recipe/utils'
import { Unit } from '@repo/food-recipe-core/src/food_recipe/core/unit/constants'
import { numberToVulgar } from '@repo/food-recipe-core/src/food_recipe/utils/vulgar-fractions'

export const VULGAR_UNITS: Unit[] = [
  'cup',
  'tsp', // чайная ложка (tea spoon)
  'tbsp', // столовая ложка (table spoon)
  'cup', // Чашка или стакан
  'shot'
]

export function allowVulgarDisplay(unit: Unit) {
  return VULGAR_UNITS.includes(unit)
}

export function valueDisplay(value?: number | number[], unit?: Unit): string {
  let values: number[] = []
  if (value) {
    if (Array.isArray(value)) {
      values = value.map((_v) => round(_v, 2))
    } else {
      values = [round(value, 2)]
    }
  }
  let valuesDisplay: string[]
  if (unit && allowVulgarDisplay(unit)) {
    valuesDisplay = values.map((v) => numberToVulgar(v))
  } else {
    valuesDisplay = values.map((v) => v.toString())
  }
  return valuesDisplay.join(' - ')
}
