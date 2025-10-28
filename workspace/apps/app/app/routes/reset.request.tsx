// app/routes/reset.request.tsx

import type { ActionFunctionArgs } from "react-router";
import { Form, useActionData } from "react-router";
import { emailSchema } from "../lib/z";
import { findUserByEmail } from "../server/auth";
import { createResetToken, sendResetEmail } from "../server/email";
import { getEnvFromContext } from "~/server/db";

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  if (!emailSchema.safeParse(email).success) return { ok: false, message: "Enter a valid email" };
  const env = getEnvFromContext(context);
  const user = await findUserByEmail(env, email);
  if (user) {
    const token = await createResetToken(env, user.id);
    const base = env.APP_BASE_URL || new URL(request.url).origin;
    const link = `${base}/reset/${token}`;
    await sendResetEmail(env, email, link);
  }
  return { ok: true, message: "If that email exists, a link was sent." };
}

export default function ResetRequest() {
  const data = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Reset password</h1>
      {data?.message && <p className="mb-2 text-green-700">{data.message}</p>}
      <Form method="post" className="flex gap-2">
        <input name="email" type="email" placeholder="you@example.com" className="border p-2 rounded flex-1" />
        <button className="bg-black text-white rounded px-4">Send</button>
      </Form>
    </div>
  );
}
