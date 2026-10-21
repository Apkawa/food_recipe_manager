/** Props for the {@link ProgressBar} component. */
export type ProgressBarProps = {
  /** Progress percentage, clamped to 0–100. */
  value: number;
  /** Track height: `md` is `h-2`, `sm` is `h-1.5`. Defaults to `md`. */
  size?: "sm" | "md";
  /** Accessible name of the progress meter. */
  label?: string;
  /** Extra classes for the track. */
  className?: string;
};

/**
 * Render a simple progress bar styled with the semantic theme tokens.
 *
 * @remarks Matches the mockup's bar: a `bg-track` rounded track with a
 * `bg-accentbg` fill whose inline `width` reflects the clamped value.
 * Exposes `role="progressbar"` with `aria-valuenow`, `aria-valuemin` and
 * `aria-valuemax`.
 *
 * @param props - ProgressBar properties.
 */
export function ProgressBar({ value, size = "md", label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const classes = [
    "w-full overflow-hidden rounded-full bg-track",
    size === "sm" ? "h-1.5" : "h-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={classes}
    >
      <div className="h-full rounded-full bg-accentbg" style={{ width: `${clamped}%` }} />
    </div>
  );
}
