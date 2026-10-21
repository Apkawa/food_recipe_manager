import type { ComponentProps } from "react";

/** Visual style of an {@link IconButton}. */
export type IconButtonVariant = "bordered" | "accent" | "ghost";

/** Size of an {@link IconButton}. */
export type IconButtonSize = "md" | "lg";

/** Props for the {@link IconButton} component. */
export type IconButtonProps = ComponentProps<"button"> & {
  /** Visual style. Defaults to `"bordered"`. */
  variant?: IconButtonVariant;
  /** Size. Defaults to `"md"` (`h-11 w-11`). */
  size?: IconButtonSize;
};

/** Classes shared by every icon button in the kit. */
const BASE_ICON_BUTTON_CLASSES =
  "grid place-items-center transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:pointer-events-none disabled:opacity-50";

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  bordered: "rounded-full border border-border bg-card text-text2 shadow-card hover:bg-hover",
  accent: "rounded-control bg-accentbg text-accentcontrast hover:bg-accentbg2",
  ghost: "rounded-control text-muted2 hover:bg-hover hover:text-accent",
};

/**
 * Render a square or circular icon-only button.
 *
 * @remarks Colours come from the semantic theme tokens defined by the
 * consuming app (`bg-card`, `text-text2`, …); only structure is fixed
 * here. All native `<button>` attributes are passed through.
 *
 * @param props - Icon button properties.
 */
export function IconButton({
  variant = "bordered",
  size = "md",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      className={[BASE_ICON_BUTTON_CLASSES, SIZE_CLASSES[size], VARIANT_CLASSES[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
