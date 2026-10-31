import { defineConfig, devices } from "@playwright/test";
const port = process.env["PLAYWRIGHT_PORT"] ?? "4302";
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: `node --env-file-if-exists=.env node_modules/nitro/dist/cli/index.mjs preview --host=127.0.0.1 --port=${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
