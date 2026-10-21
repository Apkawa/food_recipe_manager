import { useEffect, useState } from "react";

import { useThemeStore } from "../stores/theme";

/** Media query for the OS dark theme preference. */
const DARK_PREF_QUERY = "(prefers-color-scheme: dark)";

/**
 * Sync the theme store to `<html>`: the `dark` class mirrors the effective
 * dark theme (explicit `dark` mode, or the OS `prefers-color-scheme` in
 * `system` mode) and the `data-scheme` attribute mirrors `scheme` (the
 * scheme stylesheets key off it).
 *
 * In `system` mode the `dark` class follows the OS theme live: a
 * `prefers-color-scheme` change re-applies it without a reload.
 *
 * Renders nothing; call it once in a component that stays mounted for the
 * lifetime of the app (the layout route).
 */
export function useThemeSync(): void {
  const mode = useThemeStore((state) => state.mode);
  const scheme = useThemeStore((state) => state.scheme);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_PREF_QUERY).matches);

  useEffect(() => {
    const queryList = window.matchMedia(DARK_PREF_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    setSystemDark(queryList.matches);
    queryList.addEventListener("change", onChange);
    return () => queryList.removeEventListener("change", onChange);
  }, []);

  const dark = mode === "dark" || (mode === "system" && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.scheme = scheme;
  }, [dark, scheme]);
}
