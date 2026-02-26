import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    launchOptions: {
      args: ["--no-sandbox"],
    },
    trace: "on-first-retry",
  },
  webServer: {
    command: "CI=true npx vite --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: process.env.CI !== "true",
    timeout: 120_000,
  },
});
