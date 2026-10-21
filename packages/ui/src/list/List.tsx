import type { HTMLAttributes, LiHTMLAttributes } from "react";

/** Props for the {@link List} container. */
export type ListProps = HTMLAttributes<HTMLUListElement>;

/**
 * Render a vertically divided list of {@link Row} items.
 *
 * @remarks Dividers use the consuming app's `divide-divider` token.
 * All `<ul>` attributes are passed through.
 *
 * @param props - List properties.
 */
export function List({ className, children, ...rest }: ListProps) {
  return (
    <ul className={["divide-y divide-divider", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </ul>
  );
}

/** Props for a {@link Row} item inside a {@link List}. */
export type RowProps = LiHTMLAttributes<HTMLLIElement> & {
  /** Highlight the row (edited state). Defaults to `false`. */
  highlighted?: boolean;
};

/**
 * Render a single horizontally arranged list row.
 *
 * @remarks With `highlighted` the row gets `bg-soft ring-1 ring-inset
 * ring-ring` from the consuming app's tokens to mark an edited state.
 * All `<li>` attributes are passed through.
 *
 * @param props - Row properties.
 */
export function Row({ className, highlighted = false, children, ...rest }: RowProps) {
  return (
    <li
      className={[
        "flex items-center gap-1 px-1 py-2.5",
        highlighted ? "bg-soft ring-1 ring-inset ring-ring" : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </li>
  );
}
