import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

/** A favorite recipe with bookkeeping dates (parity with the Vue Pinia store). */
export interface RecipeItem extends Recipe {
  created: Date;
  updated: Date;
}

export type RecipeList = RecipeItem[];

interface FavoritesStore {
  recipes: RecipeList;
  add: (recipe: Recipe) => void;
  getIndexByName: (recipe: Recipe | RecipeItem) => number;
  addOrUpdateByName: (recipe: Recipe) => void;
  removeByIndex: (index: number) => void;
  updateByName: (recipe: Recipe | RecipeItem) => void;
}

const FAVORITES_KEY = "recipe-favorite";

/**
 * Persist storage keeping localStorage['recipe-favorite'] as a plain JSON array —
 * the exact format of the Vue useStorage('recipe-favorite') store.
 */
const favoritesStorage: StateStorage = {
  getItem: (key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const recipes = JSON.parse(raw) as RecipeList;
      return JSON.stringify({ state: { recipes }, version: 0 });
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    const parsed = JSON.parse(value) as { state?: { recipes?: RecipeList } };
    localStorage.setItem(key, JSON.stringify(parsed.state?.recipes ?? []));
  },
  removeItem: (key) => localStorage.removeItem(key),
};

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => {
      const add = (recipe: Recipe): void => {
        const dt = new Date();
        set({ recipes: [...get().recipes, { ...recipe, created: dt, updated: dt }] });
      };
      const getIndexByName = (recipe: Recipe | RecipeItem): number =>
        get().recipes.findIndex((r) => r.name === recipe.name);
      const updateByIndex = (recipe: Recipe | RecipeItem, index: number): void => {
        set({
          recipes: get().recipes.map((r, i) =>
            i === index ? { ...r, ...recipe, updated: new Date() } : r,
          ),
        });
      };
      return {
        recipes: [],
        add,
        getIndexByName,
        addOrUpdateByName: (recipe: Recipe): void => {
          const i = getIndexByName(recipe);
          // Vue parity note: the Vue store used `if (i > 0)`, an off-by-one that
          // added a duplicate when the match was at index 0. Fixed to `i >= 0`.
          if (i >= 0) {
            updateByIndex(recipe, i);
          } else {
            add(recipe);
          }
        },
        removeByIndex: (index: number): void => {
          set({ recipes: get().recipes.filter((_, i) => i !== index) });
        },
        updateByName: (recipe: Recipe | RecipeItem): void => {
          const i = getIndexByName(recipe);
          if (i >= 0) {
            updateByIndex(recipe, i);
          }
        },
      };
    },
    { name: FAVORITES_KEY, storage: createJSONStorage(() => favoritesStorage) },
  ),
);
