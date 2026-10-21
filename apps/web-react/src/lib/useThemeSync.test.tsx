import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useThemeStore } from "../stores/theme";
import { useThemeSync } from "./useThemeSync";

function ThemeSyncProbe() {
  useThemeSync();
  return null;
}

const rootElement = document.documentElement;

describe("useThemeSync", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ dark: false, scheme: "classic" });
  });

  afterEach(() => {
    cleanup();
    rootElement.classList.remove("dark");
    delete rootElement.dataset.scheme;
  });

  it("applies no dark class and data-scheme=classic by default", () => {
    render(<ThemeSyncProbe />);

    expect(rootElement.classList.contains("dark")).toBe(false);
    expect(rootElement.dataset.scheme).toBe("classic");
  });

  it("applies the dark class and data-scheme on mount", () => {
    useThemeStore.setState({ dark: true, scheme: "anime" });

    render(<ThemeSyncProbe />);

    expect(rootElement.classList.contains("dark")).toBe(true);
    expect(rootElement.dataset.scheme).toBe("anime");
  });

  it("removes the dark class and updates data-scheme when the store changes", () => {
    useThemeStore.setState({ dark: true, scheme: "anime" });
    render(<ThemeSyncProbe />);

    act(() => {
      useThemeStore.getState().toggleDark();
      useThemeStore.getState().setScheme("dos");
    });

    expect(rootElement.classList.contains("dark")).toBe(false);
    expect(rootElement.dataset.scheme).toBe("dos");
  });

  it("re-adds the dark class when dark mode is toggled back on", () => {
    render(<ThemeSyncProbe />);

    act(() => {
      useThemeStore.getState().toggleDark();
    });

    expect(rootElement.classList.contains("dark")).toBe(true);
    expect(rootElement.dataset.scheme).toBe("classic");
  });
});
