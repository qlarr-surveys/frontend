import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(serverDir, "..");
const srcRoot = path.resolve(repoRoot, "src");

export default defineConfig({
  resolve: {
    alias: {
      "@src": srcRoot,
      "~": srcRoot,
    },
  },
});
