import type { DetailsHTMLAttributes, HTMLAttributes } from "react";

/** Props for the {@link Details} disclosure container. */
export type DetailsProps = DetailsHTMLAttributes<HTMLDetailsElement>;

/**
 * Render a native `<details>` disclosure, collapsed by default.
 *
 * @remarks `open` and `onToggle` work as standard `<details>`
 * attributes and are passed through like any other prop.
 *
 * @param props - Details properties.
 */
export function Details({ className, children, ...rest }: DetailsProps) {
  return (
    <details className={className} {...rest}>
      {children}
    </details>
  );
}

/** Props for the {@link DetailsSummary} toggle row. */
export type DetailsSummaryProps = HTMLAttributes<HTMLElement>;

/**
 * Render the clickable `<summary>` row of a {@link Details} disclosure.
 *
 * @remarks The native disclosure marker is hidden by the consuming
 * app's global CSS; the component only sets `list-none` on the element.
 * All `<summary>` attributes are passed through.
 *
 * @param props - Summary properties.
 */
export function DetailsSummary({ className, children, ...rest }: DetailsSummaryProps) {
  return (
    <summary
      className={["cursor-pointer list-none p-4 text-sm font-semibold", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </summary>
  );
}
