// app/routes/_index.tsx
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, Link, useLoaderData, redirect, useActionData, useNavigation } from "react-router";
import { getSession, requireUserId } from "../server/session";
import { projectSchema } from "../lib/z";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Plus, BookOpen } from "lucide-react";
import * as projectService from "../services/project.service";

export async function loader({ context, request }: LoaderFunctionArgs) {
  // Check if user is logged in, if not redirect to login
  const session = await getSession({ request, cloudflare: context.cloudflare });
  if (!session) {
    return redirect("/login");
  }

  const userId = session.userId;
  const projects = await projectService.listProjects(context.cloudflare.env, userId);
  return { projects };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const form = await request.formData();
  const name = String(form.get("name") || "");
  const parsed = projectSchema.safeParse({ name });
  if (!parsed.success) return { error: "Enter a name" };

  await projectService.createProject(context.cloudflare.env, userId, name);
  return null;
}

export default function Home() {
  const { projects } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset input and close dialog when form is successfully submitted
  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.error) {
      setName("");
      setIsDialogOpen(false);
    }
  }, [navigation.state, actionData]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isDialogOpen]);

  const hasProjects = projects.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your projects</h1>
          <p className="text-muted-foreground">Manage your learning projects and flashcards</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Start a new learning project to organize your flashcards by topic or subject.
              </DialogDescription>
            </DialogHeader>
            <Form method="post" className="space-y-4">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  name="name"
                  placeholder="e.g., Spanish Vocabulary, React Hooks, Biology 101"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {actionData?.error && <p className="text-destructive text-sm">{actionData.error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!hasProjects ? (
        <Card className="border-dashed">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to SkillStak!</CardTitle>
            <CardDescription className="text-base">Get started with spaced repetition learning</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              SkillStak uses spaced repetition to help you learn and retain information more effectively. Create your
              first project to organize flashcards by topic, then add cards with questions and answers. Our algorithm
              will schedule reviews at optimal intervals to maximize retention.
            </p>
            <div className="pt-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Start a new learning project to organize your flashcards by topic or subject.
                    </DialogDescription>
                  </DialogHeader>
                  <Form method="post" className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        ref={inputRef}
                        name="name"
                        placeholder="e.g., Spanish Vocabulary, React Hooks, Biology 101"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {actionData?.error && <p className="text-destructive text-sm">{actionData.error}</p>}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Project</Button>
                    </DialogFooter>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new learning project to organize your flashcards by topic or subject.
                </DialogDescription>
              </DialogHeader>
              <Form method="post" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={inputRef}
                    name="name"
                    placeholder="e.g., Spanish Vocabulary, React Hooks, Biology 101"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {actionData?.error && <p className="text-destructive text-sm">{actionData.error}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Project</Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
