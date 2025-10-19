// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [reactRouter()],
  ssr: {
    target: "webworker",
    noExternal: true,
  },
  build: {
    ssr: "app/entry.server.js",
    outDir: "build/server",
    rollupOptions: {
      output: {
        format: "esm",
        entryFileNames: "[name].js",
      },
    },
  },
});
