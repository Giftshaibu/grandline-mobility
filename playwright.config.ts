import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 10000 },
  use: { baseURL: "http://127.0.0.1:4302", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command:
      "node --env-file-if-exists=.env node_modules/nitro/dist/cli/index.mjs preview --host=127.0.0.1 --port=4302",
    url: "http://127.0.0.1:4302",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
