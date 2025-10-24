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
import { Plus, BookOpen, MoreVertical, ChevronRight, Edit, Library } from "lucide-react";
import * as projectService from "../services/project.service";
import * as reviewService from "../services/review.service";

export async function loader({ context, request }: LoaderFunctionArgs) {
  // Check if user is logged in, if not redirect to login
  const session = await getSession({ request, cloudflare: context.cloudflare });
  if (!session) {
    return redirect("/login");
  }

  const userId = session.userId;
  const projects = await projectService.listProjects(context.cloudflare.env, userId);

  // Fetch detailed stats for each project
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const stats = await reviewService.getProjectStats(context.cloudflare.env, project.id, userId);
      return {
        ...project,
        stats,
      };
    })
  );

  return { projects: projectsWithStats };
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
      <div className="text-center space-y-3 py-6">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
          Your Learning Journey
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Track your progress, master new skills, and build knowledge that lasts with spaced repetition
        </p>
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
                        maxLength={50}
                      />
                      <div className="text-xs text-gray-500 mt-1">Max 50 characters</div>
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
              <Card
                key={p.id}
                className="group hover:shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Link to={`/p/${p.id}`} className="block">
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                          <span className="truncate">{p.name}</span>
                          <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {p.stats && p.stats.total_cards > 0 ? (
                            <>
                              {p.stats.due_now > 0 && (
                                <>
                                  <span className="font-semibold text-destructive">{p.stats.due_now} due</span>
                                  <span className="mx-2">·</span>
                                </>
                              )}
                              <span>{p.stats.total_cards} cards total</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">No cards yet</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="relative group/menu flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Project options"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-background rounded-lg shadow-lg border opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                          <Link
                            to={`/p/${p.id}/edit`}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent rounded-t-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Project
                          </Link>
                          <Link
                            to={`/p/${p.id}/cards`}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent rounded-b-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Library className="h-4 w-4" />
                            Manage Cards
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {p.stats && p.stats.total_cards > 0 && (
                    <CardContent className="pt-0">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* Mastered Cards */}
                        <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {p.stats.mastered_cards}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">⭐ Mastered</div>
                        </div>

                        {/* Learning Cards */}
                        <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            {p.stats.learning_cards}
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 text-center">
                            📖 Learning
                          </div>
                        </div>

                        {/* New Cards */}
                        <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {p.stats.new_cards}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">✨ New</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {p.stats.total_cards > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 h-2 bg-muted rounded-full overflow-hidden">
                            {p.stats.mastered_cards > 0 && (
                              <div
                                className="bg-green-500 h-full transition-all"
                                style={{ width: `${(p.stats.mastered_cards / p.stats.total_cards) * 100}%` }}
                              />
                            )}
                            {p.stats.learning_cards > 0 && (
                              <div
                                className="bg-yellow-400 h-full transition-all"
                                style={{ width: `${(p.stats.learning_cards / p.stats.total_cards) * 100}%` }}
                              />
                            )}
                            {p.stats.new_cards > 0 && (
                              <div
                                className="bg-purple-400 h-full transition-all"
                                style={{ width: `${(p.stats.new_cards / p.stats.total_cards) * 100}%` }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Link>
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
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 mt-1">Max 50 characters</div>
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
