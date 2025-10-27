// Debug route to check session status
import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { getEnv } from "~/server/adapter";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const env = getEnv(context);

  // Get all session keys from LocalKV
  const keys = await env.SKILLSTAK_SESSIONS.list({ prefix: "s:" });

  // Get cookie from request
  const cookieHeader = request.headers.get("Cookie");

  return json({
    cookieHeader,
    sessionKeys: keys.keys.map(k => k.name),
    cloudflareEnvExists: !!context.cloudflare?.env,
  });
}

export default function DebugSession() {
  return <div>Debug session data (check network tab for JSON response)</div>;
}

