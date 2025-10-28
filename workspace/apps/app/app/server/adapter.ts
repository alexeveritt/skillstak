// app/server/adapter.ts
/**
 * Adapter layer to bridge Node.js dev mode and Cloudflare Workers runtime
 * This allows running `npm run dev` for debugging while keeping Wrangler compatibility
 */

import type { AppLoadContext } from "react-router";
import type { Env } from "./types";
import Database from "better-sqlite3";
import * as fs from "node:fs";
import * as path from "node:path";

// In-memory KV store for local development
class LocalKV {
  private store = new Map<string, string>();
  private instanceId: string;

  constructor() {
    this.instanceId = Math.random().toString(36).substring(7);
    console.log(`[LocalKV] New instance created: ${this.instanceId}`);
  }

  async get(key: string, options?: { type?: "text" | "json" | "arrayBuffer" | "stream" }) {
    const value = this.store.get(key);
    console.log(
      `[LocalKV:${this.instanceId}] GET key="${key}", found=${!!value}, value=${value}, storeSize=${this.store.size}`
    );
    if (!value) return null;

    if (options?.type === "json") {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(`[LocalKV:${this.instanceId}] Failed to parse JSON for key="${key}":`, e);
        return null;
      }
    }
    return value;
  }

  async put(key: string, value: string, options?: { expirationTtl?: number }) {
    console.log(`[LocalKV:${this.instanceId}] PUT key="${key}", value=${value}, ttl=${options?.expirationTtl}`);
    this.store.set(key, value);
    console.log(
      `[LocalKV:${this.instanceId}] PUT complete, storeSize=${this.store.size}, allKeys=${Array.from(this.store.keys()).join(", ")}`
    );

    // Simple expiration handling
    // Note: In dev mode, we don't actually need to expire sessions since the server restarts frequently
    // The TTL is just for compatibility with Cloudflare KV. If we do set a timeout, cap it to Node.js max (24.8 days)
    if (options?.expirationTtl) {
      const maxTimeout = 2147483647; // Max 32-bit signed integer (Node.js setTimeout limit in ms)
      const ttlMs = options.expirationTtl * 1000;
      if (ttlMs < maxTimeout) {
        setTimeout(() => {
          console.log(`[LocalKV:${this.instanceId}] EXPIRED key="${key}"`);
          this.store.delete(key);
        }, ttlMs);
      } else {
        console.log(`[LocalKV:${this.instanceId}] TTL too large (${ttlMs}ms), skipping expiration in dev mode`);
      }
    }
  }

  async delete(key: string) {
    this.store.delete(key);
  }

  async list(options?: { prefix?: string }) {
    const keys = Array.from(this.store.keys());
    const filtered = options?.prefix ? keys.filter((k) => k.startsWith(options.prefix!)) : keys;

    return {
      keys: filtered.map((name) => ({ name })),
      list_complete: true,
    };
  }
}

// Local D1 database wrapper using better-sqlite3
class LocalD1 {
  private db: Database.Database;
  private initialized = false;

  constructor(dbPath: string) {
    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
  }

  private ensureInitialized(): void {
    if (this.initialized) return;

    try {
      const tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='user'").all();
      if (tables.length === 0) {
        this.initializeSchema();
      }
      this.initialized = true;
    } catch (error) {
      console.error("Error checking database initialization:", error);
      this.initializeSchema();
      this.initialized = true;
    }
  }

  private initializeSchema(): void {
    console.log("📦 Initializing local database schema...");
    const schemaPath = path.join(process.cwd(), "db", "schema.sql");

    if (!fs.existsSync(schemaPath)) {
      console.error("❌ Schema file not found at:", schemaPath);
      return;
    }

    try {
      const schema = fs.readFileSync(schemaPath, "utf8");
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          this.db.exec(statement);
        } catch (error: any) {
          // Ignore "table already exists" errors
          if (!error.message?.includes("already exists")) {
            console.error("Error executing statement:", error.message);
          }
        }
      }

      console.log("✅ Database schema initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize schema:", error);
    }
  }

  prepare(sql: string) {
    this.ensureInitialized();
    const stmt = this.db.prepare(sql);

    return {
      bind: (...params: unknown[]) => {
        return {
          all: async () => {
            try {
              const results = stmt.all(...params);
              return { results, success: true };
            } catch (error) {
              console.error("Database query error:", error);
              throw error;
            }
          },
          first: async () => {
            try {
              const result = stmt.get(...params);
              return result || null;
            } catch (error) {
              console.error("Database query error:", error);
              throw error;
            }
          },
          run: async () => {
            try {
              const result = stmt.run(...params);
              return {
                success: true,
                meta: {
                  changes: result.changes,
                  last_row_id: result.lastInsertRowid,
                },
              };
            } catch (error) {
              console.error("Database query error:", error);
              throw error;
            }
          },
        };
      },
      all: async () => {
        try {
          const results = stmt.all();
          return { results, success: true };
        } catch (error) {
          console.error("Database query error:", error);
          throw error;
        }
      },
      first: async () => {
        try {
          const result = stmt.get();
          return result || null;
        } catch (error) {
          console.error("Database query error:", error);
          throw error;
        }
      },
      run: async () => {
        try {
          const result = stmt.run();
          return {
            success: true,
            meta: {
              changes: result.changes,
              last_row_id: result.lastInsertRowid,
            },
          };
        } catch (error) {
          console.error("Database query error:", error);
          throw error;
        }
      },
    };
  }

  async batch(statements: Array<{ sql: string; params?: unknown[] }>) {
    const results = [];
    for (const stmt of statements) {
      const prepared = this.prepare(stmt.sql);
      const bound = stmt.params ? prepared.bind(...stmt.params) : prepared;
      results.push(await bound.run());
    }
    return results;
  }

  async exec(sql: string) {
    this.db.exec(sql);
  }
}

// Singleton instances - use globalThis to persist across HMR reloads
declare global {
  var __localKV: LocalKV | undefined;
  var __localD1: LocalD1 | undefined;
}

/**
 * Get the environment bindings - either from Cloudflare or local mocks
 */
export function getEnv(context: AppLoadContext): Env {
  console.log("[getEnv] context.cloudflare?.env exists:", !!context.cloudflare?.env);

  // If running on Cloudflare (production or wrangler dev), use real bindings
  if (context.cloudflare?.env) {
    console.log("[getEnv] Using Cloudflare bindings");
    return context.cloudflare.env;
  }

  console.log("[getEnv] Using local mocks");

  // Otherwise, use local mocks for Node.js dev mode
  // Use globalThis to persist across HMR reloads
  if (!globalThis.__localKV) {
    console.log("[getEnv] Creating new LocalKV instance");
    globalThis.__localKV = new LocalKV();
  } else {
    console.log("[getEnv] Reusing existing LocalKV instance");
  }

  if (!globalThis.__localD1) {
    const dbPath = path.join(
      process.cwd(),
      ".wrangler",
      "state",
      "v3",
      "d1",
      "miniflare-D1DatabaseObject",
      "local.sqlite"
    );
    globalThis.__localD1 = new LocalD1(dbPath);
  }

  // Create a mock Env object
  return {
    SKILLSTAK_DB: globalThis.__localD1 as any,
    SKILLSTAK_SESSIONS: globalThis.__localKV as any,
    APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:5173",
    ADSENSE_CLIENT: process.env.ADSENSE_CLIENT,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  };
}

/**
 * Check if running in Cloudflare Workers environment
 */
export function isCloudflareRuntime(context: AppLoadContext): boolean {
  return !!context.cloudflare?.env;
}
