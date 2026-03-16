import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initializePosthogForIframe } from "~/lib/posthog";

const { initMock } = vi.hoisted(() => ({
  initMock: vi.fn(),
}));

vi.mock("posthog-js", () => ({
  default: {
    init: initMock,
  },
}));

describe("initializePosthogForIframe", () => {
  beforeEach(() => {
    initMock.mockReset();
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_dummy_client_key");
    vi.stubEnv("VITE_POSTHOG_HOST", "https://us.i.posthog.com");
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.replaceState({}, "", "/");
  });

  it("initializes PostHog with iframe-safe defaults", () => {
    initializePosthogForIframe();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      "phc_dummy_client_key",
      {
        api_host: "https://us.i.posthog.com",
        capture_pageview: false,
        cross_subdomain_cookie: true,
        session_recording: {
          recordCrossOriginIframes: true,
        },
      },
    );
  });

  it("bootstraps distinct and session ids from query params", () => {
    window.history.replaceState(
      {},
      "",
      "/?ph_distinct_id=user-123&ph_session_id=session-456",
    );

    initializePosthogForIframe();

    expect(initMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledWith(
      "phc_dummy_client_key",
      expect.objectContaining({
        bootstrap: {
          distinctID: "user-123",
          sessionID: "session-456",
        },
      }),
    );
  });

  it("skips bootstrap for empty query params", () => {
    window.history.replaceState(
      {},
      "",
      "/?ph_distinct_id=%20%20%20&ph_session_id=",
    );

    initializePosthogForIframe();

    expect(initMock).toHaveBeenCalledTimes(1);
    const options = initMock.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(options).not.toHaveProperty("bootstrap");
  });

  it("skips initialization when no PostHog key is configured", () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "");

    initializePosthogForIframe();

    expect(initMock).not.toHaveBeenCalled();
  });

  it("does not throw when PostHog init fails", () => {
    initMock.mockImplementationOnce(() => {
      throw new Error("invalid posthog config");
    });

    expect(() => initializePosthogForIframe()).not.toThrow();
  });
});
