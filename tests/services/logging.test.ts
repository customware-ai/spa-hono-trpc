import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  getLogFilePathForSource,
  logFrontendPayload,
  logServerPayload,
} from "../../server/services/logging.js";

describe("logging service", () => {
  let logsDirectory: string;
  let originalCwd = "";

  beforeEach(() => {
    originalCwd = process.cwd();
    logsDirectory = mkdtempSync(path.join(tmpdir(), "cohesiv-logs-"));
    process.chdir(logsDirectory);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    rmSync(logsDirectory, { recursive: true, force: true });
  });

  it("writes frontend logs with app logs prefix", () => {
    const writeResult = logFrontendPayload({
      source: "app",
      level: "error",
      message: "frontend failure",
      context: { component: "Header" },
      page_url: "http://localhost/",
    });

    expect(writeResult.isOk()).toBe(true);

    const runtimeLogPath = getLogFilePathForSource();
    const content = readFileSync(runtimeLogPath, "utf8");

    expect(content).toContain("[app logs]");
    expect(content).toContain("frontend failure");
  });

  it("keeps only the latest one hundred server log lines", () => {
    for (let index = 0; index < 105; index += 1) {
      const writeResult = logServerPayload({
        source: "server",
        level: "info",
        message: `server-${index}`,
        context: { index },
        page_url: "/health",
      });
      expect(writeResult.isOk()).toBe(true);
    }

    const runtimeLogPath = getLogFilePathForSource();
    const contents = readFileSync(runtimeLogPath, "utf8");
    const lines = contents
      .split(/\r?\n/)
      .filter((entry) => entry.trim().length > 0);

    expect(lines).toHaveLength(100);
    expect(lines[0]).toContain("server-5");
    expect(lines[99]).toContain("server-104");
  });

  it("rejects invalid frontend payloads", () => {
    const invalidPayload: unknown = {
      source: "server",
      level: "error",
      message: "this is wrong",
      page_url: "/bad",
      context: {},
    };
    const writeResult = logFrontendPayload(invalidPayload);
    expect(writeResult.isErr()).toBe(true);
    expect(writeResult.isErr() ? writeResult.error.type : "").toBe(
      "LOG_VALIDATION_ERROR",
    );
  });
});
