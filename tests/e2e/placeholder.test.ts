import { test } from "@playwright/test";

/**
 * Placeholder for the future e2e suite.
 *
 * The full end-to-end scenarios are intentionally deferred to a SEPARATE task
 * that lands after the a11y work is complete. Until then this file only holds
 * `test.fixme` stubs so `pnpm test:e2e` runs cleanly: every planned scenario is
 * reported as a fixme (skipped), with zero failures.
 *
 * The intended file layout follows the sibling project
 * `react-fertilizer-calculator`:
 * - `tests/e2e/shared.ts` — domain locators and factories (stub exists, empty);
 * - scenario files — main flow, navigation, persistence (each listed
 *   below as a fixme entry).
 *
 * Each future test will use `trackConsoleErrors` from `../helpers` and the
 * domain locators from `./shared` (to be created in the dedicated task).
 */

test.describe("e2e: main flow", () => {
  test.fixme("e2e: main recipe flow — paste recipe text, calculate, result visible", async ({ page }) => {
    // TODO (future task): paste a raw recipe text into the home input, run the
    // calculation, and assert the result is visible.
    // Will use trackConsoleErrors from ../helpers and shared.ts locators.
  });
});

test.describe("e2e: navigation", () => {
  test.fixme("e2e: navigation — each nav link leads to a live page", async ({ page }) => {
    // TODO (future task): click each nav link and assert the target route
    // renders a route-unique marker, with no console/page errors.
    // Will use trackConsoleErrors from ../helpers and shared.ts locators.
  });
});

test.describe("e2e: persistence", () => {
  test.fixme("e2e: persistence — favorites survive page reload (localStorage)", async ({ page }) => {
    // TODO (future task): add a recipe to favorites, reload the page, and assert
    // the favorite is still present (persisted via localStorage).
    // Will use trackConsoleErrors from ../helpers and shared.ts locators.
  });
});
