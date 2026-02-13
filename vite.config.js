import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";

export default defineConfig(({ mode }) => {
  console.debug(mode);
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
          react({
            jsxImportSource: "@emotion/react",
            babel: {
              plugins: ["@emotion/babel-plugin"],
            },
          }),
          legacy({
            targets: ["Chrome >= 50"],
          }),
        ],
      };
    case "production":
      return {
        define: {
          "process.env": {},
        },
        build: {
          outDir: "build",
          emptyOutDir: true,
          manifest: true,
          minify: true,
          sourcemap: true,
          target: "es2018",
        },
        resolve: {
          alias: {
            "~": path.resolve(__dirname, "src"),
          },
        },
        plugins: [
          react({
            jsxImportSource: "@emotion/react",
            babel: {
              plugins: ["@emotion/babel-plugin"],
            },
          }),
          legacy({
            targets: ["Chrome >= 50"],
          }),
        ],
      };

    case "development":
      return {
        define: {
          "process.env": {},
        },
        server: {
          port: 3000,
          host: "localhost",
        },
        build: {
          outDir: "build",
        },
        resolve: {
          alias: {
            "~": path.resolve(__dirname, "src"),
          },
        },
        plugins: [
          react({
            jsxImportSource: "@emotion/react",
            babel: {
              plugins: ["@emotion/babel-plugin"],
            },
          }),
        ],
      };
    case "android":
    default:
      return {
        define: {
          "process.env": {},
        },
        build: {
          outDir: "build",
          minify: true,
          target: "es2015",
          rollupOptions: {
            output: {
              manualChunks: {
                vendor: ["react", "react-dom", "react-router-dom"],
                mui: ["@mui/material", "@mui/icons-material", "@mui/lab", "@mui/x-date-pickers"],
                editor: ["@tiptap/core", "@tiptap/react", "@tiptap/starter-kit"],
                dnd: ["react-dnd", "react-dnd-html5-backend", "react-dnd-touch-backend"],
              },
            },
          },
        },
        resolve: {
          alias: {
            "~": path.resolve(__dirname, "src"),
          },
        },
        plugins: [
          react({
            jsxImportSource: "@emotion/react",
            babel: {
              plugins: ["@emotion/babel-plugin"],
            },
          }),
          legacy({
            targets: ["Chrome >= 50"],
          }),
        ],
      };
  }
});
