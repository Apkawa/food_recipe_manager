import type { Page } from "@playwright/test";

// Dev-предупреждения React 19 (только dev-режим) — известный шум, не ошибки приложения:
// - "The current testing environment is not configured to support act(...)" —
//   react-dom dev-проверка на использование act();
// - "Download the React DevTools for a better development experience" —
//   подсказка React DevTools при загрузке dev-сборки;
// - "Each child in a list should have a unique "key" prop" — React может
//   предупреждать о key в списках;
// - "Encountered two children with the same key" — дублирующиеся key.
// React 19 больше не вешает префикс "Warning: " на эти сообщения, поэтому
// матчим по содержимому (присутствующий префикс отбрасываем).
export const isKnownDevWarning = (text: string) => {
  const t = text.replace(/^Warning:\s*/, "");
  return (
    t.includes("is not configured to support act") ||
    t.startsWith("Download the React DevTools") ||
    t.startsWith("Each child in a list should have a unique") ||
    t.startsWith("Encountered two children with the same key")
  );
};

/**
 * Track console.error and pageerror (uncaught exceptions) on the page.
 * Returns a function yielding the collected errors, for a `toEqual([])` assert.
 */
export function trackConsoleErrors(page: Page): () => string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !isKnownDevWarning(m.text())) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return () => errors;
}
