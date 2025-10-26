// app/routes/_index.tsx

import { BookOpen, Brain, ChevronRight, Plus, TrendingUp, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { EditMenu } from "~/components/EditMenu";
import { Button } from "~/components/ui/button";
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
import { Input } from "~/components/ui/input";
import { projectSchema } from "../lib/z";
import { getSession, requireUserId } from "../server/session";
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
  // Use translation key for error
  if (!parsed.success) return { error: "home.nameError" };

  await projectService.createProject(context.cloudflare.env, userId, name);
  return null;
}

export default function Home() {
  const { projects } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
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
      {hasProjects && (
        <div className="text-center space-y-3 py-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
            {t("home.yourLearningJourney")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("home.trackProgress")}</p>
        </div>
      )}
      {!hasProjects ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 shadow-lg">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 blur-3xl -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 blur-3xl translate-y-32 -translate-x-32" />

          <div className="relative px-8 py-12 text-center space-y-6">
            {/* Icon section with gradient background */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-50" />
                <div className="relative bg-white dark:bg-gray-900 rounded-full p-6 shadow-xl">
                  <BookOpen
                    className="h-16 w-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                    strokeWidth={2}
                    stroke="url(#gradient)"
                  />
                  <svg width="0" height="0">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="50%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                {t("home.welcome")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("home.intro")}</p>
            </div>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto py-4">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
                <div className="flex justify-center mb-2">
                  <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-300">
                  {t("home.smartLearning")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("home.smartLearningDesc")}</p>
              </div>

              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur rounded-xl p-4 border border-purple-200 dark:border-purple-800 shadow-sm">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-purple-700 dark:text-purple-300">
                  {t("home.trackProgressTitle")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("home.trackProgressDesc")}</p>
              </div>

              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur rounded-xl p-4 border border-pink-200 dark:border-pink-800 shadow-sm">
                <div className="flex justify-center mb-2">
                  <Zap className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1 text-pink-700 dark:text-pink-300">
                  {t("home.stayConsistent")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("home.stayConsistentDesc")}</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    {t("home.createFirstPack")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("home.createNewPackTitle")}</DialogTitle>
                    <DialogDescription>{t("home.createNewPackDesc")}</DialogDescription>
                  </DialogHeader>
                  <Form method="post" className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        ref={inputRef}
                        name="name"
                        placeholder={t("home.packNameExample")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                      />
                      <div className="text-xs text-gray-500 mt-1">{t("home.maxChars")}</div>
                      {actionData?.error && (
                        <div className="text-red-600 text-sm font-medium mb-2">{t(actionData.error)}</div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        {t("home.cancel")}
                      </Button>
                      <Button type="submit">{t("home.create")}</Button>
                    </DialogFooter>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
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
                                  <span className="font-semibold text-destructive">
                                    {p.stats.due_now} {t("home.due")}
                                  </span>
                                  <span className="mx-2">·</span>
                                </>
                              )}
                              <span>
                                {p.stats.total_cards} {t("home.cardsTotal")}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">{t("home.noCardsYet")}</span>
                          )}
                        </CardDescription>
                      </div>
                      <EditMenu projectId={p.id} />
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
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">{`⭐ ${t("home.mastered")}`}</div>
                        </div>

                        {/* Learning Cards */}
                        <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                            {p.stats.learning_cards}
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 text-center">{`📖 ${t("home.learning")}`}</div>
                        </div>

                        {/* New Cards */}
                        <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {p.stats.new_cards}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">{`✨ ${t("home.new")}`}</div>
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
                {t("home.addAnotherPack")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("home.createNewPackTitle")}</DialogTitle>
                <DialogDescription>{t("home.createNewPackDesc")}</DialogDescription>
              </DialogHeader>
              <Form method="post" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={inputRef}
                    name="name"
                    placeholder={t("home.packNameExample")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 mt-1">{t("home.maxChars")}</div>
                  {actionData?.error && (
                    <div className="text-red-600 text-sm font-medium mb-2">{t(actionData.error)}</div>
                  )}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t("home.cancel")}
                  </Button>
                  <Button type="submit">{t("home.create")}</Button>
                </DialogFooter>
              </Form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
