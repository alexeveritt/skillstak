// app/routes/_index.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, useLoaderData, redirect, useActionData, useNavigation } from "react-router";
import { getSession, requireUserId } from "../server/session";
import { q, run } from "../server/db";
import { projectSchema } from "../lib/z";
import { newId } from "../lib/id";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export async function loader({ context, request }: LoaderFunctionArgs) {
  // Check if user is logged in, if not redirect to login
  const session = await getSession({ request, cloudflare: context.cloudflare });
  if (!session) {
    return redirect("/login");
  }

  const userId = session.userId;
  const projects = await q<{ id: string; name: string; total: number; due: number }>(
    context.cloudflare?.env,
    `SELECT p.id, p.name,
            (SELECT COUNT(*) FROM card c WHERE c.project_id = p.id) AS total,
            (SELECT COUNT(*) FROM card c JOIN card_schedule s ON s.card_id=c.id WHERE c.project_id = p.id AND s.due_at <= datetime('now')) AS due
     FROM project p WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    [userId]
  );
  return { projects };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const form = await request.formData();
  const name = String(form.get("name") || "");
  const parsed = projectSchema.safeParse({ name });
  if (!parsed.success) return { error: "Enter a name" };
  const id = newId();
  await run(context.cloudflare?.env, "INSERT INTO project (id, user_id, name) VALUES (?, ?, ?)", [id, userId, name]);
  return null;
}

export default function Home() {
  const { projects } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input when form is successfully submitted
  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.error) {
      setName("");
      inputRef.current?.focus();
    }
  }, [navigation.state, actionData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your projects</h1>
        <p className="text-muted-foreground">Manage your learning projects and flashcards</p>
      </div>

      <div className="grid gap-4">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                <Link to={`/p/${p.id}`} className="hover:underline">
                  {p.name}
                </Link>
              </CardTitle>
              <CardDescription>
                {p.due} due · {p.total} cards total
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="default" size="sm" asChild>
                <Link to={`/p/${p.id}/review`}>Practice</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/p/${p.id}/edit`}>Edit</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Start a new learning project</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex gap-2">
            <Input
              ref={inputRef}
              name="name"
              placeholder="Project name"
              className="flex-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit">Add Project</Button>
          </Form>
          {actionData?.error && <p className="text-destructive text-sm mt-2">{actionData.error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
