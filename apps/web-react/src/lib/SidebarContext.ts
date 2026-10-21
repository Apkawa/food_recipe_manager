import { createContext, useContext } from "react";

/** Value provided by the {@link SidebarContext}. */
export type SidebarContextValue = {
  /** Open the (mobile) sidebar drawer. */
  openSidebar: () => void;
};

/**
 * Context that lets routed views open the app sidebar (e.g. from the page
 * header hamburger). Provided by the layout shell.
 */
export const SidebarContext = createContext<SidebarContextValue>({
  openSidebar: () => {},
});

/** Read the {@link SidebarContext} value. */
export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}
