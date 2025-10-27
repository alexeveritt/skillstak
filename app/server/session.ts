import { type CookieOptions, type CookieSerializeOptions, createCookie } from "react-router";
import { ulid } from "ulidx";
import { getEnv } from "./adapter";
import type { AppLoadContext } from "react-router";

const SESSION_COOKIE = createCookie("sr.sid", {
  httpOnly: true,
  sameSite: "lax",
  // In development (localhost), secure should be false to work with HTTP
  // In production (with HTTPS), it should be true
  // Since Cloudflare Workers don't have process.env, we default to false for dev
  secure: false,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} satisfies CookieOptions);

export type SessionData = { userId: string };

export async function getSession(context: AppLoadContext, request: Request): Promise<SessionData | null> {
  const cookie = await SESSION_COOKIE.parse(request.headers.get("Cookie"));
  console.log(`[Session] getSession: cookie=${cookie}`);
  if (!cookie) return null;
  const env = getEnv(context);
  const data = (await env.SKILLSTAK_SESSIONS.get(`s:${cookie}`, { type: "json" })) as SessionData | null;
  console.log(`[Session] getSession: data=${JSON.stringify(data)}`);
  return data ?? null;
}

export async function requireUserId(context: AppLoadContext, request: Request): Promise<string> {
  const s = await getSession(context, request);
  if (!s) throw new Response("Unauthorized", { status: 401 });
  return s.userId;
}

export async function createSession(context: AppLoadContext, userId: string) {
  try {
    const id = ulid();
    console.log(`[Session] createSession: id=${id}, userId=${userId}`);
    const env = getEnv(context);
    console.log(`[Session] About to store session in KV...`);
    await env.SKILLSTAK_SESSIONS.put(`s:${id}`, JSON.stringify({ userId }), { expirationTtl: 60 * 60 * 24 * 30 });
    console.log(`[Session] Session stored successfully`);
    const serialized = SESSION_COOKIE.serialize(id);
    console.log(`[Session] createSession: serialized cookie=${serialized}`);
    return serialized;
  } catch (error) {
    console.error(`[Session] Error creating session:`, error);
    throw error;
  }
}

export async function destroySession(context: AppLoadContext, request: Request) {
  const cookie = await SESSION_COOKIE.parse(request.headers.get("Cookie"));
  if (cookie) {
    const env = getEnv(context);
    await env.SKILLSTAK_SESSIONS.delete(`s:${cookie}`);
  }
  return SESSION_COOKIE.serialize("", { maxAge: 0 } satisfies CookieSerializeOptions);
}
