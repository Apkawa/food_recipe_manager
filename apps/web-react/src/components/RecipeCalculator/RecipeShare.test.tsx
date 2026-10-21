import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import RecipeShare from "./RecipeShare";

const makeScaledRecipe = (): Recipe => ({
  name: "Тест",
  portion: 2,
  calculated_portion: 4,
  ingredient_groups: [
    {
      name: "",
      ingredients: [{ name: "Вода", value: 100, unit: "ml", calculated_value: 200 }],
    },
  ],
});

describe("RecipeShare", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("bakes calculated values into the share text without mutating the original recipe", () => {
    const recipe = makeScaledRecipe();
    render(<RecipeShare recipe={recipe} />);
    fireEvent.click(screen.getByRole("button", { name: "Поделиться" }));

    const textarea = screen.getByRole("textbox", {
      name: "Текст для обмена",
    }) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    if (!textarea) return;
    expect(textarea.value).toContain("Тест");
    // value is replaced by calculated_value (100 → 200) and portion by calculated_portion.
    expect(textarea.value).toContain("200");
    expect(textarea.value).not.toContain("100");
    expect(textarea.value).toContain("Рецепт на 4 порций");

    // The prop object must stay untouched (the core mutates in place, so a clone is used).
    const ingredient = recipe.ingredient_groups[0]?.ingredients[0];
    expect(ingredient?.value).toBe(100);
    expect(recipe.portion).toBe(2);
  });

  it("shows the share heading and copy hint above the textarea", () => {
    render(<RecipeShare recipe={makeScaledRecipe()} />);
    fireEvent.click(screen.getByRole("button", { name: "Поделиться" }));

    expect(screen.getByRole("heading", { name: "Поделиться рецептом" })).not.toBeNull();
    expect(screen.getByText("Ссылка/текст копируется при открытии")).not.toBeNull();
  });

  it("closes on overlay click", () => {
    render(<RecipeShare recipe={makeScaledRecipe()} />);
    fireEvent.click(screen.getByRole("button", { name: "Поделиться" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
