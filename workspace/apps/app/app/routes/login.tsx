// app/routes/login.tsx

import type { ActionFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { emailSchema } from "../lib/z";
import { verifyPassword } from "../server/auth";
import { createSession } from "../server/session";
import { useTranslation } from "react-i18next";
import { getEnvFromContext } from "~/server/db";

export async function action({ request, context }: ActionFunctionArgs) {
  console.log(`[Login ACTION] ===== LOGIN ACTION CALLED =====`);
  const form = await request.formData();
  const email = String(form.get("email") || "").toLowerCase();
  const password = String(form.get("password") || "");
  console.log(`[Login] Attempting login for email: ${email}`);

  if (!emailSchema.safeParse(email).success) {
    console.log(`[Login] Invalid email format`);
    return { error: "Invalid email" };
  }

  const env = getEnvFromContext(context);
  const userId = await verifyPassword(env, email, password);
  console.log(`[Login] verifyPassword result: userId=${userId}`);

  if (!userId) {
    console.log(`[Login] Authentication failed`);
    return { error: "Wrong email or password" };
  }

  const setCookie = await createSession(context, userId);
  console.log(`[Login] Session created, redirecting to / with Set-Cookie: ${setCookie}`);

  return redirect("/", {
    headers: {
      "Set-Cookie": setCookie,
    },
  });
}

export default function Login() {
  const { t } = useTranslation();
  const data = useActionData<typeof action>();
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.error && (
            <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-md">{data.error}</p>
          )}
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("login.emailPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input id="password" name="password" type="password" placeholder={t("login.passwordPlaceholder")} />
            </div>
            <Button type="submit" className="w-full">
              {t("login.button")}
            </Button>
          </Form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            <Link to="/reset" className="hover:underline">
              {t("login.forgotPassword")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
