// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [
    reactRouter({
      appDirectory: "app",
    }),
  ],
  // Cloudflare-compatible SSR target
  ssr: { target: "webworker" },
});
