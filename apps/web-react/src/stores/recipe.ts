import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import {
  loadState,
  RECIPE_STATE_KEYS,
  type RecipeState,
  readUrlQuery,
  saveStateToUrl,
} from "@/lib/state";
import { router } from "@/router";

export interface RecipeStore extends RecipeState {
  setRawRecipe: (rawRecipe: string) => void;
  setScale: (scale: number) => void;
  setNewScale: (newScale: number) => void;
}

/**
 * Zustand persist storage writing the state as three flat localStorage keys
 * ('rawRecipe', 'scale', 'newScale') — the exact format of the Vue app.
 *
 * getItem returns null on purpose: initial values are resolved once by loadState()
 * with URL > localStorage > defaults priority; rehydration would override URL values.
 */
const flatStorage: StateStorage = {
  getItem: () => null,
  setItem: (_key, value) => {
    const parsed = JSON.parse(value) as { state?: Partial<Record<keyof RecipeState, unknown>> };
    RECIPE_STATE_KEYS.forEach((key) => {
      const v = parsed.state?.[key];
      if (v) {
        localStorage.setItem(key, String(v));
      }
    });
  },
  removeItem: () => {
    for (const key of RECIPE_STATE_KEYS) {
      localStorage.removeItem(key);
    }
  },
};

/** Mirror the state into the URL query via router replace (no new history entry). */
function syncUrlToRouter(state: RecipeState): void {
  const url = saveStateToUrl(new URL(window.location.href), state);
  // Clear a pre-hash search (leftover from Vue-era URLs) like the Vue saveState does.
  if (window.location.search) {
    window.history.replaceState("", "", url.pathname + url.hash);
  }
  router.navigate({ pathname: "/", search: `?${url.searchParams.toString()}` }, { replace: true });
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      ...loadState(readUrlQuery()),
      setRawRecipe: (rawRecipe) => {
        set({ rawRecipe });
        syncUrlToRouter(get());
      },
      setScale: (scale) => {
        set({ scale });
        syncUrlToRouter(get());
      },
      setNewScale: (newScale) => {
        set({ newScale });
        syncUrlToRouter(get());
      },
    }),
    { name: "recipe-state", storage: createJSONStorage(() => flatStorage) },
  ),
);
