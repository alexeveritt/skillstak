import * as Sentry from "@sentry/react";

export function initSentry() {
  console.log("[Sentry Client] Initializing...");
  console.log("[Sentry Client] window type:", typeof window);

  if (typeof window === "undefined") {
    console.log("[Sentry Client] Window is undefined, skipping");
    return;
  }

  console.log("[Sentry Client] window.ENV:", (window as any).ENV);

  // Type-safe access to window.ENV
  const dsn = (window as any).ENV?.SENTRY_DSN;
  console.log("[Sentry Client] DSN:", dsn);

  if (!dsn) {
    console.warn("SENTRY_DSN not configured, skipping Sentry initialization");
    return;
  }

  const environment = (window as any).ENV?.SENTRY_ENVIRONMENT || "development";
  console.log("[Sentry Client] Environment:", environment);

  try {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    console.log("[Sentry Client] ✅ Initialized successfully!");
  } catch (error) {
    console.error("[Sentry Client] ❌ Failed to initialize:", error);
  }
}
