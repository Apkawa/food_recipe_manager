import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DragHandle } from "./index";

describe("DragHandle", () => {
  it("renders an aria-hidden span with cursor-grab and the grip icon", () => {
    const { container } = render(<DragHandle />);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.getAttribute("aria-hidden")).toBe("true");
    expect(span?.className).toContain("cursor-grab");
    expect(span?.className).toContain("shrink-0");
    expect(span?.className).toContain("text-grip");
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelectorAll("circle")).toHaveLength(6);
    expect(svg?.getAttribute("class")).toBe("h-5 w-4");
  });

  it("swaps to the lighter grip colour class when active", () => {
    const { container } = render(<DragHandle active />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("text-gripd");
    expect(span?.className).not.toContain("text-grip ");
  });

  it("merges className", () => {
    const { container } = render(<DragHandle className="ml-1" />);
    expect(container.querySelector("span")?.className).toContain("ml-1");
  });
});
