import { defineStore } from 'pinia'

import { Recipe } from '@repo/food-recipe-core/src/food_recipe/core/types/recipe'
import { useStorage } from '@vueuse/core'

export interface RecipeItem extends Recipe {
  created: Date
  updated: Date
}

export type RecipeList = RecipeItem[]

export const recipeListStoreFactory = (store_key: string) => {
  return defineStore(store_key, () => {
    const recipes = useStorage<RecipeList>(store_key, [])

    const add = (recipe: Recipe) => {
      const dt = new Date()
      recipes.value.push({ ...recipe, created: dt, updated: dt })
    }
    const getIndexByName = (recipe: Recipe | RecipeItem) => {
      return recipes.value.findIndex((r) => r.name == recipe.name)
    }
    const addOrUpdateByName = (recipe: Recipe) => {
      const i = getIndexByName(recipe)
      if (i > 0) {
        updateByIndex(recipe, i)
      } else {
        add(recipe)
      }
    }
    const remove = (recipe: RecipeItem) => {
      const i = recipes.value.findIndex((r) => r == recipe)
      removeByIndex(i)
    }
    const removeByIndex = (index: number) => {
      recipes.value.splice(index, 1)
    }

    const update = (recipe: RecipeItem) => {
      const i = recipes.value.findIndex((r) => r == recipe)
      updateByIndex(recipe, i)
    }
    const updateByIndex = (recipe: Recipe | RecipeItem, index: number) => {
      recipes.value[index] = {
        ...recipes.value[index],
        ...recipe,
        updated: new Date()
      }
    }

    const updateByName = (recipe: Recipe | RecipeItem) => {
      const i = getIndexByName(recipe)
      updateByIndex(recipe, i)
    }

    return {
      // Store
      recipes,
      // Actions
      getIndexByName,
      add,
      addOrUpdateByName,
      remove,
      removeByIndex,
      update,
      updateByIndex,
      updateByName
    }
  })
}

export const useRecipeFavoriteListStore = recipeListStoreFactory('recipe-favorite')
