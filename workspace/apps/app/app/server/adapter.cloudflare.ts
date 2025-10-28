// app/server/adapter.cloudflare.ts
/**
 * Cloudflare Workers adapter - returns actual Cloudflare bindings
 * Used only in production Cloudflare Workers environment
 */

import type { AppLoadContext } from "react-router";
import type { Env } from "./types";

/**
 * Get Env from context for Cloudflare Workers
 * In Cloudflare Workers, the bindings are directly available in the context
 */
export function getEnv(context: AppLoadContext): Env {
  // In Cloudflare Workers, cloudflare.env contains the bindings
  if (context.cloudflare?.env) {
    return context.cloudflare.env as Env;
  }

  // Fallback: check if bindings are directly on context
  return context as unknown as Env;
}
