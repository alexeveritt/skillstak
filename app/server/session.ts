import type { Env } from "./types";
import { createCookie, type CookieOptions, type CookieSerializeOptions } from "react-router";
import { ulid } from "ulidx";

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

export async function getSession(context: any): Promise<SessionData | null> {
  const cookie = await SESSION_COOKIE.parse(context.request.headers.get("Cookie"));
  if (!cookie) return null;
  const { env } = context.cloudflare;
  const data = (await env.SESSIONS.get(`s:${cookie}`, { type: "json" })) as SessionData | null;
  return data ?? null;
}

export async function requireUserId(context: any): Promise<string> {
  const s = await getSession(context);
  if (!s) throw new Response("Unauthorized", { status: 401 });
  return s.userId;
}

export async function createSession(context: any, userId: string) {
  const id = ulid();
  const { env } = context.cloudflare;
  await env.SESSIONS.put(`s:${id}`, JSON.stringify({ userId }), { expirationTtl: 60 * 60 * 24 * 30 });
  return SESSION_COOKIE.serialize(id);
}

export async function destroySession(context: any) {
  const cookie = await SESSION_COOKIE.parse(context.request.headers.get("Cookie"));
  if (cookie) await context.cloudflare.env.SESSIONS.delete(`s:${cookie}`);
  return SESSION_COOKIE.serialize("", { maxAge: 0 } satisfies CookieSerializeOptions);
}
