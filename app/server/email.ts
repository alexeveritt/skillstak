import type { Env } from "./types";
import { ulid } from "ulidx";

export async function createResetToken(env: Env, userId: string) {
  const token = ulid();
  await env.SKILLSTAK_SESSIONS.put(`reset:${token}`, userId, { expirationTtl: 60 * 30 });
  return token;
}

export async function consumeResetToken(env: Env, token: string) {
  const key = `reset:${token}`;
  const userId = await env.SKILLSTAK_SESSIONS.get(key);
  if (!userId) return null;
  await env.SKILLSTAK_SESSIONS.delete(key);
  return userId;
}

// For production use a provider (Resend/SendGrid) or SMTP relay.
export async function sendResetEmail(env: Env, email: string, link: string) {
  // Placeholder: log or integrate your mail provider.
  console.log("Reset link for", email, link);
}
