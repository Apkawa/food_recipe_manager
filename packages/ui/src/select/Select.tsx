import type { ComponentProps, ReactNode } from "react";

/** Props for the {@link Select} component. */
export type SelectProps = Omit<ComponentProps<"select">, "onChange" | "size" | "value"> & {
  /** Currently selected option value (controlled). */
  value: string;
  /** Called with the selected option value. */
  onChange: (value: string) => void;
  /** Option elements. */
  children?: ReactNode;
  /** Size: `sm` is the compact control, `md` is the full-size control. Defaults to `sm`. */
  size?: "sm" | "md";
  /** Extra classes for the select. */
  className?: string;
};

/**
 * Render a native `<select>` styled with the semantic theme tokens.
 *
 * @remarks The `sm` variant matches the mockup's compact unit picker
 * (2px accent border); the `md` variant matches the full-size sidebar
 * select (1px `border-border`, more padding). Standard select attributes
 * (`name`, `disabled`, `aria-*`, …) are passed through to the element.
 *
 * @param props - Select properties.
 */
export function Select({
  value,
  onChange,
  children,
  size = "sm",
  className,
  ...rest
}: SelectProps) {
  const classes = [
    "bg-input text-sm font-semibold text-text focus-visible:ring-2 ring-ring",
    size === "sm"
      ? "rounded-field border-2 border-accentbg px-2 py-0.5"
      : "rounded-control border border-border px-3 py-2.5",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={classes} {...rest}>
      {children}
    </select>
  );
}
