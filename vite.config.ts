import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import babel from "vite-plugin-babel";
import { defineConfig } from "vite";

/**
 * Keeps the compiler configuration centralized so future flags can be added
 * without scattering Babel settings through the Vite plugin array.
 */
const reactCompilerConfig = {};

/**
 * Preserves the correct esbuild loader for each source extension while the
 * Babel bridge injects the React Compiler into the React Router Vite pipeline.
 */
function getBabelLoader(id: string): "js" | "jsx" | "ts" | "tsx" {
  if (id.endsWith(".tsx")) {
    return "tsx";
  }

  if (id.endsWith(".ts")) {
    return "ts";
  }

  if (id.endsWith(".jsx")) {
    return "jsx";
  }

  return "js";
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    babel({
      filter: /\.[jt]sx?$/,
      loader: getBabelLoader,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        // React Compiler must run before other Babel transforms.
        plugins: [["babel-plugin-react-compiler", reactCompilerConfig]],
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    minify: "oxc",
  },
});
