import type { ComponentProps } from "react";

/** Visual style of a {@link Button}. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Size of a {@link Button}. */
export type ButtonSize = "md" | "lg";

/** Props for the {@link Button} component. */
export type ButtonProps = ComponentProps<"button"> & {
  /** Visual style. Defaults to `"primary"`. */
  variant?: ButtonVariant;
  /** Size. Defaults to `"md"`. */
  size?: ButtonSize;
};

/** Classes shared by every button in the kit. */
const BASE_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-control transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:pointer-events-none disabled:opacity-50";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accentbg font-bold text-accentcontrast hover:bg-accentbg2",
  secondary: "font-medium text-muted underline-offset-2 hover:text-accent hover:underline",
  ghost: "font-medium text-muted2 hover:bg-hover hover:text-accent",
};

/**
 * Render a themeable push button.
 *
 * @remarks Colours come from the semantic theme tokens defined by the
 * consuming app (`bg-accentbg`, `text-muted`, …); only structure is
 * fixed here. All native `<button>` attributes (children, onClick, type,
 * disabled, aria-*, …) are passed through.
 *
 * @param props - Button properties.
 */
export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      className={[BASE_BUTTON_CLASSES, SIZE_CLASSES[size], VARIANT_CLASSES[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
