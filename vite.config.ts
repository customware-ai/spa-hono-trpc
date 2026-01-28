import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ["sql.js"],
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          if (id.includes("sql.js")) {
            return "sqljs";
          }
          return undefined;
        },
      },
    },
  },
});
