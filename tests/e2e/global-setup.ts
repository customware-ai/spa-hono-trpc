import type { FullConfig } from "@playwright/test";
import { E2E_DATABASE_FILE_PATH, prepareE2EDatabase } from "./database";

/**
 * Rebuilds the Playwright sqlite database before the server starts so e2e tests
 * run against a clean backend schema.
 */
async function globalSetup(_config: FullConfig): Promise<void> {
  process.env.E2E_DATABASE_FILE_PATH = E2E_DATABASE_FILE_PATH;
  await prepareE2EDatabase();
}

export default globalSetup;
