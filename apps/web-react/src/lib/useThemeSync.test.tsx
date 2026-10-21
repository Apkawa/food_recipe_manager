import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useThemeStore } from "../stores/theme";
import { useThemeSync } from "./useThemeSync";

type MediaListener = (event: { matches: boolean }) => void;

/**
 * Controllable `matchMedia` mock: `setDark` flips the
 * `prefers-color-scheme: dark` match and fires the `change` listeners.
 */
function createMatchMediaMock() {
  let dark = false;
  const listeners = new Set<MediaListener>();

  const matchMedia = (query: string) => ({
    get matches() {
      return query === "(prefers-color-scheme: dark)" ? dark : false;
    },
    addEventListener: (_type: string, listener: MediaListener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: MediaListener) => {
      listeners.delete(listener);
    },
  });

  return {
    matchMedia,
    setDark(value: boolean) {
      dark = value;
      for (const listener of [...listeners]) {
        listener({ matches: value });
      }
    },
  };
}

function ThemeSyncProbe() {
  useThemeSync();
  return null;
}

const rootElement = document.documentElement;

describe("useThemeSync", () => {
  let media: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    localStorage.clear();
    media = createMatchMediaMock();
    vi.stubGlobal("matchMedia", media.matchMedia);
    useThemeStore.setState({ mode: "system", scheme: "classic" });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    rootElement.classList.remove("dark");
    delete rootElement.dataset.scheme;
  });

  it("applies no dark class in system mode with a light OS preference", () => {
    render(<ThemeSyncProbe />);

    expect(rootElement.classList.contains("dark")).toBe(false);
    expect(rootElement.dataset.scheme).toBe("classic");
  });

  it("applies the dark class in system mode with a dark OS preference", () => {
    media.setDark(true);
    render(<ThemeSyncProbe />);

    expect(rootElement.classList.contains("dark")).toBe(true);
  });

  it("follows live OS preference changes in system mode", () => {
    render(<ThemeSyncProbe />);

    act(() => {
      media.setDark(true);
    });
    expect(rootElement.classList.contains("dark")).toBe(true);

    act(() => {
      media.setDark(false);
    });
    expect(rootElement.classList.contains("dark")).toBe(false);
  });

  it("keeps the dark class in fixed dark mode regardless of the OS preference", () => {
    useThemeStore.setState({ mode: "dark" });
    render(<ThemeSyncProbe />);
    expect(rootElement.classList.contains("dark")).toBe(true);

    act(() => {
      media.setDark(false);
    });
    expect(rootElement.classList.contains("dark")).toBe(true);
  });

  it("keeps no dark class in fixed light mode even with a dark OS preference", () => {
    useThemeStore.setState({ mode: "light" });
    media.setDark(true);
    render(<ThemeSyncProbe />);
    expect(rootElement.classList.contains("dark")).toBe(false);

    act(() => {
      media.setDark(false);
    });
    expect(rootElement.classList.contains("dark")).toBe(false);
  });

  it("updates data-scheme when the scheme changes", () => {
    render(<ThemeSyncProbe />);

    act(() => {
      useThemeStore.getState().setScheme("dos");
    });

    expect(rootElement.dataset.scheme).toBe("dos");
  });
});
