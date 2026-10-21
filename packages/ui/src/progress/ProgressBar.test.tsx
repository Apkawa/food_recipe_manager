import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./index";

function renderProgressBar(props: Partial<Parameters<typeof ProgressBar>[0]> = {}) {
  const result = render(<ProgressBar value={33} {...props} />);
  const track = within(result.container).getByRole("progressbar");
  return { ...result, track, fill: track.firstElementChild as HTMLElement };
}

describe("ProgressBar", () => {
  it("renders role=progressbar with correct aria values", () => {
    const { track } = renderProgressBar({ value: 33, label: "Progress" });
    expect(track.getAttribute("aria-valuenow")).toBe("33");
    expect(track.getAttribute("aria-valuemin")).toBe("0");
    expect(track.getAttribute("aria-valuemax")).toBe("100");
    expect(track.getAttribute("aria-label")).toBe("Progress");
  });

  it("sets the fill width from the value", () => {
    const { fill } = renderProgressBar({ value: 33 });
    expect(fill.style.width).toBe("33%");
  });

  it("clamps values above 100 and below 0", () => {
    const over = renderProgressBar({ value: 150 });
    expect(over.track.getAttribute("aria-valuenow")).toBe("100");
    expect(over.fill.style.width).toBe("100%");

    const under = renderProgressBar({ value: -10 });
    expect(under.track.getAttribute("aria-valuenow")).toBe("0");
    expect(under.fill.style.width).toBe("0%");
  });

  it("applies h-2 by default and h-1.5 for sm, and merges className", () => {
    const { track } = renderProgressBar();
    expect(track.className).toContain("h-2");
    expect(track.className).toContain("w-full overflow-hidden rounded-full bg-track");

    const sm = renderProgressBar({ size: "sm", className: "mt-4" });
    expect(sm.track.className).toContain("h-1.5");
    expect(sm.track.className).toContain("mt-4");
    expect(sm.fill.className).toContain("rounded-full bg-accentbg");
  });
});
