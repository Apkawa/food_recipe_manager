import { IconButton, MenuIcon } from "@repo/ui";
import type { ReactNode } from "react";

import { useSidebar } from "@/lib/SidebarContext";

/** Props for the {@link PageHeader} component. */
type PageHeaderProps = {
  /** The page title, rendered as the document `<h1>`. */
  title: ReactNode;
  /** Optional second line (e.g. a recipe name) rendered below the title, smaller. */
  subtitle?: ReactNode;
  /** Optional actions (e.g. share / favorite buttons) shown on the right. */
  actions?: ReactNode;
};

/**
 * Render the unified page header: a hamburger that opens the sidebar on the
 * left, the page title (with an optional smaller subtitle line), and optional
 * actions on the right.
 *
 * @remarks The same structure is used on every page so the hamburger always
 * sits to the left of the title.
 *
 * @param props - Page header properties.
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const { openSidebar } = useSidebar();
  return (
    <header className="flex items-center gap-3">
      <IconButton variant="ghost" onClick={openSidebar} aria-label="Открыть меню">
        <MenuIcon className="h-5 w-5" />
      </IconButton>
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <p className="truncate text-base font-medium text-text2">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
