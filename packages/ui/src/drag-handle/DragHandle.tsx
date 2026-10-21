import type { HTMLAttributes } from "react";
import { GripIcon } from "../icons";

/** Props for the {@link DragHandle} component. */
export type DragHandleProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Highlights the handle in the lighter "edited row" colour. Defaults to `false`. */
  active?: boolean;
};

/**
 * Render a presentation-only drag handle (six-dot grip) for list rows.
 *
 * @remarks Purely visual — no drag behaviour. Colours use the consuming
 * app's tokens: `text-grip` by default and `text-gripd` when `active`.
 * The wrapper span is `aria-hidden`; all `<span>` attributes are passed
 * through.
 *
 * @param props - DragHandle properties.
 */
export function DragHandle({ active = false, className, ...rest }: DragHandleProps) {
  return (
    <span
      aria-hidden="true"
      className={["shrink-0 cursor-grab", active ? "text-gripd" : "text-grip", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <GripIcon className="h-5 w-4" />
    </span>
  );
}
