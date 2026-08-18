import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useFavoritesStore } from "../../stores/favorites";
import RecipeFavoriteButton from "./RecipeFavoriteButton";

const makeRecipe = (name: string): Recipe => ({
  name,
  portion: 2,
  ingredient_groups: [{ name: "", ingredients: [{ name: "Вода", value: 1 }] }],
});

describe("RecipeFavoriteButton", () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.setState({ recipes: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("adds the recipe to favorites and switches the label", () => {
    const recipe = makeRecipe("Борщ");
    render(<RecipeFavoriteButton recipe={recipe} />);

    expect(screen.getByText("Добавить в избранное")).toBeDefined();
    fireEvent.click(screen.getByRole("button"));

    expect(useFavoritesStore.getState().recipes).toHaveLength(1);
    expect(screen.getByText("Обновить избранное")).toBeDefined();
  });

  it("updates the existing favorite in place (no duplicate)", () => {
    const recipe = makeRecipe("Борщ");
    useFavoritesStore.getState().add(recipe);
    render(<RecipeFavoriteButton recipe={recipe} />);

    fireEvent.click(screen.getByText("Обновить избранное"));

    expect(useFavoritesStore.getState().recipes).toHaveLength(1);
  });
});
