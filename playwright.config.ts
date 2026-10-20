/**
 * Shared Playwright configuration for the web-react app.
 *
 * One config serves both the smoke (`tests/smoke`) and e2e (`tests/e2e`)
 * suites; the suite is selected by the CLI path argument passed to
 * `playwright test`. The web server is the Vite dev server for
 * `apps/web-react`, started automatically by Playwright and reused if it is
 * already running on the expected port.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  fullyParallel: false,
  retries: 1,
  reporter: [["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm -C apps/web-react dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
