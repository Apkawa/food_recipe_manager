import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { routes } from "./index";

/** Render the app with an in-memory router at the given route. */
function renderAt(path: string) {
  const memoryRouter = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={memoryRouter} />);
}

// Vitest globals are disabled, so Testing Library cannot register its
// automatic cleanup; unmount previous renders between tests explicitly.
afterEach(() => {
  cleanup();
});

describe("routing", () => {
  it("renders the home route with navigation and footer", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { name: "Калькулятор" })).toBeDefined();
    expect(screen.getByRole("navigation")).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();
  });

  it("renders the /favorite route (lazy)", async () => {
    renderAt("/favorite");
    expect(await screen.findByRole("heading", { name: "Избранное" })).toBeDefined();
  });

  it("renders the /about route with project text and build info", async () => {
    renderAt("/about");
    expect(await screen.findByRole("heading", { name: "О проекте" })).toBeDefined();
    expect(await screen.findByText(/Проект распространяется по лицензии MIT/)).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();
  });

  it("renders the /helpers route with three placeholder headings (lazy)", async () => {
    renderAt("/helpers");
    const headings = await screen.findAllByRole("heading");
    expect(headings).toHaveLength(3);
    const [firstHeading] = headings;
    expect(firstHeading?.textContent).toBe("Пересчет концентрации уксуса");
  });
});
