import { useEffect } from "react";

import { useThemeStore } from "../stores/theme";

/**
 * Sync the theme store to `<html>`: the `dark` class mirrors `dark` and the
 * `data-scheme` attribute mirrors `scheme` (the scheme stylesheets key off it).
 *
 * Renders nothing; call it once in a component that stays mounted for the
 * lifetime of the app (the layout route).
 */
export function useThemeSync(): void {
  const dark = useThemeStore((state) => state.dark);
  const scheme = useThemeStore((state) => state.scheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.scheme = scheme;
  }, [dark, scheme]);
}
