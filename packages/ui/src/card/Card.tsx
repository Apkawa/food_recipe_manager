import type { HTMLAttributes } from "react";

/** Props for the {@link Card} container. */
export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Render a rounded, bordered, elevated surface for a page section.
 *
 * @remarks Colours use the consuming app's semantic tokens:
 * `rounded-card border border-border bg-card shadow-card`. All `<div>`
 * attributes (`role`, `aria-*`, ...) are passed through.
 *
 * @param props - Card properties.
 */
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={["rounded-card border border-border bg-card shadow-card", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Props for the {@link CardHeader} section title. */
export type CardHeaderProps = HTMLAttributes<HTMLHeadingElement>;

/**
 * Render the small-caps section title at the top of a {@link Card}.
 *
 * @remarks Uses the consuming app's `text-muted` token. All `<h2>`
 * attributes are passed through.
 *
 * @param props - Header properties.
 */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <h2
      className={["px-4 pt-4 text-xs font-bold uppercase tracking-wider text-muted", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </h2>
  );
}
