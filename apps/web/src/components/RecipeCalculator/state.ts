import { EXAMPLE_RECIPE } from './constants'
import { round } from '@repo/food-recipe-core/src/food_recipe/utils'
import router from '@/router'
import { useRoute } from 'vue-router'

export interface RecipeState {
  rawRecipe: string
  scale: number
  newScale: number
}

const RecipeStateDefaults: RecipeState = {
  rawRecipe: EXAMPLE_RECIPE,
  scale: 1,
  newScale: 1
}

const RECIPE_STATE_KEYS = Object.keys(RecipeStateDefaults) as (keyof RecipeState)[]

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export function base64ToBytes(base64: string): string {
  const binString = atob(base64)
  // @ts-ignore
  const buffer = Uint8Array.from(binString, (m) => m.codePointAt(0))
  return new TextDecoder().decode(buffer)
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export function bytesToBase64(bytes: string): string {
  const binString = String.fromCodePoint(...new TextEncoder().encode(bytes))
  return btoa(binString)
}

const removeUndefinedValuesFromObject = <T extends object>(obj: T): T => {
  // @ts-ignore
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key])
  return obj
}

type PartialRecipeState = Record<keyof RecipeState, string | undefined>

export function loadStateFromQuery(query: Record<string, string>): PartialRecipeState {
  const obj = Object.fromEntries(RECIPE_STATE_KEYS.map((key) => [key, query[key] || undefined]))
  if (obj['rawRecipe']) {
    obj.rawRecipe = base64ToBytes(obj.rawRecipe)
  }
  return obj as PartialRecipeState
}

export function loadStateFromLocalStorage(): PartialRecipeState {
  return Object.fromEntries(
    RECIPE_STATE_KEYS.map((key) => [key, localStorage.getItem(key) || undefined])
  ) as PartialRecipeState
}

export function loadState(): RecipeState {
  let urlState = {}
  if (window.location.search) {
    // Backward compatibly
    const query = Object.fromEntries(new URL(window.location.toString()).searchParams)
    urlState = removeUndefinedValuesFromObject(loadStateFromQuery(query))
  }
  if (!urlState || !Object.entries(urlState).length) {
    const route = useRoute()
    const query = Object.fromEntries(Object.entries(route.query))
    urlState = removeUndefinedValuesFromObject(loadStateFromQuery(query as Record<string, string>))
  }
  console.log(urlState)
  const storageState = removeUndefinedValuesFromObject(loadStateFromLocalStorage())

  const state = { ...RecipeStateDefaults, ...storageState, ...urlState }

  const recipeState: RecipeState = {
    rawRecipe: state.rawRecipe || RecipeStateDefaults.rawRecipe,
    scale: round(Number.parseFloat((state.scale || RecipeStateDefaults.scale).toString()), 2),
    newScale: round(
      Number.parseFloat((state.newScale || RecipeStateDefaults.newScale).toString()),
      2
    )
  }
  return recipeState
}

export function saveStateToUrl(url: URL, state: RecipeState): URL {
  const _url = new URL(url.toString())
  RECIPE_STATE_KEYS.map((key) => {
    let v = state[key]
    if (v) {
      if (key == 'rawRecipe') {
        v = bytesToBase64(v.toString())
      } else {
        v = v.toString()
      }
      _url.searchParams.set(key, v)
    }
  })
  return _url
}

export function saveStateLocalStorage(state: RecipeState): void {
  RECIPE_STATE_KEYS.map((key) => {
    const v = state[key]
    if (v) {
      localStorage.setItem(key, v.toString())
    }
  })
}

export function saveState(state: RecipeState): void {
  const url = saveStateToUrl(new URL(window.location.toString()), state)
  const query = Object.fromEntries(url.searchParams)
  // backward compatibly
  url.search = ''
  window.history.replaceState('', '', url.toString())
  router.replace({ path: '/', query })
  console.log(query)
  saveStateLocalStorage(state)
}
