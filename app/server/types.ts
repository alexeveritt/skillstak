// app/server/types.ts
import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export type Env = {
  SKILLSTAK_DB: D1Database;
  SKILLSTAK_SESSIONS: KVNamespace;
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
