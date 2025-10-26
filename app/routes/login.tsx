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

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") || "").toLowerCase();
  const password = String(form.get("password") || "");
  if (!emailSchema.safeParse(email).success) return { error: "Invalid email" };
  const userId = await verifyPassword(context.cloudflare.env, email, password);
  if (!userId) return { error: "Wrong email or password" };
  const setCookie = await createSession({ request, cloudflare: context.cloudflare }, userId);
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
