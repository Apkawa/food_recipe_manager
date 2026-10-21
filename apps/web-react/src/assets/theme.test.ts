import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Resolved from the app directory (Vitest runs with it as cwd) so the test
// never depends on the vite CSS pipeline or module URLs.
const mainCss = readFileSync(join(process.cwd(), "src/assets/main.css"), "utf8");

const SEMANTIC_TOKENS = [
  "--page",
  "--inputd",
  "--card",
  "--card95",
  "--input",
  "--text",
  "--text2",
  "--muted",
  "--muted2",
  "--grip",
  "--gripd",
  "--accent",
  "--accent2",
  "--accentbg",
  "--accentbg2",
  "--accentbg3",
  "--soft",
  "--ring",
  "--accentcontrast",
  "--border",
  "--border2",
  "--divider",
  "--track",
  "--hover",
];

describe("main.css theme", () => {
  it("imports Tailwind CSS", () => {
    expect(mainCss).toContain('@import "tailwindcss"');
  });

  it("defines the class-based dark custom variant", () => {
    expect(mainCss).toContain("@custom-variant dark");
  });

  it.each(SEMANTIC_TOKENS)("defines the %s semantic variable", (token) => {
    expect(mainCss).toContain(token);
  });

  it("maps the semantic variables into the Tailwind theme", () => {
    expect(mainCss).toContain("--color-page: var(--page)");
  });
});
