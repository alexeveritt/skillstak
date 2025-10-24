import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData, useMatches } from "react-router";
import { useState } from "react";
import { requireUserId } from "../server/session";
import { DeleteProjectModal } from "../components/DeleteProjectModal";
import { ColorPicker } from "../components/ColorPicker";
import * as projectService from "../services/project.service";
import { projectSchema } from "../lib/z";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  await requireUserId({ request, cloudflare: context.cloudflare });
  return {};
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

  const handleColorChange = (bg: string, fg: string) => {
    setSelectedColor(bg);
    setSelectedForegroundColor(fg);
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold mb-2">Edit Project</h1>
      <Form method="post" className="grid gap-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={project.name}
            className="w-full border rounded px-3 py-2"
            required
            maxLength={50}
          />
          <div className="text-xs text-gray-500 mt-1">Max 50 characters</div>
        </div>

        <div className="mt-2">
          <ColorPicker value={selectedColor} onChange={handleColorChange} />
          <input type="hidden" name="color" value={selectedColor} />
          <input type="hidden" name="foregroundColor" value={selectedForegroundColor} />
        </div>

        {/* Preview Card */}
        <div className="mt-2">
          <div className="text-sm font-medium mb-2">Preview</div>
          <div
            className="rounded-lg p-4 border-2"
            style={{ backgroundColor: selectedColor, color: selectedForegroundColor }}
          >
            <div className="font-medium">Front of card</div>
            <div className="text-sm mt-2">Back of card</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">
            Save Changes
          </button>
          <a href={`/p/${project.id}`} className="underline">
            Cancel
          </a>
        </div>
      </Form>
      <hr className="my-8" />
      <div>
        <h2 className="text-lg font-semibold mb-2">Import & Export Cards</h2>
        <p className="text-sm text-gray-600 mb-3">
          Import cards from a JSON file or export your existing cards to share or backup.
        </p>
        <div className="flex items-center gap-2">
          <a
            href={`/p/${project.id}/cards/import`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Import Cards
          </a>
          <a
            href={`/p/${project.id}/cards/export`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export Cards
          </a>
        </div>
      </div>
      <hr className="my-8" />
      <div>
        <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-3">
          Deleting this project will also delete all its cards. This action cannot be undone.
        </p>
        <DeleteProjectModal projectName={project.name} />
      </div>
    </div>
  );
}
