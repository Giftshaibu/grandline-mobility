import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    maxWorkers: 1,
    pool: "forks",
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
});
