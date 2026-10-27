import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: 2,
  timeout: 60000,
  expect: { timeout: 10000 },
  use: { baseURL: "http://127.0.0.1:8082", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js dev --host 127.0.0.1 --port 8082",
    url: "http://127.0.0.1:8082",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
