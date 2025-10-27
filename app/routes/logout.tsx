// app/routes/logout.tsx
import { type ActionFunctionArgs, redirect } from "react-router";
import { destroySession } from "../server/session";

export async function action({ context, request }: ActionFunctionArgs) {
  const cookie = await destroySession(context, request);
  return redirect("/", { headers: { "Set-Cookie": cookie } });
}

export default function Logout() {
  return null;
}
