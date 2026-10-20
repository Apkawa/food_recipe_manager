import { recipeToText } from "@repo/food-recipe-core/src/food_recipe/core/export";
import { parseTextRecipe } from "@repo/food-recipe-core/src/food_recipe/core/parser/text";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

/** Find the table row (display or edit) whose text contains the given fragment. */
function rowContaining(text: string): HTMLTableRowElement {
  const rows = Array.from(document.querySelectorAll("tr"));
  const row = rows.find((r) => (r.textContent ?? "").includes(text));
  expect(row, `row containing "${text}"`).toBeDefined();
  return row as HTMLTableRowElement;
}

function clickRowButton(row: HTMLTableRowElement): void {
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
    expect(screen.getByRole("heading", { name: "Традиционный кимчи" })).toBeDefined();
    expect(screen.getByText("Капуста пекинская")).toBeDefined();
    expect(screen.getByText("2.7")).toBeDefined();
  });

  it("rescales quantities when newScale changes", () => {
    setup();
    const input = document.getElementById("new_scale") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.blur(input);
    expect(screen.getByText("8.1")).toBeDefined();
  });

  it("adopts the 'Рецепт на N порций' line as scale", () => {
    const recipe = parseTextRecipe("Тест\nВода 2 cup");
    recipe.portion = 3;
    setup(recipeToText(recipe));
    expect((document.getElementById("scale") as HTMLInputElement).value).toBe("3");
  });

  it("edits an ingredient value and adjusts newScale", () => {
    setup();
    clickRowButton(rowContaining("Капуста пекинская"));
    const valueInput = document.querySelector<HTMLInputElement>(".edit-value");
    expect(valueInput).not.toBeNull();
    if (!valueInput) return;
    fireEvent.change(valueInput, { target: { value: "5.4" } });
    fireEvent.blur(valueInput);
    fireEvent.click(screen.getByText("Сохранить"));
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
    fireEvent.click(screen.getByText("Сохранить"));
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
    fireEvent.click(screen.getByText("Сохранить"));
    const state = useRecipeStore.getState();
    expect(state.rawRecipe).toContain("45%");
    expect(state.rawRecipe).toContain("200");
    expect(screen.getByText(/Уксус \[45%\]/)).toBeDefined();
    expect(screen.getByText("200")).toBeDefined();
  });

  it("shows the GrandMother modal when scale is cleared", () => {
    setup();
    const input = document.getElementById("scale") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(screen.getByText("Не балуйся")).toBeDefined();
    expect((document.getElementById("scale") as HTMLInputElement).value).toBe("1");
    fireEvent.click(document.querySelector(".modal-overlay") as HTMLElement);
    expect(screen.queryByText("Не балуйся")).toBeNull();
  });
});
