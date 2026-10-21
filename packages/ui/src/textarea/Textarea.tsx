import type { ComponentProps } from "react";

/** Props for the {@link Textarea} component. */
export type TextareaProps = Omit<ComponentProps<"textarea">, "onChange" | "value"> & {
  /** Current value (controlled). */
  value: string;
  /** Called with the raw string value. */
  onChange: (value: string) => void;
  /** Extra classes for the textarea. */
  className?: string;
};

/**
 * Render a vertically resizable monospace textarea for raw recipe text.
 *
 * @remarks Matches the mockup's raw-recipe field: full width, `resize-y`,
 * mono text on the `bg-inputd` token. Standard textarea attributes (`rows`,
 * `placeholder`, `disabled`, `aria-*`, …) are passed through to the element.
 *
 * @param props - Textarea properties.
 */
export function Textarea({ value, onChange, className, ...rest }: TextareaProps) {
  const classes = [
    "w-full resize-y rounded-control border border-border bg-inputd p-3 font-mono text-xs leading-relaxed text-text",
    "focus-visible:ring-2 ring-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={classes}
      {...rest}
    />
  );
}
