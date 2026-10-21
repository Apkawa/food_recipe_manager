import { describe, expect, it } from "vitest";

import { UI_PACKAGE_NAME } from "./index";

describe("UI_PACKAGE_NAME", () => {
  it("exposes the placeholder package name", () => {
    expect(UI_PACKAGE_NAME).toBe("@repo/ui");
  });
});
