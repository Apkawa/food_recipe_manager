import { calculateScale } from "@app/core/calculator";
import type { Ingredient } from "@app/core/types/recipe";
import type { Cases } from "@tests/unit/types";

describe("calculateScale", () => {
  const cases: Cases<Ingredient, number | null> = [
    { arg: { name: "", value: 1, calculated_value: 2 }, expected: 2 },
    { arg: { name: "", value: 2, calculated_value: 1 }, expected: 0.5 },
    { arg: { name: "", value: [1 - 2], calculated_value: [2 - 4] }, expected: 2 },
    { arg: { name: "", value: [2 - 4], calculated_value: [1 - 2] }, expected: 0.5 },
    { arg: { name: "" }, expected: null },
    // Characterization cases for zero, range, and edge behavior:
    // document the current implementation's behavior for falsy values,
    // zero divisors, empty/short ranges, and special numbers.
    { arg: { name: "", value: 0, calculated_value: 0 }, expected: null },
    { arg: { name: "", value: 0, calculated_value: 5 }, expected: null },
    { arg: { name: "", value: 5, calculated_value: 0 }, expected: null },
    { arg: { name: "", value: [0, 2], calculated_value: [4, 8] }, expected: Infinity },
    { arg: { name: "", value: [0, 2], calculated_value: [0, 0] }, expected: NaN },
    { arg: { name: "", value: [1, 2], calculated_value: [] }, expected: NaN },
    { arg: { name: "", value: [1], calculated_value: [3] }, expected: 3 },
    { arg: { name: "", value: [1], calculated_value: [2, 4] }, expected: 2 },
    { arg: { name: "", value: 3 }, expected: null },
    { arg: { name: "", calculated_value: 3 }, expected: null },
    { arg: { name: "", value: -2, calculated_value: 4 }, expected: -2 },
    { arg: { name: "", value: 3, calculated_value: 10 }, expected: 3.3333333333333335 },
    { arg: { name: "", value: NaN, calculated_value: 5 }, expected: null },
    { arg: { name: "", value: Infinity, calculated_value: Infinity }, expected: NaN },
  ];
  it.each(cases)("[$#] $arg -> $expected", (c) => {
    expect(calculateScale(c.arg)).toStrictEqual(c.expected);
  });
  it("Manual debug case", () => {
    const c = cases[cases.length - 1];
    expect(calculateScale(c.arg)).toStrictEqual(c.expected);
  });
});
