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

interface ThemeStore {
  /** Dark mode switch, mirrored as the `dark` class on `<html>`. */
  dark: boolean;
  /** Active color scheme, mirrored as the `data-scheme` attribute on `<html>`. */
  scheme: SchemeId;
  toggleDark: () => void;
  setScheme: (scheme: SchemeId) => void;
}

/**
 * Theme store (dark mode + color scheme), persisted to localStorage under the
 * `"theme"` key. Defaults: light mode, classic scheme.
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      dark: false,
      scheme: "classic",
      toggleDark: () => set((state) => ({ dark: !state.dark })),
      setScheme: (scheme) => set({ scheme }),
    }),
    { name: "theme" },
  ),
);
