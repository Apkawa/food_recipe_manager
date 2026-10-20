import { expect, test, type Page } from "@playwright/test";

import { openReadyPage, analyzePage, expectNoViolations, routes } from "./a11y";

/**
 * A11y scenario: axe-core scan (wcag2a + wcag2aa) of the home page while
 * interactive elements are in their OPEN state — the GrandMother modal
 * (invalid scale guard) and the Поделиться modal.
 *
 * The modals are proper ARIA dialogs (`role="dialog"`, `aria-modal="true"`,
 * per-usage `aria-label`), so open-state assertions use role-based locators
 * and inner content is located inside the dialog.
 *
 * Sample recipe text is taken from
 * packages/food-recipe-core/tests/unit/core/parser/parseText.test.ts
 * ("Parse portions") — it parses into ingredient groups + portion, which is
 * required for the scale controls to render at all.
 */

const SAMPLE_RECIPE = `Foo
2 portions
4 onions`;

// Parse the sample recipe: `#raw_recipe` is a textarea that commits on blur,
// so Tab after fill commits the text; readiness = the parsed table appears.
async function parseSampleRecipe(page: Page) {
  await page.locator("#raw_recipe").fill(SAMPLE_RECIPE);
  await page.keyboard.press("Tab");
  await expect(page.locator("#parsed_recipe")).toBeVisible();
}

/**
 * Recipe for the ingredient-edit test: its ingredient line matches the
 * "уксус 9%   3 ст.л" case in
 * packages/food-recipe-core/tests/unit/core/parser/parseRecipeLine.test.ts,
 * which parses to
 * `{ name: "уксус", unit: "tbsp", value: 3, type: { concentration: 9, name: "vinegar" } }` —
 * a concentration type (renders `input.concentration`) and a measure unit, so
 * `getAvailableConvertUnits` returns measure+volume units and `UnitSelect`
 * renders the `<select>`.
 */
const CONCENTRATION_RECIPE = `Foo
2 portions
уксус 9%   3 ст.л`;

// Same commit-on-blur flow as parseSampleRecipe, but with the recipe above.
async function parseConcentrationRecipe(page: Page) {
  await page.locator("#raw_recipe").fill(CONCENTRATION_RECIPE);
  await page.keyboard.press("Tab");
  await expect(page.locator("#parsed_recipe")).toBeVisible();
}

test.describe("e2e: a11y interactions", () => {
  const home = routes.find((r) => r.name === "home")!;

  test("a11y: open GrandMother modal", async ({ page }) => {
    await openReadyPage(page, home.url, home.marker);
    await parseSampleRecipe(page);

    // `#scale` commits Number("") = 0 on Enter (< 0.1), which triggers the
    // guard in RecipeCalculator: scale reset + GrandMother modal shown.
    await page.locator("#scale").fill("");
    await page.keyboard.press("Enter");

    // Open state: ARIA dialog + inner GrandMother text.
    await expect(
      page.getByRole("dialog", { name: "Внимание — рецепт не рассчитан" }),
    ).toBeVisible();
    await expect(page.getByText("Не балуйся")).toBeVisible();

    expectNoViolations("open GrandMother modal", await analyzePage(page));
  });

  test("a11y: open share modal", async ({ page }) => {
    await openReadyPage(page, home.url, home.marker);
    await parseSampleRecipe(page);

    // Current button name; a later stage may rename it.
    await page.getByRole("button", { name: "Поделиться" }).click();

    // Open state: ARIA dialog + inner readonly textarea.
    const dialog = page.getByRole("dialog", { name: "Поделиться рецептом" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Текст для обмена" })).toBeVisible();

    expectNoViolations("open share modal", await analyzePage(page));
  });

  test("a11y: open ingredient edit mode", async ({ page }) => {
    await openReadyPage(page, home.url, home.marker);
    await parseConcentrationRecipe(page);

    // The row's "Изменить" button toggles the inline edit row (IngredientLine
    // renders IngredientLineEdit below the display row).
    await page.getByRole("button", { name: "Изменить" }).click();

    // Edit state: the inline editor row inputs (concentration number input,
    // edit-value number input, unit select) — scoped to the parsed table.
    const table = page.locator("#parsed_recipe");
    await expect(table.locator("input.concentration")).toBeVisible();
    await expect(table.locator("input.edit-value")).toBeVisible();
    await expect(table.locator("select")).toBeVisible();

    expectNoViolations("open ingredient edit mode", await analyzePage(page));
  });
});
