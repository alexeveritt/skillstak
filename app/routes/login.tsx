// app/routes/login.tsx
import { Form, redirect, useActionData, Link } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { emailSchema } from "../lib/z";
import { verifyPassword } from "../server/auth";
import { createSession } from "../server/session";

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").toLowerCase();
  const password = String(form.get("password") || "");
  if (!emailSchema.safeParse(email).success) return { error: "Invalid email" };
  const userId = await verifyPassword(context.cloudflare.env, email, password);
  if (!userId) return { error: "Wrong email or password" };
  const setCookie = await createSession({ request, cloudflare: context.cloudflare }, userId);
  return redirect("/");
}

export default function Login() {
  const data = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Log in</h1>
      {data?.error && <p className="text-red-600 mb-2">{data.error}</p>}
      <Form method="post" className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="you@example.com" className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" className="border p-2 rounded" />
        <button className="bg-black text-white rounded px-4 py-2">Log in</button>
      </Form>
      <p className="mt-2 text-sm">
        <Link to="/reset">Forgot password?</Link>
      </p>
    </div>
  );
}
