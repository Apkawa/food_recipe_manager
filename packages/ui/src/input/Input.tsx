import type { ComponentProps } from "react";

/** Props for the {@link Input} component. */
export type InputProps = Omit<ComponentProps<"input">, "onChange" | "size" | "type" | "value"> & {
  /** Current value (controlled). */
  value: string;
  /** Called with the raw string value; the consumer decides how to parse it. */
  onChange: (value: string) => void;
  /** Input type. Defaults to `"text"`. */
  type?: "text" | "number" | "search";
  /** Size: `sm` is the compact `w-16` control, `md` is full width. Defaults to `sm`. */
  size?: "sm" | "md";
  /**
   * Highlight the border to mark an edited value (the mockup's "edited"
   * state). Defaults to `false`.
   */
  highlighted?: boolean;
  /** Extra classes for the input. */
  className?: string;
};

/**
 * Render a compact number/text input styled with the semantic theme tokens.
 *
 * @remarks Matches the mockup's edited number control: right-aligned
 * `tabular-nums` bold text on `bg-input`. The `highlighted` state swaps the
 * 1px `border-border` for a 2px `border-accentbg` accent border. Standard
 * input attributes (`min`, `max`, `step`, `placeholder`, `disabled`,
 * `inputMode`, `aria-*`, …) are passed through to the element.
 *
 * @param props - Input properties.
 */
export function Input({
  value,
  onChange,
  type = "text",
  size = "sm",
  highlighted = false,
  className,
  ...rest
}: InputProps) {
  const classes = [
    "rounded-field bg-input px-2 py-0.5 text-right text-sm font-bold tabular-nums text-text",
    highlighted ? "border-2 border-accentbg" : "border border-border",
    size === "sm" ? "w-16" : "w-full",
    "focus-visible:ring-2 ring-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={classes}
      {...rest}
    />
  );
}
