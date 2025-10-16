// app/routes/logout.tsx
import { redirect, type ActionFunctionArgs } from "react-router";
import { destroySession } from "../server/session";

export async function action({ context, request }: ActionFunctionArgs) {
  const cookie = await destroySession({ request, cloudflare: context.cloudflare });
  return redirect("/", { headers: { "Set-Cookie": cookie } });
}

export default function Logout() {
  return null;
}
