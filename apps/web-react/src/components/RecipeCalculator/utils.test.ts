import { describe, expect, it } from "vitest";
import { allowVulgarDisplay, valueDisplay } from "./utils";

describe("valueDisplay", () => {
  it("returns an empty string for missing values (to taste)", () => {
    expect(valueDisplay()).toBe("");
    expect(valueDisplay(undefined, "cup")).toBe("");
  });

  it("rounds a plain value to 2 decimals and keeps the dot", () => {
    expect(valueDisplay(2.7)).toBe("2.7");
    expect(valueDisplay(1.004)).toBe("1");
  });

  it("uses vulgar fraction glyphs for vulgar units", () => {
    expect(valueDisplay(1.5, "cup")).toBe("1½");
    expect(valueDisplay(0.5, "tbsp")).toBe("½");
    expect(valueDisplay(2, "cup")).toBe("2");
  });

  it("keeps decimals for non-vulgar units", () => {
    expect(valueDisplay(1.5, "g")).toBe("1.5");
    expect(valueDisplay(0.3, "kg")).toBe("0.3");
  });

  it("joins range values with ' - '", () => {
    expect(valueDisplay([1, 2])).toBe("1 - 2");
    expect(valueDisplay([1.25, 2.5], "cup")).toBe("1¼ - 2½");
  });
});

describe("allowVulgarDisplay", () => {
  it("allows only the known measure units", () => {
    expect(allowVulgarDisplay("cup")).toBe(true);
    expect(allowVulgarDisplay("tsp")).toBe(true);
    expect(allowVulgarDisplay("kg")).toBe(false);
    expect(allowVulgarDisplay("ml")).toBe(false);
  });
});
