import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4444",
    browserName: "chromium",
    launchOptions: {
      args: ["--no-sandbox"],
    },
    trace: "on-first-retry",
  },
  webServer: {
    command: "PORT=4444 node build/server/start.js",
    url: "http://127.0.0.1:4444",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
