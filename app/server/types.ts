// app/server/types.ts
import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export type Env = {
  SPACED_DB: D1Database;
  SESSIONS: KVNamespace;
  ADSENSE_CLIENT?: string;
  APP_BASE_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REDIRECT_URI?: string;
};

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}
