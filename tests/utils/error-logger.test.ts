import { beforeEach, describe, expect, it, vi } from "vitest";
import { attachGlobalFrontendErrorHandlers } from "../../app/utils/error-logger";

describe("Frontend error logger utility", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends browser window errors to /logs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const detach = attachGlobalFrontendErrorHandlers({
      endpoint: "/logs",
      fetchImpl: fetchMock,
    });

    const error = new Error("frontend boom");
    window.dispatchEvent(
      new ErrorEvent("error", {
        message: "front-end boom",
        filename: "app.js",
        lineno: 12,
        colno: 5,
        error,
      }),
    );

    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(endpoint).toBe("/logs");
    expect(requestInit.method).toBe("POST");
    expect(requestInit.headers).toMatchObject({
      "Content-Type": "application/json",
    });

    const payload = JSON.parse(requestInit.body as string) as {
      source: string;
      level: string;
    };
    expect(payload.source).toBe("app");
    expect(payload.level).toBe("error");

    detach();
  });

  it("sends browser promise rejections to /logs", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const detach = attachGlobalFrontendErrorHandlers({
      endpoint: "/logs",
      fetchImpl: fetchMock,
    });

    window.dispatchEvent(
      new PromiseRejectionEvent("unhandledrejection", {
        reason: new Error("promise failed"),
      }),
    );

    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];
    const payload = JSON.parse(requestInit.body as string) as {
      source: string;
      message: string;
    };
    expect(payload.source).toBe("app");
    expect(payload.message).toBe("promise failed");

    detach();
  });
});
