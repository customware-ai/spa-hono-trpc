import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  use: {
    browserName: "chromium",
    launchOptions: {
      args: ["--no-sandbox"],
    },
  },
});
