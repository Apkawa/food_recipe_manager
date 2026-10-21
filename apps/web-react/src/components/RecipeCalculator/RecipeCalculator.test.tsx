import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import { parseTextRecipe } from "@repo/food-recipe-core/src/food_recipe/core/parser/text";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useRecipeStore } from "@/stores/recipe";
import { EXAMPLE_RECIPE } from "./constants";
import RecipeCalculator from "./RecipeCalculator";

/** Seed the store (Vue-compatible state) and render the calculator. */
function setup(rawRecipe: string = EXAMPLE_RECIPE, scale = 1, newScale = 1) {
  localStorage.clear();
  useRecipeStore.setState({ rawRecipe, scale, newScale });
  render(<RecipeCalculator />);
}

/** Find the ingredient row (li of the recipe list) whose text contains the given fragment. */
function rowContaining(text: string): HTMLLIElement {
  const rows = Array.from(document.querySelectorAll("li"));
  const row = rows.find((r) => (r.textContent ?? "").includes(text));
  expect(row, `row containing "${text}"`).toBeDefined();
  return row as HTMLLIElement;
}

function clickRowButton(row: HTMLLIElement): void {
  fireEvent.click(row.querySelector("button") as HTMLButtonElement);
}

// Vitest globals are disabled, so Testing Library cannot register its
// automatic cleanup; unmount previous renders between tests explicitly.
afterEach(() => {
  cleanup();
});

describe("RecipeCalculator", () => {
  it("renders the example recipe with base quantities", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Калькулятор" })).toBeDefined();
    expect(screen.getByText("Традиционный кимчи")).toBeDefined();
    expect(screen.getByText("Капуста пекинская")).toBeDefined();
    expect(screen.getByText("2.7")).toBeDefined();
  });

  it("rescales quantities when newScale changes", () => {
    setup();
    // The portion stepper replaces the old #new_scale input: step 1 → 3.
    const increment = screen.getByRole("button", { name: "Больше порций" });
    fireEvent.click(increment);
    fireEvent.click(increment);
    expect(screen.getByText("8.1")).toBeDefined();
  });

  it("adopts the 'Рецепт на N порций' line as scale", () => {
    const recipe = parseTextRecipe("Тест\nВода 2 cup");
    recipe.portion = 3;
    setup(recipeToText(recipe));
    // The scale is no longer an input; assert the adopted store state.
    expect(useRecipeStore.getState().scale).toBe(3);
  });

  it("edits an ingredient value and adjusts newScale", () => {
    setup();
    clickRowButton(rowContaining("Капуста пекинская"));
    const valueInput = document.querySelector<HTMLInputElement>(".edit-value");
    expect(valueInput).not.toBeNull();
    if (!valueInput) return;
    fireEvent.change(valueInput, { target: { value: "5.4" } });
    fireEvent.blur(valueInput);
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    const state = useRecipeStore.getState();
    expect(state.newScale).toBe(2);
    expect(state.rawRecipe).toContain("2,7");
    expect(screen.getByText("5.4")).toBeDefined();
  });

  it("changes an ingredient unit and saves", () => {
    setup();
    clickRowButton(rowContaining("Вода"));
    const select = document.querySelector<HTMLSelectElement>("select");
    expect(select).not.toBeNull();
    if (!select) return;
    fireEvent.change(select, { target: { value: "ml" } });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    const state = useRecipeStore.getState();
    expect(state.rawRecipe).toContain("мл");
    expect(screen.getByText("500")).toBeDefined();
  });

  it("recalculates values when concentration changes", () => {
    setup("Тест уксуса\nУксус 90% 100 мл");
    expect(screen.getByText(/Уксус \[90%\]/)).toBeDefined();
    clickRowButton(rowContaining("Уксус"));
    const concInput = document.querySelector<HTMLInputElement>(".concentration");
    expect(concInput).not.toBeNull();
    if (!concInput) return;
    expect(concInput.value).toBe("90");
    fireEvent.change(concInput, { target: { value: "45" } });
    fireEvent.blur(concInput);
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    const state = useRecipeStore.getState();
    expect(state.rawRecipe).toContain("45%");
    expect(state.rawRecipe).toContain("200");
    expect(screen.getByText(/Уксус \[45%\]/)).toBeDefined();
    expect(screen.getByText("200")).toBeDefined();
  });

  it("shows the GrandMother modal when scale is cleared", () => {
    setup();
    // The old #scale input is gone; clear the scale the same way an emptied
    // field used to commit it (0 → below the 0.1 guard threshold).
    act(() => {
      useRecipeStore.setState({ scale: 0 });
    });
    expect(screen.getByText("Не балуйся")).toBeDefined();
    expect(useRecipeStore.getState().scale).toBe(1);
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByText("Не балуйся")).toBeNull();
  });
});
