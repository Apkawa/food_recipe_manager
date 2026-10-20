import { recipeScale } from "@app/core/calculator";
import type { Recipe } from "@app/core/types/recipe";
import type { Cases } from "@tests/unit/types";

describe("cases", () => {
  const cases: Cases<[Recipe, number], Recipe> = [
    {
      arg: [
        { name: "", ingredient_groups: [{ name: "", ingredients: [{ name: "foo", value: 1 }] }] },
        2,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "", ingredients: [{ name: "foo", value: 1, calculated_value: 2 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [
            { name: "group1", ingredients: [{ name: "foo", value: 1, calculated_value: 123 }] },
            { name: "group2", ingredients: [{ name: "bar", value: 3 }] },
          ],
        },
        0.5,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "group1", ingredients: [{ name: "foo", value: 1, calculated_value: 0.5 }] },
          { name: "group2", ingredients: [{ name: "bar", value: 3, calculated_value: 3 * 0.5 }] },
        ],
      },
    },
    // Characterization edge cases: document CURRENT behavior, including
    // surprising rounding / floating-point quirks.
    {
      arg: [{ name: "", ingredient_groups: [{ name: "g", ingredients: [{ name: "foo" }] }] }, 2],
      expected: { name: "", ingredient_groups: [{ name: "g", ingredients: [{ name: "foo" }] }] },
    },
    {
      arg: [
        { name: "", ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 0 }] }] },
        2,
      ],
      expected: {
        name: "",
        ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 0 }] }],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: [1, 2] }] }],
        },
        3,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: [1, 2], calculated_value: [3, 6] }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: [0, 2] }] }],
        },
        3,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: [0, 2], calculated_value: [0, 6] }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: [1] }] }],
        },
        4,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: [1], calculated_value: [4] }] },
        ],
      },
    },
    {
      arg: [
        { name: "", ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1 }] }] },
        0,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1, calculated_value: 0 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1.5 }] }],
        },
        -2,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1.5, calculated_value: -3 }] },
        ],
      },
    },
    {
      arg: [
        { name: "", ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1 }] }] },
        NaN,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1, calculated_value: NaN }] },
        ],
      },
    },
    {
      arg: [
        { name: "", ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1 }] }] },
        Infinity,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1, calculated_value: Infinity }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1.005 }] }],
        },
        1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1.005, calculated_value: 1 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 0.145 }] }],
        },
        1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 0.145, calculated_value: 0.14 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 2.345 }] }],
        },
        1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 2.345, calculated_value: 2.35 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 0.025 }] }],
        },
        -1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 0.025, calculated_value: -0.02 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 0.001 }] }],
        },
        1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 0.001, calculated_value: 0 }] },
        ],
      },
    },
    {
      // Precision loss at 2^53: Number.MAX_SAFE_INTEGER + 2 is not
      // representable and evaluates to 9007199254740992
      // (Number.MAX_SAFE_INTEGER + 1); scaling it by 1 leaves it unchanged.
      arg: [
        {
          name: "",
          ingredient_groups: [
            { name: "g", ingredients: [{ name: "foo", value: Number.MAX_SAFE_INTEGER + 2 }] },
          ],
        },
        1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          {
            name: "g",
            ingredients: [
              {
                name: "foo",
                value: Number.MAX_SAFE_INTEGER + 2,
                calculated_value: Number.MAX_SAFE_INTEGER + 1,
              },
            ],
          },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1e15 }] }],
        },
        1e15,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1e15, calculated_value: 1e30 }] },
        ],
      },
    },
    {
      arg: [{ name: "", ingredient_groups: [] }, 2],
      expected: { name: "", ingredient_groups: [] },
    },
    {
      arg: [{ name: "", ingredient_groups: [{ name: "g", ingredients: [] }] }, 2],
      expected: { name: "", ingredient_groups: [{ name: "g", ingredients: [] }] },
    },
    {
      arg: [
        {
          name: "",
          portion: 4,
          calculated_portion: 8,
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 1 }] }],
        },
        2,
      ],
      expected: {
        name: "",
        portion: 4,
        calculated_portion: 8,
        ingredient_groups: [
          { name: "g", ingredients: [{ name: "foo", value: 1, calculated_value: 2 }] },
        ],
      },
    },
    {
      arg: [
        {
          name: "",
          ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: [0.145, 0.155] }] }],
        },
        1,
      ],
      expected: {
        name: "",
        ingredient_groups: [
          {
            name: "g",
            ingredients: [{ name: "foo", value: [0.145, 0.155], calculated_value: [0.14, 0.16] }],
          },
        ],
      },
    },
  ];
  it.each(cases)("[$#] $arg -> $expected", ({ arg: [recipe, scale], expected }) => {
    expect(recipeScale(recipe, scale)).toStrictEqual(expected);
  });
  it("Manual debug case", () => {
    const {
      arg: [recipe, scale],
      expected,
    } = cases[cases.length - 1];
    expect(recipeScale(recipe, scale)).toStrictEqual(expected);
  });
  it("re-scaling does not compound (always from original value)", () => {
    const recipe: Recipe = {
      name: "",
      ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: 2 }] }],
    };
    recipeScale(recipe, 2);
    recipeScale(recipe, 3);
    expect(recipe).toStrictEqual({
      name: "",
      ingredient_groups: [
        { name: "g", ingredients: [{ name: "foo", value: 2, calculated_value: 6 }] },
      ],
    });
  });
  it("original value array is not mutated", () => {
    const recipe: Recipe = {
      name: "",
      ingredient_groups: [{ name: "g", ingredients: [{ name: "foo", value: [1, 2] }] }],
    };
    const original = recipe.ingredient_groups[0].ingredients[0].value;
    recipeScale(recipe, 2);
    expect(original).toStrictEqual([1, 2]);
    expect(recipe.ingredient_groups[0].ingredients[0].calculated_value).toStrictEqual([2, 4]);
  });
});
