// Cloudflare-compatible Sentry implementation
// Cloudflare Workers don't support the same Sentry initialization as Node.js
// For now, we'll use a no-op implementation and log to console
// In production, consider using Cloudflare's native error tracking or Sentry Pages integration

let sentryInitialized = false;

export function initSentry(dsn?: string, environment?: string) {
  console.log("[Sentry Server Cloudflare] Initializing...");
  console.log("[Sentry Server Cloudflare] DSN:", dsn);
  console.log("[Sentry Server Cloudflare] Environment:", environment);

  if (sentryInitialized) {
    console.log("[Sentry Server Cloudflare] Already initialized, skipping");
    return;
  }

  if (!dsn) {
    console.warn("[Sentry Server Cloudflare] SENTRY_DSN not configured");
    return;
  }

  // Mark as initialized to prevent repeated attempts
  sentryInitialized = true;
  console.log("[Sentry Server Cloudflare] ✅ Initialized (no-op for Cloudflare Workers)");
}

export function captureException(error: unknown) {
  console.error("[Sentry Server Cloudflare] Exception:", error);
  // In Cloudflare Workers, errors are automatically captured by the runtime
  // You can also use Cloudflare's native error tracking
}

export function captureMessage(message: string) {
  console.log("[Sentry Server Cloudflare] Message:", message);
  // In Cloudflare Workers, consider using console.log or Cloudflare Analytics
}
