import { describe, expect, it, vi } from "vitest";

/**
 * Regression test for the favorites-click infinite render/update cycle
 * (React #185): a child/parent effect phase-flip between
 * `RecipeCalculator.tsx` (child effect adopts `parsed.portion` via
 * `setScale` unconditionally whenever `parsed` identity changes) and
 * `App.tsx` (parent effect applies the render-time URL search via
 * `applyFromQuery`).
 *
 * Deterministic replay of the documented effect order using the REAL
 * `stores/recipe.ts` and `lib/state.ts`; only `@/router` is mocked — the
 * spy updates a fake hash-fragment URL exactly like `createHashRouter`
 * does, so `syncUrlToRouter()` runs unchanged.
 *
 * Per commit React runs passive effects child-before-parent:
 *   1. child  (RecipeCalculator L39–43): rawRecipe changed →
 *      setScale(Number(parsed.portion)) → set + syncUrlToRouter(get())
 *      → URL = serialization of the CURRENT store (pre-parent-apply)
 *   2. parent (App L86–88): applyFromQuery(searchAtRender) →
 *      set(loadState(searchAtRender))
 * While the URL lags the store by one commit, the state flaps A/B forever
 * (period 2). The test asserts convergence over the last two cycles.
 */

const browser = vi.hoisted(() => {
  const state = {
    preSearch: "",
    hash: "#/",
  };
  const href = () => `http://localhost/${state.preSearch}${state.hash}`;
  const navigateCalls: { pathname: string; search: string }[] = [];
  const router = {
    navigate(to: { pathname: string; search?: string }, _opts?: { replace?: boolean }) {
      navigateCalls.push({ pathname: to.pathname, search: to.search ?? "" });
      // createHashRouter: pathname + search live in the hash fragment.
      state.hash = `#${to.pathname}${to.search ?? ""}`;
    },
  };
  return { state, href, navigateCalls, router };
});

// Replace jsdom's window with a shim tracking the hash-fragment URL so the
// real syncUrlToRouter() (new URL(window.location.href), location.search,
// history.replaceState) runs unchanged.
const win = {
  location: {
    get href() {
      return browser.href();
    },
    get search() {
      return browser.state.preSearch;
    },
    get hash() {
      return browser.state.hash;
    },
  },
  history: {
    replaceState(_title: string, _text: string, url: string) {
      // syncUrlToRouter only uses this to clear a pre-hash search.
      browser.state.preSearch = new URL(url, "http://localhost/").search;
    },
  },
};
(globalThis as Record<string, unknown>).window = win;

vi.mock("@/router", () => ({ router: browser.router }));

// Real modules under test (imported after the shims are installed).
const { useRecipeStore } = await import("./recipe");
const { saveStateToUrl } = await import("@/lib/state");
const { parseTextRecipe } = await import("@repo/food-recipe-core/src/food_recipe/core/parser/text");
const { recipeToText } = await import("@repo/food-recipe-core/src/food_recipe/core/export");

interface Row {
  rawRecipe: string;
  scale: number;
  newScale: number;
  search: string;
}

describe("recipe store ↔ URL phase-flip after a favorites click", () => {
  it("converges to the clicked favorite's state (no A/B oscillation)", () => {
    localStorage.clear();
    browser.navigateCalls.length = 0;
    browser.state.preSearch = "";

    // A — the clicked favorite's text (FavoritesList serializes it into the
    // URL on click).
    const textA = recipeToText(
      parseTextRecipe("Тест\n\nдля пиццы \t 275 \t г\nсоль \t 15 \t штук\n\nРецепт на 4 порции"),
    );
    // B — the text the store still holds from before the click.
    const textB = "Другой Тест\n\nПиво 10л\n\nРецепт на 4 порции \n";

    // The click: URL gets A while the store still holds B. newScale 0 is
    // dropped — saveStateToUrl skips falsy values (FavoritesList behavior).
    const clickUrl = saveStateToUrl(new URL(browser.href()), {
      rawRecipe: textA,
      scale: 4,
      newScale: 0,
    });
    browser.router.navigate({ pathname: "/", search: clickUrl.search }, { replace: false });

    // Pre-click store state.
    useRecipeStore.setState({ rawRecipe: textB, scale: 4, newScale: 1 });

    // Replay the documented effect order for 10 commits.
    const rows: Row[] = [];
    let lastRaw: string | null = null; // child effect: [parsed] identity
    let lastParentSearch: string | null = null; // parent effect: [search]

    for (let cycle = 1; cycle <= 10; cycle++) {
      // Search as seen by the render that produced this commit (BEFORE this
      // commit's child-effect sync).
      const searchAtRender = browser.state.hash.replace(/^#\//, "");
      const s0 = useRecipeStore.getState();
      const parsed = parseTextRecipe(s0.rawRecipe);

      // 1) CHILD effect (RecipeCalculator.tsx): mirrors the guarded effect
      // there (re-runs when `parsed` identity changed, i.e. when rawRecipe
      // changed; setScale only when the value actually changes) — keep this
      // replay in sync if that effect changes.
      if (lastRaw !== s0.rawRecipe) {
        if (parsed.portion && s0.scale !== Number(parsed.portion)) {
          useRecipeStore.getState().setScale(Number(parsed.portion));
        }
        lastRaw = s0.rawRecipe;
      }

      // 2) PARENT effect (App.tsx L86–88): re-runs when the render-time
      // search changed; applies it to the store.
      if (searchAtRender !== lastParentSearch) {
        useRecipeStore
          .getState()
          .applyFromQuery(Object.fromEntries(new URLSearchParams(searchAtRender)));
        lastParentSearch = searchAtRender;
      }

      const s1 = useRecipeStore.getState();
      rows.push({
        rawRecipe: s1.rawRecipe,
        scale: s1.scale,
        newScale: s1.newScale,
        search: browser.state.hash.replace(/^#\//, ""),
      });
    }

    const prev = rows[rows.length - 2];
    const last = rows[rows.length - 1];

    expect(
      last.rawRecipe,
      `rawRecipe must be stable over the last 2 cycles (got flap: ${JSON.stringify(prev.rawRecipe)} → ${JSON.stringify(last.rawRecipe)})`,
    ).toBe(prev.rawRecipe);
    expect(last.scale, "scale must be stable over the last 2 cycles").toBe(prev.scale);
    expect(last.newScale, "newScale must be stable over the last 2 cycles").toBe(prev.newScale);
    expect(
      last.search,
      `navigated URL search must be stable over the last 2 cycles (got flap: ${prev.search} → ${last.search})`,
    ).toBe(prev.search);
    expect(last.rawRecipe, "the store must end on the clicked favorite's text").toBe(textA);
  });
});
