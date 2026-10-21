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
  /**
   * Snap the stepped value to the nearest multiple of `step`, so an
   * off-step value (e.g. `3.333` with `step: 1`) becomes `4` on increment
   * instead of `4.333`. Defaults to `false`.
   */
  roundToStep?: boolean;
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
 * With `roundToStep` the stepped value is snapped to the nearest multiple
 * of `step`, so pressing a button from an off-step value (e.g. `3.333`
 * with `step: 1`) lands on a whole step (`4`) instead of `4.333`.
 *
 * @param props - Stepper properties.
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  roundToStep = false,
  className,
  ariaLabel = "Счётчик",
  ariaLabelDecrement = "Уменьшить",
  ariaLabelIncrement = "Увеличить",
}: StepperProps) {
  const snap = (v: number) =>
    roundToStep ? Number((Math.round(v / step) * step).toPrecision(12)) : v;
  const nextDecrement = snap(value - step);
  const nextIncrement = snap(value + step);
  const canDecrement = nextDecrement >= min;
  const canIncrement = nextIncrement <= max;
  const groupClasses = ["flex items-center gap-2", className].filter(Boolean).join(" ");
  return (
    // biome-ignore lint/a11y/useSemanticElements: a stepper is a button group, not a form fieldset
    <div role="group" aria-label={ariaLabel} className={groupClasses}>
      <IconButton
        variant="bordered"
        aria-label={ariaLabelDecrement}
        disabled={!canDecrement}
        onClick={() => onChange(nextDecrement)}
        className="text-xl font-bold"
      >
        −
      </IconButton>
      <span className="min-w-10 text-center text-xl font-bold tabular-nums">{value}</span>
      <IconButton
        variant="accent"
        aria-label={ariaLabelIncrement}
        disabled={!canIncrement}
        onClick={() => onChange(nextIncrement)}
        className="text-xl font-bold"
      >
        +
      </IconButton>
    </div>
  );
}
