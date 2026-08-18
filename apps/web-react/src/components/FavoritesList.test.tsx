import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { base64ToBytes } from "../lib/state";
import { type RecipeItem, useFavoritesStore } from "../stores/favorites";
import FavoritesList from "./FavoritesList";

const makeFavorite = (name: string): RecipeItem => ({
  name,
  portion: 2,
  calculated_portion: 4,
  ingredient_groups: [{ name: "", ingredients: [{ name: "Вода", value: 100, unit: "ml" }] }],
  created: new Date(),
  updated: new Date(),
});

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

const renderWithRouter = () => {
  const router = createMemoryRouter(
    [
      { path: "/", element: <LocationProbe /> },
      { path: "/favorite", element: <FavoritesList /> },
    ],
    { initialEntries: ["/favorite"] },
  );
  return { router, utils: render(<RouterProvider router={router} />) };
};

describe("FavoritesList", () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.setState({ recipes: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the empty state when there are no favorites", () => {
    renderWithRouter();
    expect(screen.getByText("Пусто, добавьте из каркурлятора")).toBeDefined();
  });

  it("navigates to / with the recipe query on name click", async () => {
    useFavoritesStore.getState().add(makeFavorite("Борщ"));
    const { router } = renderWithRouter();

    fireEvent.click(screen.getByText("Борщ"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });
    const search = new URLSearchParams(router.state.location.search);
    expect(search.get("scale")).toBe("2");
    expect(search.get("newScale")).toBe("4");
    const rawRecipe = base64ToBytes(search.get("rawRecipe") ?? "");
    const expected: Recipe = makeFavorite("Борщ");
    expect(rawRecipe).toBe(recipeToText(expected));
  });

  it("removes a favorite via the X button", () => {
    useFavoritesStore.getState().add(makeFavorite("Борщ"));
    useFavoritesStore.getState().add(makeFavorite("Окрошка"));
    renderWithRouter();

    const removeButtons = screen.getAllByRole("button");
    fireEvent.click(removeButtons[0]);

    expect(useFavoritesStore.getState().recipes.map((r) => r.name)).toEqual(["Окрошка"]);
  });
});
