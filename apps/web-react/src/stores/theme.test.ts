import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Scheme, useThemeStore } from "./theme";

describe("useThemeStore", () => {
  afterEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  beforeEach(() => {
    useThemeStore.setState({ mode: "system", scheme: "classic" });
  });

  it("starts in system mode with the classic scheme", () => {
    const state = useThemeStore.getState();
    expect(state.mode).toBe("system");
    expect(state.scheme).toBe("classic");
  });

  it("setMode sets the mode", () => {
    useThemeStore.getState().setMode("dark");
    expect(useThemeStore.getState().mode).toBe("dark");
    useThemeStore.getState().setMode("light");
    expect(useThemeStore.getState().mode).toBe("light");
  });

  it("setScheme sets the scheme", () => {
    useThemeStore.getState().setScheme("anime");
    expect(useThemeStore.getState().scheme).toBe("anime");
  });

  it("persists the state to localStorage under 'theme'", () => {
    useThemeStore.getState().setMode("dark");
    useThemeStore.getState().setScheme("win95");
    const raw = localStorage.getItem("theme");
    expect(raw).toBeTruthy();
    const parsed: { state?: { mode?: string; scheme?: string }; version?: number } = JSON.parse(
      raw ?? "{}",
    );
    expect(parsed.state?.mode).toBe("dark");
    expect(parsed.state?.scheme).toBe("win95");
    expect(parsed.version).toBe(1);
  });

  it("rehydrates from localStorage on store creation", async () => {
    localStorage.setItem(
      "theme",
      JSON.stringify({ state: { mode: "dark", scheme: "anime" }, version: 1 }),
    );
    vi.resetModules();
    const { useThemeStore: freshStore } = await import("./theme");
    expect(freshStore.getState().mode).toBe("dark");
    expect(freshStore.getState().scheme).toBe("anime");
  });

  it("migrates a legacy v0 {dark: true} state to dark mode", async () => {
    localStorage.setItem(
      "theme",
      JSON.stringify({ state: { dark: true, scheme: "anime" }, version: 0 }),
    );
    vi.resetModules();
    const { useThemeStore: freshStore } = await import("./theme");
    expect(freshStore.getState().mode).toBe("dark");
    expect(freshStore.getState().scheme).toBe("anime");
  });

  it("migrates a legacy v0 {dark: false} state to light mode", async () => {
    localStorage.setItem(
      "theme",
      JSON.stringify({ state: { dark: false, scheme: "dos" }, version: 0 }),
    );
    vi.resetModules();
    const { useThemeStore: freshStore } = await import("./theme");
    expect(freshStore.getState().mode).toBe("light");
    expect(freshStore.getState().scheme).toBe("dos");
  });
});

describe("Scheme", () => {
  it("lists all six schemes with Russian labels", () => {
    expect(Scheme).toEqual([
      { id: "classic", label: "Классика" },
      { id: "dos", label: "DOS" },
      { id: "win95", label: "Windows 95" },
      { id: "retro90", label: "Сайт из 90-х" },
      { id: "anime", label: "Аниме" },
      { id: "appetite", label: "Аппетитный" },
    ]);
  });
});
