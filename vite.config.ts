// vite.config.ts

import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig, Plugin } from "vite";

export default defineConfig(({ mode }) => {
  const isCloudflareMode = process.env.CLOUDFLARE_MODE === "true";

  // Custom plugin to handle Cloudflare-specific module resolution
  const cloudflareAdapterPlugin = (): Plugin => ({
    name: "cloudflare-adapter",
    enforce: "pre",
    resolveId(source, importer) {
      if (isCloudflareMode) {
        // Replace adapter imports with Cloudflare version
        if (source === "~/server/adapter" || source === "./adapter" || source.endsWith("/server/adapter")) {
          return path.resolve(__dirname, "./app/server/adapter.cloudflare.ts");
        }
        // Block Node.js built-ins and Node-specific packages
        if (source === "better-sqlite3" || source === "node:stream" || source.startsWith("node:")) {
          return { id: source, external: true };
        }
      }
      return null;
    },
  });

  return {
    plugins: [cloudflareAdapterPlugin(), reactRouter()],
    // Use webworker target only in Cloudflare mode
    ssr: {
      target: isCloudflareMode ? "webworker" : "node",
      noExternal: isCloudflareMode ? true : undefined,
      // Only mark these as external in Cloudflare mode
      ...(isCloudflareMode && {
        external: ["better-sqlite3", "node:stream", "node:fs", "node:path"],
      }),
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./app"),
      },
    },
  };
});
