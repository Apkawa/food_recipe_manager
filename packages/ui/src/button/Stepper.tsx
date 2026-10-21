import { IconButton } from "./IconButton";

/** Props for the {@link Stepper} component. */
export type StepperProps = {
  /** Current value. */
  value: number;
  /** Called with the next value when a step button is pressed. */
  onChange: (value: number) => void;
  /** Lower bound. Defaults to `0`. */
  min?: number;
  /** Upper bound. When omitted the value can grow without limit. */
  max?: number;
  /** Step size. Defaults to `1`. */
  step?: number;
  /** Extra classes for the wrapping group. */
  className?: string;
  /** Accessible name of the group. Defaults to `"Счётчик"`. */
  ariaLabel?: string;
  /** Accessible name of the decrement button. Defaults to `"Уменьшить"`. */
  ariaLabelDecrement?: string;
  /** Accessible name of the increment button. Defaults to `"Увеличить"`. */
  ariaLabelIncrement?: string;
};

/**
 * Render a pair of − / + buttons that step a numeric value between bounds.
 *
 * @remarks The decrement button uses the `bordered` {@link IconButton}
 * style and the increment button the `accent` style, matching the
 * portion-rescale control in the mockup. Both are disabled at the
 * `min`/`max` bounds; the current value is shown between them.
 *
 * @param props - Stepper properties.
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  className,
  ariaLabel = "Счётчик",
  ariaLabelDecrement = "Уменьшить",
  ariaLabelIncrement = "Увеличить",
}: StepperProps) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;
  const groupClasses = ["flex items-center gap-2", className].filter(Boolean).join(" ");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a stepper is a button group, not a form fieldset
    <div role="group" aria-label={ariaLabel} className={groupClasses}>
      <IconButton
        variant="bordered"
        aria-label={ariaLabelDecrement}
        disabled={!canDecrement}
        onClick={() => onChange(value - step)}
        className="text-xl font-bold"
      >
        −
      </IconButton>
      <span className="min-w-10 text-center text-xl font-bold tabular-nums">{value}</span>
      <IconButton
        variant="accent"
        aria-label={ariaLabelIncrement}
        disabled={!canIncrement}
        onClick={() => onChange(value + step)}
        className="text-xl font-bold"
      >
        +
      </IconButton>
    </div>
  );
}
