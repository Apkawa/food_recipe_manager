import { afterEach, describe, expect, it } from "vitest";

import { EXAMPLE_RECIPE } from "@/components/RecipeCalculator/constants";
import {
  base64ToBytes,
  bytesToBase64,
  loadState,
  loadStateFromQuery,
  RECIPE_STATE_KEYS,
  readUrlQuery,
  saveStateLocalStorage,
  saveStateToUrl,
} from "./state";

describe("base64 unicode helpers", () => {
  it("round-trips Cyrillic text with the MDN pattern", () => {
    const text = "Традиционный кимчи — выход 3.6 кг 🌶";
    expect(base64ToBytes(bytesToBase64(text))).toBe(text);
  });
});

describe("loadStateFromQuery", () => {
  it("decodes rawRecipe from base64 and passes the rest through", () => {
    const query = { rawRecipe: bytesToBase64("Борщ 2 л"), scale: "1.5", newScale: "3" };
    expect(loadStateFromQuery(query)).toEqual({
      rawRecipe: "Борщ 2 л",
      scale: "1.5",
      newScale: "3",
    });
  });

  it("drops missing keys instead of keeping undefined", () => {
    expect(loadStateFromQuery({})).toEqual({});
  });
});

describe("loadState priority: URL > localStorage > defaults", () => {
  afterEach(() => localStorage.clear());

  it("prefers URL values over localStorage ones", () => {
    localStorage.setItem("rawRecipe", "Из хранилища");
    localStorage.setItem("scale", "2");
    const state = loadState({ rawRecipe: bytesToBase64("Из URL") });
    expect(state.rawRecipe).toBe("Из URL");
    expect(state.scale).toBe(2);
    expect(state.newScale).toBe(1);
  });

  it("falls back to localStorage, then defaults", () => {
    localStorage.setItem("newScale", "5");
    const state = loadState({});
    expect(state.rawRecipe).toBe(EXAMPLE_RECIPE);
    expect(state.scale).toBe(1);
    expect(state.newScale).toBe(5);
  });

  it("parses and rounds scale values to 2 digits", () => {
    const state = loadState({ scale: "1.23456", newScale: "0.1" });
    expect(state.scale).toBe(1.23);
    expect(state.newScale).toBe(0.1);
  });
});

describe("save helpers (Vue-compatible formats)", () => {
  afterEach(() => localStorage.clear());

  it("exposes the flat key names used by the Vue app", () => {
    expect(RECIPE_STATE_KEYS).toEqual(["rawRecipe", "scale", "newScale"]);
  });

  it("saveStateLocalStorage writes plain string keys", () => {
    saveStateLocalStorage({ rawRecipe: "Борщ", scale: 2, newScale: 3 });
    expect(localStorage.getItem("rawRecipe")).toBe("Борщ");
    expect(localStorage.getItem("scale")).toBe("2");
    expect(localStorage.getItem("newScale")).toBe("3");
  });

  it("saveStateToUrl base64-encodes rawRecipe into the query", () => {
    const url = saveStateToUrl(new URL("http://localhost/#/"), {
      rawRecipe: "Борщ",
      scale: 2,
      newScale: 3,
    });
    expect(url.searchParams.get("rawRecipe")).toBe(bytesToBase64("Борщ"));
    expect(url.searchParams.get("scale")).toBe("2");
    expect(url.searchParams.get("newScale")).toBe("3");
  });
});

describe("readUrlQuery", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("prefers the hash query (createHashRouter format)", () => {
    window.location.hash = "#/?scale=2&newScale=3";
    expect(readUrlQuery()).toEqual({ scale: "2", newScale: "3" });
  });

  it("falls back to the classic pre-hash search string", () => {
    window.history.replaceState(null, "", "/?rawRecipe=abc");
    expect(readUrlQuery()).toEqual({ rawRecipe: "abc" });
  });

  it("returns an empty object when there is no query", () => {
    expect(readUrlQuery()).toEqual({});
  });
});
