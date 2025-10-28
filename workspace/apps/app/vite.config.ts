// vite.config.ts

import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { defineConfig, Plugin } from "vite";
import { config } from "dotenv";

// Load environment variables from .env file
config();

export default defineConfig(() => {
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

        // Replace sentry.server with Cloudflare version
        // Handle both relative and absolute imports
        if (
          source === "./sentry.server" ||
          source === "./sentry.server.ts" ||
          source === "~/sentry.server" ||
          source.endsWith("/sentry.server")
        ) {
          return path.resolve(__dirname, "./app/sentry.server.cloudflare.ts");
        }

        // Block Node.js built-ins and Node-specific packages
        if (source === "better-sqlite3" || source === "node:stream" || source.startsWith("node:")) {
          return { id: source, external: true };
        }

        // Mark Sentry Node packages as external (they won't be bundled)
        if (source === "@sentry/node" || source === "@sentry/node-core" || source.startsWith("@sentry/node/")) {
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
      noExternal: isCloudflareMode ? ["@sentry/react", "@sentry/cloudflare"] : undefined,
      // Only mark these as external in Cloudflare mode
      ...(isCloudflareMode && {
        external: ["better-sqlite3", "node:stream", "node:fs", "node:path", "@sentry/node", "@sentry/node-core"],
      }),
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./app"),
      },
    },
  };
});
