// app/routes/signup.tsx
import { Form, redirect, useActionData } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { emailSchema, passwordSchema } from "../lib/z";
import { createUserWithPassword, findUserByEmail } from "../server/auth";
import { createSession } from "../server/session";

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").toLowerCase();
  const password = String(form.get("password") || "");
  const emailOk = emailSchema.safeParse(email).success;
  const passOk = passwordSchema.safeParse(password).success;
  if (!emailOk || !passOk) return { error: "Invalid email or password" };
  const existing = await findUserByEmail(context.cloudflare.env, email);
  if (existing) return { error: "Email in use" };
  const user = await createUserWithPassword(context.cloudflare.env, email, password);
  const setCookie = await createSession({ request, cloudflare: context.cloudflare }, user.id);
  return redirect("/", { headers: { "Set-Cookie": setCookie } });
}

export default function Signup() {
  const data = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {data?.error && <p className="text-red-600 mb-2">{data.error}</p>}
      <Form method="post" className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="you@example.com" className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" className="border p-2 rounded" />
        <button className="bg-black text-white rounded px-4 py-2">Sign up</button>
      </Form>
    </div>
  );
}
