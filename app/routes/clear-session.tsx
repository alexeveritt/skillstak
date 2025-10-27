// Clear session cookie route
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { destroySession } from "../server/session";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const cookie = await destroySession(context, request);
  return redirect("/login", { headers: { "Set-Cookie": cookie } });
}

export default function ClearSession() {
  return null;
}

