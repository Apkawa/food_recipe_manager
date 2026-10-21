import type { ComponentProps, ReactNode } from "react";
import { CheckIcon } from "../icons";

/** Props for the {@link Checkbox} component. */
export type CheckboxProps = Omit<ComponentProps<"input">, "onChange" | "type"> & {
  /** Whether the checkbox is checked (controlled). */
  checked: boolean;
  /** Called with the new checked state when the input changes. */
  onChange: (checked: boolean) => void;
  /** Optional label text rendered next to the box. */
  label?: ReactNode;
  /** Extra classes for the wrapping `<label>`. */
  className?: string;
};

/** Classes shared by every checkbox box. */
const BOX_CLASSES =
  "grid h-6 w-6 shrink-0 place-items-center rounded-field border-2 border-border " +
  "transition peer-checked:border-accentbg peer-checked:bg-accentbg " +
  "peer-checked:text-accentcontrast peer-focus-visible:outline-none " +
  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-disabled:opacity-50";

/**
 * Render an accessible checkbox styled with the semantic theme tokens.
 *
 * @remarks A visually hidden native `<input type="checkbox">` controls the
 * state, so keyboard, focus and form semantics come for free; the visible
 * box is a `peer` sibling styled by `peer-checked` and `peer-focus-visible`.
 * Colours use the consuming app's tokens (`border-border`, `bg-accentbg`,
 * `text-accentcontrast`, `ring-ring`). Standard input attributes (`id`,
 * `name`, `disabled`, `aria-*`, …) are passed through to the input.
 *
 * @param props - Checkbox properties.
 */
export function Checkbox({ checked, onChange, label, className, ...rest }: CheckboxProps) {
  return (
    <label className={["inline-flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        {...rest}
      />
      <span aria-hidden="true" className={BOX_CLASSES}>
        {checked && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      {label ? <span className="text-sm font-medium text-text2">{label}</span> : null}
    </label>
  );
}
