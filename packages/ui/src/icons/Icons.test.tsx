import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  GripIcon,
  HeartIcon,
  InfoIcon,
  MenuIcon,
  MoonIcon,
  PencilIcon,
  ShareIcon,
  SunIcon,
} from "./index";

const strokeIcons = [
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  HeartIcon,
  InfoIcon,
  MenuIcon,
  MoonIcon,
  PencilIcon,
  ShareIcon,
  SunIcon,
] as const;

const allIcons = [GripIcon, ...strokeIcons] as const;

/** The rendered `<svg>` for the last call, non-null. */
function svgOf(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector("svg");
  if (!svg) {
    throw new Error("Expected the icon to render an <svg> element");
  }
  return svg;
}

describe("icons", () => {
  for (const [name, Icon] of allIcons.map((Icon) => [Icon.name, Icon] as const)) {
    it(`renders an <svg> with aria-hidden="true" by default (${name})`, () => {
      const { container } = render(<Icon />);
      expect(svgOf(container).getAttribute("aria-hidden")).toBe("true");
    });

    it(`forwards className to the svg (${name})`, () => {
      const { container } = render(<Icon className="h-5 w-5" />);
      expect(svgOf(container).getAttribute("class")).toBe("h-5 w-5");
    });
  }

  it("renders the grip icon with fill=currentColor", () => {
    const { container } = render(<GripIcon />);
    const svg = svgOf(container);
    expect(svg.getAttribute("fill")).toBe("currentColor");
    expect(svg.getAttribute("stroke")).toBe("none");
    expect(svg.querySelectorAll("circle")).toHaveLength(6);
  });

  it("renders stroke icons with the expected stroke attributes (Close, Heart, Menu)", () => {
    for (const [, Icon] of [
      ["CloseIcon", CloseIcon],
      ["HeartIcon", HeartIcon],
      ["MenuIcon", MenuIcon],
    ] as const) {
      const { container } = render(<Icon />);
      const svg = svgOf(container);
      expect(svg.getAttribute("stroke")).toBe("currentColor");
      expect(svg.getAttribute("stroke-width")).toBe("2");
      expect(svg.getAttribute("stroke-linecap")).toBe("round");
      expect(svg.getAttribute("stroke-linejoin")).toBe("round");
      expect(svg.getAttribute("fill")).toBe("none");
    }
  });
});
