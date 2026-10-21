import {
  CalculatorIcon,
  HeartIcon,
  IconButton,
  InfoIcon,
  MoonIcon,
  PencilIcon,
  Select,
  Sidebar,
  SidebarBackdrop,
  SidebarLink,
  SunIcon,
} from "@repo/ui";
import { type ReactNode, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import BuildInfo from "./components/BuildInfo";
import { SidebarContext } from "./lib/SidebarContext";
import { useThemeSync } from "./lib/useThemeSync";
import { Scheme, type SchemeId, useThemeStore } from "./stores/theme";

/**
 * Shell navigation entry: label, route path, hash href and a leading icon.
 */
type NavItem = {
  label: string;
  path: string;
  href: string;
  icon: ReactNode;
};

/** The four app destinations, shared by the sidebar and the mobile bar. */
const NAV_ITEMS: NavItem[] = [
  { label: "Калькулятор", path: "/", href: "#/", icon: <CalculatorIcon className="h-5 w-5" /> },
  {
    label: "Избранное",
    path: "/favorite",
    href: "#/favorite",
    icon: <HeartIcon className="h-5 w-5" />,
  },
  { label: "О проекте", path: "/about", href: "#/about", icon: <InfoIcon className="h-5 w-5" /> },
  {
    label: "Помощник",
    path: "/helpers",
    href: "#/helpers",
    icon: <PencilIcon className="h-5 w-5" />,
  },
];

/**
 * Application layout shell: a fixed left sidebar (desktop) / off-canvas
 * drawer (mobile) with app nav + theme controls, a centered content column
 * (routed views render into `<Outlet />` inside a `SidebarContext` provider so
 * their page headers can open the drawer) and the build-info footer.
 */
function App() {
  useThemeSync();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const dark = useThemeStore((state) => state.dark);
  const scheme = useThemeStore((state) => state.scheme);
  const toggleDark = useThemeStore((state) => state.toggleDark);
  const setScheme = useThemeStore((state) => state.setScheme);

  // The index `/` is active only for exactly `/`; the other routes match by
  // exact path.
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname === path;

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <SidebarBackdrop visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={
          <>
            <img
              src="/food_recipe_calculator_icon.png"
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
            Калькулятор рецептов
          </>
        }
        footer={
          <div className="flex flex-col gap-2">
            <IconButton
              variant="bordered"
              className="self-start"
              onClick={toggleDark}
              aria-label={dark ? "Светлая тема" : "Тёмная тема"}
            >
              {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </IconButton>
            <label className="flex flex-col gap-1.5" htmlFor="scheme-select">
              <span className="sr-only">Цветовая схема</span>
              <Select
                id="scheme-select"
                size="md"
                value={scheme}
                onChange={(value) => setScheme(value as SchemeId)}
              >
                {Scheme.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        }
      >
        <nav className="flex flex-col gap-1" aria-label="Меню">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.path}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.path)}
            />
          ))}
        </nav>
      </Sidebar>

      <div className="lg:ml-72">
        <SidebarContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
          <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:pb-6">
            <Outlet />
          </main>
        </SidebarContext.Provider>

        <footer className="mx-auto max-w-3xl px-4 pb-6 sm:px-6 lg:pb-8">
          <BuildInfo />
        </footer>
      </div>
    </div>
  );
}

export default App;
