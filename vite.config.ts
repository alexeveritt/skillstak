// vite.config.ts

import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  // Cloudflare-compatible SSR target
  ssr: {
    target: "webworker",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
