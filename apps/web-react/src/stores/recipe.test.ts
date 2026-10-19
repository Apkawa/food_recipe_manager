import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { EXAMPLE_RECIPE } from "@/components/RecipeCalculator/constants";
import { useRecipeStore } from "./recipe";

describe("useRecipeStore", () => {
  afterEach(() => localStorage.clear());

  beforeEach(() => {
    useRecipeStore.setState({ rawRecipe: EXAMPLE_RECIPE, scale: 1, newScale: 1 });
  });

  it("holds the example recipe and unit scales by default", () => {
    const state = useRecipeStore.getState();
    expect(state.rawRecipe).toBe(EXAMPLE_RECIPE);
    expect(state.scale).toBe(1);
    expect(state.newScale).toBe(1);
  });

  it("setRawRecipe updates the state and the flat localStorage key", () => {
    const text = "Борщ\nВода 2 л";
    useRecipeStore.getState().setRawRecipe(text);
    expect(useRecipeStore.getState().rawRecipe).toBe(text);
    expect(localStorage.getItem("rawRecipe")).toBe(text);
  });

  it("setScale updates the state and the flat localStorage key", () => {
    useRecipeStore.getState().setScale(2.5);
    expect(useRecipeStore.getState().scale).toBe(2.5);
    expect(localStorage.getItem("scale")).toBe("2.5");
  });

  it("setNewScale updates the state and the flat localStorage key", () => {
    useRecipeStore.getState().setNewScale(4);
    expect(useRecipeStore.getState().newScale).toBe(4);
    expect(localStorage.getItem("newScale")).toBe("4");
  });
});
