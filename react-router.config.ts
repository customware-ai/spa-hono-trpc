import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode - client-side rendering only
  // The Hono server will serve the built static files
  ssr: false,
  // React Router v7 future flag for Vite Environment API compatibility (Vite 8+)
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
