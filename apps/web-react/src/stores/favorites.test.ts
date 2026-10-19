import type { Recipe } from "@repo/food-recipe-core/src/food_recipe/core/types/recipe";
import { beforeEach, describe, expect, it } from "vitest";

import { useFavoritesStore } from "./favorites";

const makeRecipe = (name: string): Recipe => ({
  name,
  portion: 2,
  ingredient_groups: [{ name: "Основа", ingredients: [{ name: "Вода", value: 1 }] }],
});

describe("useFavoritesStore", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ recipes: [] });
  });

  it("add appends a recipe with created/updated dates", () => {
    useFavoritesStore.getState().add(makeRecipe("Борщ"));
    const [item] = useFavoritesStore.getState().recipes;
    expect(item?.name).toBe("Борщ");
    expect(item?.created instanceof Date).toBe(true);
    expect(item?.updated instanceof Date).toBe(true);
  });

  it("getIndexByName finds the recipe or returns -1", () => {
    const { add, getIndexByName } = useFavoritesStore.getState();
    add(makeRecipe("Борщ"));
    add(makeRecipe("Окрошка"));
    expect(getIndexByName(makeRecipe("Окрошка"))).toBe(1);
    expect(getIndexByName(makeRecipe("Нет"))).toBe(-1);
  });

  it("addOrUpdateByName updates the recipe at index 0 (Vue off-by-one fix)", () => {
    const store = useFavoritesStore.getState();
    store.add(makeRecipe("Борщ"));
    store.addOrUpdateByName({ ...makeRecipe("Борщ"), portion: 4 });
    const recipes = useFavoritesStore.getState().recipes;
    expect(recipes).toHaveLength(1);
    expect(recipes[0]?.portion).toBe(4);
  });

  it("addOrUpdateByName adds a new recipe when the name is unknown", () => {
    const store = useFavoritesStore.getState();
    store.add(makeRecipe("Борщ"));
    store.addOrUpdateByName(makeRecipe("Окрошка"));
    expect(useFavoritesStore.getState().recipes).toHaveLength(2);
  });

  it("removeByIndex removes the recipe at the given index", () => {
    const store = useFavoritesStore.getState();
    store.add(makeRecipe("Борщ"));
    store.add(makeRecipe("Окрошка"));
    store.removeByIndex(0);
    expect(useFavoritesStore.getState().recipes.map((r) => r.name)).toEqual(["Окрошка"]);
  });

  it("updateByName merges fields and keeps the original created date", () => {
    const store = useFavoritesStore.getState();
    store.add(makeRecipe("Борщ"));
    const createdBefore = useFavoritesStore.getState().recipes[0]?.created;
    store.updateByName({ ...makeRecipe("Борщ"), description: "свежий" });
    const [item] = useFavoritesStore.getState().recipes;
    expect(item?.description).toBe("свежий");
    expect(item?.created).toBe(createdBefore);
  });

  it("persists recipes as a plain JSON array under 'recipe-favorite'", () => {
    useFavoritesStore.getState().add(makeRecipe("Борщ"));
    const raw = localStorage.getItem("recipe-favorite");
    expect(raw).toBeTruthy();
    const parsed: unknown = JSON.parse(raw ?? "[]");
    expect(Array.isArray(parsed)).toBe(true);
    expect((parsed as Array<{ name?: string }>)[0]?.name).toBe("Борщ");
  });
});
