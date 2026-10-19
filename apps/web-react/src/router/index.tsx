import type { ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import { createHashRouter } from "react-router-dom";

import App from "../App";
import HomeView from "../views/HomeView";

/**
 * Build a lazily loaded route (code splitting, same as in the Vue router):
 * a separate chunk for the view is generated and only loads on first visit.
 */
function lazyRoute(path: string, load: () => Promise<{ default: ComponentType }>): RouteObject {
  return {
    path,
    lazy: async () => {
      const { default: View } = await load();
      return { element: <View /> };
    },
  };
}

/**
 * Application routes (hash history — same as the Vue app).
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomeView /> },
      lazyRoute("about", () => import("../views/AboutView")),
      lazyRoute("favorite", () => import("../views/FavoritesView")),
      lazyRoute("helpers", () => import("../views/HelpersView")),
    ],
  },
];

export const router = createHashRouter(routes);
