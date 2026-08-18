import { round } from "@repo/food-recipe-core/src/food_recipe/utils";

import { EXAMPLE_RECIPE } from "@/components/RecipeCalculator/constants";

export interface RecipeState {
  rawRecipe: string;
  scale: number;
  newScale: number;
}

const RecipeStateDefaults: RecipeState = {
  rawRecipe: EXAMPLE_RECIPE,
  scale: 1,
  newScale: 1,
};

export const RECIPE_STATE_KEYS = Object.keys(RecipeStateDefaults) as (keyof RecipeState)[];

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export function base64ToBytes(base64: string): string {
  const binString = atob(base64);
  const buffer = Uint8Array.from(binString, (m) => m.codePointAt(0) ?? 0);
  return new TextDecoder().decode(buffer);
}

// From https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.
export function bytesToBase64(bytes: string): string {
  const binString = String.fromCodePoint(...new TextEncoder().encode(bytes));
  return btoa(binString);
}

const removeUndefinedValuesFromObject = <T extends object>(obj: T): T => {
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] === undefined) delete obj[key];
  }
  return obj;
};

export type PartialRecipeState = Record<keyof RecipeState, string | undefined>;

/** Extract the recipe state fields from a URL query, decoding rawRecipe from base64. */
export function loadStateFromQuery(query: Record<string, string | undefined>): PartialRecipeState {
  const obj = Object.fromEntries(RECIPE_STATE_KEYS.map((key) => [key, query[key] || undefined]));
  if (obj.rawRecipe) {
    obj.rawRecipe = base64ToBytes(obj.rawRecipe);
  }
  return obj as PartialRecipeState;
}

/** Read the recipe state fields from localStorage flat keys. */
export function loadStateFromLocalStorage(): PartialRecipeState {
  return Object.fromEntries(
    RECIPE_STATE_KEYS.map((key) => [key, localStorage.getItem(key) || undefined]),
  ) as PartialRecipeState;
}

/**
 * Load the recipe state with priority: URL query > localStorage > defaults.
 *
 * @param urlQuery - parsed query string (e.g. from react-router location); empty for none.
 */
export function loadState(urlQuery: Record<string, string | undefined> = {}): RecipeState {
  const urlState = removeUndefinedValuesFromObject(loadStateFromQuery(urlQuery));
  const storageState = removeUndefinedValuesFromObject(loadStateFromLocalStorage());

  const state = { ...RecipeStateDefaults, ...storageState, ...urlState };

  return {
    rawRecipe: state.rawRecipe || RecipeStateDefaults.rawRecipe,
    scale: round(Number.parseFloat((state.scale || RecipeStateDefaults.scale).toString()), 2),
    newScale: round(
      Number.parseFloat((state.newScale || RecipeStateDefaults.newScale).toString()),
      2,
    ),
  };
}

/** Return a copy of `url` with the state fields written into its query string. */
export function saveStateToUrl(url: URL, state: RecipeState): URL {
  const _url = new URL(url.toString());
  RECIPE_STATE_KEYS.forEach((key) => {
    let v = state[key];
    if (v) {
      if (key === "rawRecipe") {
        v = bytesToBase64(v.toString());
      } else {
        v = v.toString();
      }
      _url.searchParams.set(key, v);
    }
  });
  return _url;
}

/** Write the state into localStorage flat keys (plain strings — Vue format). */
export function saveStateLocalStorage(state: RecipeState): void {
  RECIPE_STATE_KEYS.forEach((key) => {
    const v = state[key];
    if (v) {
      localStorage.setItem(key, v.toString());
    }
  });
}

/**
 * Read the current query string from window.location.
 *
 * Checks the hash fragment first (`#/?a=b` — createHashRouter format) and falls
 * back to the classic `?a=b` search for backward compatibility with Vue-app URLs.
 */
export function readUrlQuery(): Record<string, string | undefined> {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf("?");
  if (queryIndex !== -1) {
    return Object.fromEntries(new URLSearchParams(hash.slice(queryIndex + 1)));
  }
  if (window.location.search) {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }
  return {};
}
