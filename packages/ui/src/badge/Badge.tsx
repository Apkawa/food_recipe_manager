import type { HTMLAttributes } from "react";

/** Visual tone of a {@link Badge}. */
export type BadgeTone = "accent" | "neutral";

/** Props for the {@link Badge} component. */
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Visual tone. Defaults to `"accent"`. */
  tone?: BadgeTone;
};

/** Token classes per badge tone. */
const TONE_CLASSES: Record<BadgeTone, string> = {
  accent: "bg-soft text-accent2",
  neutral: "bg-hover text-muted2",
};

/**
 * Render a small pill badge styled with the semantic theme tokens.
 *
 * @remarks Colours use the consuming app's tokens: `accent` maps to
 * `bg-soft text-accent2` and `neutral` to `bg-hover text-muted2`. All
 * `<span>` attributes are passed through.
 *
 * @param props - Badge properties.
 */
export function Badge({ tone = "accent", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        TONE_CLASSES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
