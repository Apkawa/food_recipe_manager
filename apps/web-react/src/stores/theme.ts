import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Id of a color scheme; `"classic"` is the default and needs no `data-scheme` attribute. */
export type SchemeId = "classic" | "anime" | "appetite" | "dos" | "retro90" | "win95";

/** A selectable color scheme with its user-facing label. */
export interface Scheme {
  id: SchemeId;
  label: string;
}

/**
 * All available color schemes with Russian labels, in the order of the
 * `apps/web-mvp-v2/index.html` sidebar select.
 */
export const Scheme: readonly Scheme[] = [
  { id: "classic", label: "Классика" },
  { id: "dos", label: "DOS" },
  { id: "win95", label: "Windows 95" },
  { id: "retro90", label: "Сайт из 90-х" },
  { id: "anime", label: "Аниме" },
  { id: "appetite", label: "Аппетитный" },
];

/** Theme mode: a fixed light/dark theme, or follow the OS `prefers-color-scheme`. */
export type ThemeMode = "light" | "dark" | "system";

interface ThemeStore {
  /** Theme mode; `"system"` follows the OS `prefers-color-scheme`. */
  mode: ThemeMode;
  /** Active color scheme, mirrored as the `data-scheme` attribute on `<html>`. */
  scheme: SchemeId;
  setMode: (mode: ThemeMode) => void;
  setScheme: (scheme: SchemeId) => void;
}

/**
 * Theme store (theme mode + color scheme), persisted to localStorage under the
 * `"theme"` key. Defaults: system mode, classic scheme.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: "system",
      scheme: "classic",
      setMode: (mode) => set({ mode }),
      setScheme: (scheme) => set({ scheme }),
    }),
    {
      name: "theme",
      version: 1,
      // Version 0 stored `{dark: boolean}`; map it onto the mode. The result
      // is merged with the live state, so only the data fields need migrating.
      migrate: (persisted) => {
        const state = persisted as { dark?: boolean; scheme?: SchemeId };
        return {
          mode: state.dark ? "dark" : "light",
          scheme: state.scheme ?? "classic",
        } as ThemeStore;
      },
    },
  ),
);
