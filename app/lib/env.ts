// app/lib/env.ts
import type { Env } from "../server/types";

export function getEnv(env: Env) {
  // Provide typed, trimmed env access with safe fallbacks
  return {
    ADSENSE_CLIENT: (env.ADSENSE_CLIENT || "").trim(),
    APP_BASE_URL: (env.APP_BASE_URL || "").trim(),
    SMTP_HOST: (env.SMTP_HOST || "").trim(),
    SMTP_PORT: (env.SMTP_PORT || "").trim(),
    SMTP_USER: (env.SMTP_USER || "").trim(),
    SMTP_PASS: (env.SMTP_PASS || "").trim(),
    SMTP_FROM: (env.SMTP_FROM || "").trim(),
    GOOGLE_CLIENT_ID: (env.GOOGLE_CLIENT_ID || "").trim(),
    GOOGLE_CLIENT_SECRET: (env.GOOGLE_CLIENT_SECRET || "").trim(),
    GOOGLE_REDIRECT_URI: (env.GOOGLE_REDIRECT_URI || "").trim(),
  };
}

export function requireEnv(value: string | undefined, name: string) {
  if (!value || !value.trim()) throw new Error(`Missing required env var: ${name}`);
  return value.trim();
}
