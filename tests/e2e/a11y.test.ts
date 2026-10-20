import { test } from "@playwright/test";

import { openReadyPage, analyzePage, expectNoViolations, routes } from "./a11y";

/**
 * A11y scenario: axe-core scan (wcag2a + wcag2aa) over every main route.
 *
 * For each route the shared helper opens the page until the route-unique
 * marker is visible, then asserts zero axe-core violations.
 */
test.describe("e2e: a11y", () => {
  for (const route of routes) {
    test(`a11y: route ${route.name}`, async ({ page }) => {
      await openReadyPage(page, route.url, route.marker);
      expectNoViolations(route.name, await analyzePage(page));
    });
  }
});
