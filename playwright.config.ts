import { defineConfig } from "@playwright/test";
import { E2E_DATABASE_FILE_PATH } from "./tests/e2e/database";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://127.0.0.1:4444",
    browserName: "chromium",
    launchOptions: {
      args: [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-setuid-sandbox",
      ],
    },
    trace: "on-first-retry",
  },
  webServer: {
    command: "PORT=4444 node build/server/start.js",
    env: {
      ...process.env,
      E2E_DATABASE_FILE_PATH: E2E_DATABASE_FILE_PATH,
      PORT: "4444",
    },
    url: "http://127.0.0.1:4444",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
