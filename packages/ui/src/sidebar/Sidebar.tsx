import type { AnchorHTMLAttributes, ReactNode } from "react";
import { IconButton } from "../button";
import { CloseIcon } from "../icons";

/** Props for the {@link Sidebar} component. */
export type SidebarProps = {
  /** Whether the sidebar is open on mobile (off-canvas). On `lg:` and wider it is always visible. */
  open: boolean;
  /** Called when the mobile close button is pressed. */
  onClose: () => void;
  /** Title shown in the header row. */
  title: ReactNode;
  /** Navigation content (e.g. a `<nav>` of {@link SidebarLink} items). */
  children: ReactNode;
  /** Optional bottom slot, e.g. theme controls. */
  footer?: ReactNode;
  /** Extra classes merged into the `<aside>`. */
  className?: string;
};

/** Base classes shared by every {@link Sidebar} instance. */
const BASE_SIDEBAR_CLASSES =
  "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card " +
  "p-4 shadow-xl transition-transform duration-200 lg:translate-x-0";

/**
 * Render the app sidebar: a fixed, off-canvas `<aside>` with a title row,
 * a mobile close button, nav content and an optional bottom slot.
 *
 * @remarks Colours come from the semantic theme tokens of the consuming
 * app (`bg-card`, `border-border`, …). On `lg:` and wider the sidebar is
 * always visible; on smaller screens `open` toggles the translate
 * classes.
 *
 * @param props - Sidebar properties.
 */
export function Sidebar({ open, onClose, title, children, footer, className }: SidebarProps) {
  return (
    <aside
      data-open={String(open)}
      className={[BASE_SIDEBAR_CLASSES, open ? "translate-x-0" : "-translate-x-full", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-extrabold">{title}</span>
        <IconButton
          variant="ghost"
          className="lg:hidden"
          onClick={onClose}
          aria-label="Закрыть меню"
        >
          <CloseIcon />
        </IconButton>
      </div>
      {children}
      {footer ? <div className="mt-auto">{footer}</div> : null}
    </aside>
  );
}

/** Props for the {@link SidebarLink} component. */
export type SidebarLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Navigation target. */
  href: string;
  /** Link label. */
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Marks the link as the current page. Defaults to `false`. */
  active?: boolean;
};

/**
 * Render a single sidebar navigation item.
 *
 * @remarks The active state adds `aria-current="page"` and the soft accent
 * token classes. All standard `<a>` attributes are passed through.
 *
 * @param props - Sidebar link properties.
 */
export function SidebarLink({
  href,
  label,
  icon,
  active = false,
  className,
  ...rest
}: SidebarLinkProps) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-semibold text-text2 " +
          "transition hover:bg-hover hover:text-accent",
        active ? "bg-accentbg/10 font-bold text-accent2" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {label}
    </a>
  );
}

/** Props for the {@link SidebarBackdrop} component. */
export type SidebarBackdropProps = {
  /** Whether the backdrop is shown (mobile only). */
  visible: boolean;
  /** Called when the backdrop is clicked. */
  onClick: () => void;
};

/**
 * Render the mobile backdrop shown behind the open off-canvas sidebar.
 *
 * @remarks Hidden on `lg:` and wider; pure structure plus the universal
 * `bg-black/50` overlay colour.
 *
 * @param props - Backdrop properties.
 */
export function SidebarBackdrop({ visible, onClick }: SidebarBackdropProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      onClick={onClick}
      className={["fixed inset-0 z-30 bg-black/50 lg:hidden", visible ? null : "hidden"]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
