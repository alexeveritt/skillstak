// app/routes/signup.tsx

import type { ActionFunctionArgs } from "react-router";
import { Form, redirect, useActionData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { emailSchema, passwordSchema } from "../lib/z";
import { createUserWithPassword, findUserByEmail } from "../server/auth";
import { createSession } from "../server/session";
import { getEnvFromContext } from "~/server/db";

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").toLowerCase();
  const password = String(form.get("password") || "");
  const emailOk = emailSchema.safeParse(email).success;
  const passOk = passwordSchema.safeParse(password).success;
  if (!emailOk || !passOk) return { error: "Invalid email or password" };
  const env = getEnvFromContext(context);
  const existing = await findUserByEmail(env, email);
  if (existing) return { error: "Email in use" };
  const user = await createUserWithPassword(env, email, password);
  const setCookie = await createSession(context, user.id);
  return redirect("/", { headers: { "Set-Cookie": setCookie } });
}

export default function Signup() {
  const data = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Sign up to start creating your learning projects</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.error && (
            <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-md">{data.error}</p>
          )}
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Password" />
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
