import { expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import type { AxeResults } from "axe-core";

/**
 * Shared a11y helpers for the e2e suite.
 *
 * Runs an axe-core (AxeBuilder) scan over the main routes with the
 * `wcag2a` + `wcag2aa` rules and asserts zero violations. Page readiness
 * follows the smoke pattern: the route-unique text marker is visible.
 *
 * The a11y scenario files import these helpers from `./a11y`.
 */

export const A11Y_TAGS = ["wcag2a", "wcag2aa"];

export interface RouteCase {
  name: string;
  url: string;
  marker: RegExp | string;
}

// Routes — as in the smoke suite (tests/smoke/routes.test.ts): hash routing (/#/…).
export const routes: RouteCase[] = [
  { name: "home", url: "/#/", marker: "Текстовый рецепт" },
  { name: "about", url: "/#/about", marker: "Цель проекта" },
  { name: "favorite", url: "/#/favorite", marker: "Избранные рецепты" },
  { name: "helpers", url: "/#/helpers", marker: "Таблица плотности" },
];

// Page readiness = marker visibility (pattern of the existing tests).
export async function openReadyPage(page: Page, url: string, marker: RegExp | string) {
  await page.goto(url);
  await expect(page.getByText(marker).first()).toBeVisible();
}

export async function analyzePage(page: Page) {
  return new AxeBuilder({ page }).withTags(A11Y_TAGS).analyze();
}

// Readable failure: one line per violating node —
// rule id, impact, help, target (CSS path to the element).
export function expectNoViolations(label: string, results: AxeResults) {
  const violations = results.violations.flatMap((v) =>
    v.nodes.map((n) => `${v.id} [${v.impact}] ${v.help} — target: ${n.target.join(" ")}`),
  );
  expect(violations, `a11y violations (${label}):\n${violations.join("\n")}`).toEqual([]);
}
