import * as Sentry from "@sentry/node";

let sentryInitialized = false;

export function initSentry(dsn?: string, environment?: string) {
  console.log("[Sentry Server Node] Initializing...");
  console.log("[Sentry Server Node] DSN:", dsn);
  console.log("[Sentry Server Node] Environment:", environment);
  console.log("[Sentry Server Node] Already initialized:", sentryInitialized);

  if (sentryInitialized) {
    console.log("[Sentry Server Node] Already initialized, skipping");
    return;
  }

  if (!dsn) {
    console.warn("[Sentry Server Node] SENTRY_DSN not configured, skipping Sentry initialization");
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: environment || "development",
      tracesSampleRate: 1.0,
    });
    sentryInitialized = true;
    console.log("[Sentry Server Node] ✅ Initialized successfully!");
  } catch (error) {
    console.error("[Sentry Server Node] ❌ Failed to initialize:", error);
  }
}

export function captureException(error: unknown) {
  console.log("[Sentry Server Node] Capturing exception:", error);
  Sentry.captureException(error);
}

export function captureMessage(message: string) {
  console.log("[Sentry Server Node] Capturing message:", message);
  Sentry.captureMessage(message);
}
