import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Scheme, useThemeStore } from "./theme";

describe("useThemeStore", () => {
  afterEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  beforeEach(() => {
    useThemeStore.setState({ dark: false, scheme: "classic" });
  });

  it("starts in light mode with the classic scheme", () => {
    const state = useThemeStore.getState();
    expect(state.dark).toBe(false);
    expect(state.scheme).toBe("classic");
  });

  it("toggleDark flips the dark flag", () => {
    useThemeStore.getState().toggleDark();
    expect(useThemeStore.getState().dark).toBe(true);
    useThemeStore.getState().toggleDark();
    expect(useThemeStore.getState().dark).toBe(false);
  });

  it("setScheme sets the scheme", () => {
    useThemeStore.getState().setScheme("anime");
    expect(useThemeStore.getState().scheme).toBe("anime");
  });

  it("persists the state to localStorage under 'theme'", () => {
    useThemeStore.getState().toggleDark();
    useThemeStore.getState().setScheme("win95");
    const raw = localStorage.getItem("theme");
    expect(raw).toBeTruthy();
    const parsed: { state?: { dark?: boolean; scheme?: string } } = JSON.parse(raw ?? "{}");
    expect(parsed.state?.dark).toBe(true);
    expect(parsed.state?.scheme).toBe("win95");
  });

  it("rehydrates from localStorage on store creation", async () => {
    localStorage.setItem(
      "theme",
      JSON.stringify({ state: { dark: true, scheme: "anime" }, version: 0 }),
    );
    vi.resetModules();
    const { useThemeStore: freshStore } = await import("./theme");
    expect(freshStore.getState().dark).toBe(true);
    expect(freshStore.getState().scheme).toBe("anime");
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
