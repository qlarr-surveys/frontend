import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "esm" : "cjs"}.js`,
    },
    rollupOptions: {
      external: ["lodash.clonedeep"],
    },
    outDir: "dist",
  },
});
