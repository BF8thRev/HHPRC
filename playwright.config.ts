import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  // Fail fast instead of hanging a CI runner.
  globalTimeout: CI ? 5 * 60_000 : undefined,
  reporter: CI ? [["list"], ["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    // Phone first: the 380px layout is the one that must always work.
    { name: "phone", use: { ...devices["Pixel 5"], viewport: { width: 380, height: 800 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // CI builds and migrates in earlier steps, then starts Vite directly (no
    // pnpm/sh wrappers) so Playwright can stop the server cleanly on Linux.
    command: CI
      ? `node node_modules/vite/bin/vite.js preview --port ${PORT} --strictPort`
      : `pnpm db:migrate:local && pnpm preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/healthz`,
    reuseExistingServer: !CI,
    timeout: 180_000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
