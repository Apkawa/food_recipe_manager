import { test, expect } from "@playwright/test";

import { trackConsoleErrors } from "../helpers";

/**
 * Smoke suite for the web app.
 *
 * Visits each main route of the hash-routed SPA and asserts that:
 * - the route loads,
 * - a route-unique text marker is visible (proving the right view rendered,
 *   not just the shared layout), and
 * - there are zero console/page errors while the page is on screen.
 *
 * Markers are short, static, route-unique strings that do NOT appear on any
 * other route (in particular not in the shared App nav), so `getByText`
 * resolves to a single element.
 */
interface RouteCase {
  name: string;
  url: string;
  marker: RegExp | string;
}

const routes: RouteCase[] = [
  { name: "home", url: "/#/", marker: "Текстовый рецепт" },
  { name: "about", url: "/#/about", marker: "Цель проекта" },
  { name: "favorite", url: "/#/favorite", marker: "Избранное" },
  { name: "helpers", url: "/#/helpers", marker: "Таблица плотности" },
];

for (const route of routes) {
  test(`smoke: ${route.name}`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto(route.url);
    await expect(page.getByText(route.marker).first()).toBeVisible();
    expect(errors(), `console/page errors: ${errors().join("\n")}`).toEqual([]);
  });
}
