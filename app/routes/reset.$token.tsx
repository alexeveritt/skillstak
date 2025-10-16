
// app/routes/reset.$token.tsx
import { Form, redirect, useLoaderData, useActionData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { passwordSchema } from "../lib/z";
import { consumeResetToken } from "../server/email";
import { run } from "../server/db";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const userId = await consumeResetToken(context.cloudflare.env, params.token!);
  return { userId };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const userId = String(form.get("userId"));
  const pass = String(form.get("password"));
  if (!userId || !passwordSchema.safeParse(pass).success) return { error: "Invalid input" };
  const { Scrypt } = await import("oslo/password");
  const hash = await new Scrypt().hash(pass);
  await run(context.cloudflare.env, "UPDATE auth_key SET hashed_password = ? WHERE user_id = ? AND id LIKE 'email:%'", [hash, userId]);
  return redirect("/login");
}

export default function ResetConsume() {
  const { userId } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  if (!userId) return <p>Invalid or expired link.</p>;
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Set new password</h1>
      {data?.error && <p className="text-red-600">{data.error}</p>}
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="userId" value={userId} />
        <input name="password" type="password" placeholder="New password" className="border p-2 rounded" />
        <button className="bg-black text-white rounded px-4 py-2">Save</button>
      </Form>
    </div>
  );
}
