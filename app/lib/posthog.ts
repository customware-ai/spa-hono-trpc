import posthog from "posthog-js";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * Reads a query parameter and normalizes empty values to null.
 */
function getQueryParam(name: string): string | null {
  const value = new URLSearchParams(window.location.search).get(name);
  if (!value || value.trim().length === 0) {
    return null;
  }

  return value;
}

/**
 * Initializes PostHog with iframe-friendly defaults and optional identity bootstrap.
 */
export function initializePosthogForIframe(): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = (import.meta.env.VITE_POSTHOG_KEY || "").trim();
  if (!key) {
    return;
  }

  const distinctId = getQueryParam("ph_distinct_id");
  const sessionId = getQueryParam("ph_session_id");

  const options: Record<string, unknown> = {
    api_host: (import.meta.env.VITE_POSTHOG_HOST || DEFAULT_POSTHOG_HOST).trim(),
    capture_pageview: false,
    cross_subdomain_cookie: true,
    session_recording: {
      recordCrossOriginIframes: true,
    },
  };

  if (distinctId || sessionId) {
    options.bootstrap = {
      distinctID: distinctId ?? undefined,
      sessionID: sessionId ?? undefined,
    };
  }

  try {
    posthog.init(key, options);
  } catch {
    // Keep analytics failures from impacting core app UX.
  }
}
