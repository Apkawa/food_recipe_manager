import { round } from '@repo/food-recipe-core/src/food_recipe/utils'

export function valueDisplay(value?: number | number[]): string {
  let v = ''
  if (value) {
    if (Array.isArray(value)) {
      v = value.map((_v) => round(_v, 2)).join(' - ')
    } else {
      v = round(value, 2).toString()
    }
  }
  return v
}
