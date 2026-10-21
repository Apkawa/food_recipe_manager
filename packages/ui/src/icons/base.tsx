import type { SVGAttributes } from "react";

/** Props shared by all kit icons. */
export type IconProps = {
  /** CSS class applied to the `<svg>` element. */
  className?: string;
  /** Set to `false` when the icon carries a meaningful accessible name. Defaults to `true`. */
  ariaHidden?: boolean;
} & Omit<SVGAttributes<SVGSVGElement>, "aria-hidden" | "className">;

/** Stroke attributes shared by all stroke-based icons. */
export const STROKE_SVG_PROPS: Pick<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "fill" | "stroke" | "strokeWidth" | "strokeLinecap" | "strokeLinejoin"
> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

/** Build the shared `<svg>` props for a stroke icon. */
export function strokeSvgProps(props: IconProps): Record<string, unknown> {
  const { ariaHidden = true, ...rest } = props;
  return { ...STROKE_SVG_PROPS, "aria-hidden": ariaHidden, ...rest };
}

/** Build the shared `<svg>` props for a filled (solid) icon. */
export function fillSvgProps(props: IconProps): Record<string, unknown> {
  const { ariaHidden = true, ...rest } = props;
  return {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    stroke: "none",
    "aria-hidden": ariaHidden,
    ...rest,
  };
}
