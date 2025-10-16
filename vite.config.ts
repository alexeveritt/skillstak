// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [reactRouter()],
  // Cloudflare-compatible SSR target
  ssr: {
    target: "webworker",
  },
});
