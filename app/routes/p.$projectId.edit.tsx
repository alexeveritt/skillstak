import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData, useMatches, Link } from "react-router";
import { useState } from "react";
import { requireUserId } from "../server/session";
import { DeleteProjectModal } from "../components/DeleteProjectModal";
import { ColorPicker } from "../components/ColorPicker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import * as projectService from "../services/project.service";
import * as reviewService from "../services/review.service";
import { projectSchema } from "../lib/z";
import { FileDown, FileUp, Library, Settings, Trash2 } from "lucide-react";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  // Get card statistics for the cards panel
  const stats = await reviewService.getProjectStats(context.cloudflare.env, projectId, userId);

  return { stats };
}

export async function action({ params, context, request }: ActionFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await projectService.deleteProject(context.cloudflare.env, projectId, userId);
    return redirect("/");
  }

  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || undefined;
  const foregroundColor = (formData.get("foregroundColor") as string) || undefined;

  const parsed = projectSchema.safeParse({ name });
  if (!parsed.success) {
    const errorMsg = parsed.error.errors.map((e) => e.message).join("; ");
    return { error: errorMsg };
  }

  await projectService.updateProject(context.cloudflare.env, projectId, userId, name.trim(), color, foregroundColor);
  return redirect(`/p/${projectId}`);
}

export default function EditProject() {
  const { stats } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;

  if (!project) {
    throw new Error("Project not found");
  }

  const [selectedColor, setSelectedColor] = useState(project.color || "#fef3c7");
  const [selectedForegroundColor, setSelectedForegroundColor] = useState(project.foreground_color || "#78350f");
  const [activeTab, setActiveTab] = useState("settings");

  const handleColorChange = (bg: string, fg: string) => {
    setSelectedColor(bg);
    setSelectedForegroundColor(fg);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Card Pack Settings</h2>
            <Form method="post" className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                  Card Pack Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={project.name}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={50}
                />
                <div className="text-xs text-gray-500 mt-1.5">Maximum 50 characters</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Theme Color</label>
                <ColorPicker value={selectedColor} onChange={handleColorChange} />
                <input type="hidden" name="color" value={selectedColor} />
                <input type="hidden" name="foregroundColor" value={selectedForegroundColor} />
              </div>

              {/* Preview Card */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Preview</label>
                <div
                  className="rounded-lg p-6 border-2 shadow-sm"
                  style={{ backgroundColor: selectedColor, color: selectedForegroundColor }}
                >
                  <div className="font-semibold text-lg mb-2">Front of card</div>
                  <div className="opacity-90">Back of card</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
                <Link
                  to={`/p/${project.id}`}
                  className="text-center px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </Form>
          </div>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards">
          <div className="space-y-4">
            {/* Card Statistics Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Card Overview</h2>
                <Link to={`/p/${project.id}/cards`} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Manage All →
                </Link>
              </div>

              {stats && stats.total_cards > 0 ? (
                <div className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{stats.total_cards}</div>
                      <div className="text-xs font-medium text-blue-600 mt-1">Total</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{stats.mastered_cards}</div>
                      <div className="text-xs font-medium text-green-600 mt-1">Mastered</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-700">{stats.learning_cards}</div>
                      <div className="text-xs font-medium text-yellow-600 mt-1">Learning</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-700">{stats.new_cards}</div>
                      <div className="text-xs font-medium text-purple-600 mt-1">New</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-2 space-y-2">
                    <Link
                      to={`/p/${project.id}/cards/new`}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      + Add New Card
                    </Link>
                    <Link
                      to={`/p/${project.id}/cards`}
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      View All Cards
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📝</div>
                  <p className="text-gray-600 mb-4">No cards yet in this pack</p>
                  <Link
                    to={`/p/${project.id}/cards/new`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Your First Card
                  </Link>
                </div>
              )}
            </div>

            {/* Import/Export Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-2">Import & Export</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share your cards with others or create backups by exporting to JSON format.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  to={`/p/${project.id}/cards/import`}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <FileUp className="w-4 h-4" />
                  Import Cards
                </Link>
                <Link
                  to={`/p/${project.id}/cards/export`}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  Export Cards
                </Link>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Deleting this card pack will permanently remove all {stats?.total_cards || 0} cards. This action cannot be
              undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Warning: This will delete everything associated with "{project.name}"
              </p>
            </div>
            <DeleteProjectModal projectName={project.name} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
