import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./index";

describe("Badge", () => {
  it("renders its children inside a pill", () => {
    render(<Badge>× 0.33</Badge>);
    const badge = screen.getByText("× 0.33");
    expect(badge.className).toContain("inline-flex");
    expect(badge.className).toContain("rounded-full");
    expect(badge.className).toContain("px-2 py-0.5");
    expect(badge.className).toContain("text-[11px]");
    expect(badge.className).toContain("font-bold");
  });

  it("uses the accent tone classes by default", () => {
    render(<Badge>Accent</Badge>);
    const badge = screen.getByText("Accent");
    expect(badge.className).toContain("bg-soft");
    expect(badge.className).toContain("text-accent2");
  });

  it("uses the neutral tone classes when tone=neutral", () => {
    render(<Badge tone="neutral">Neutral</Badge>);
    const badge = screen.getByText("Neutral");
    expect(badge.className).toContain("bg-hover");
    expect(badge.className).toContain("text-muted2");
    expect(badge.className).not.toContain("bg-soft");
  });

  it("merges className", () => {
    render(<Badge className="ml-auto">Tag</Badge>);
    const badge = screen.getByText("Tag");
    expect(badge.className).toContain("ml-auto");
    expect(badge.className).toContain("bg-soft");
  });
});
