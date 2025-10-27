// vite.config.ts

import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isCloudflareMode = process.env.CLOUDFLARE_MODE === "true";

  return {
    plugins: [reactRouter()],
    // Use webworker target only in Cloudflare mode
    ssr: {
      target: isCloudflareMode ? "webworker" : "node",
      noExternal: isCloudflareMode ? true : undefined,
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./app"),
      },
    },
  };
});
