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
    resolveId(source) {
      if (isCloudflareMode) {
        // Block Node.js built-ins
        if (source === "node:stream" || source.startsWith("node:")) {
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
      target: isCloudflareMode ? ("webworker" as const) : ("node" as const),
      // Only mark these as external in Cloudflare mode
      ...(isCloudflareMode && {
        external: ["node:stream", "node:fs", "node:path"],
      }),
    },
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./app"),
      },
    },
  };
});
