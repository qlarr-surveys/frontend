import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import mkcert from "vite-plugin-mkcert";

export default defineConfig(({ mode }) => {
  console.log(mode);
  switch (mode) {
    case "android-debuggable":
    case "staging":
      return {
        define: {
          "process.env": {},
        },
        server: {
          port: 3000,
        },
        build: {
          outDir: "build",
          emptyOutDir: true,
          manifest: true,
          minify: false,
          sourcemap: true,
          ssr: false,
          polyfillModulePreload: true,
          target: "es2018",
        },
        resolve: {
          alias: {
            "~": path.resolve(__dirname, "src"),
          },
        },
        plugins: [
          react(),
          legacy({
            targets: ["Chrome >= 50"],
          }),
        ]
      };
    case "development":
      return {
        define: {
          "process.env": {},
        },
        server: {
          port: 3000,
          host: "qlarr.app",
        },
        build: {
          outDir: "build",
        },
        resolve: {
          alias: {
            "~": path.resolve(__dirname, "src"),
          },
        },
        plugins: [react(), mkcert()],
      };
    case "android":
    default:
      return {
        define: {
          "process.env": {},
        },
        server: {
          port: 3000,
        },
        build: {
          outDir: "build",
          output: {
            manualChunks: undefined, // Disable automatic chunk splitting
          },
          target: 'es2015',
          polyfillDynamicImport: false,
        },
        resolve: {
          alias: {
            "~": path.resolve(__dirname, "src"),
          },
        },
        plugins: [
          react(),
          legacy({
            targets: ["Chrome >= 50"],
          }),
        ],
      };
  }
});
