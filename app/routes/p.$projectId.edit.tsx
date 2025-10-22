import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { useState } from "react";
import { requireUserId } from "../server/session";
import { DeleteProjectModal } from "../components/DeleteProjectModal";
import { ColorPicker } from "../components/ColorPicker";
import * as projectService from "../services/project.service";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const project = await projectService.getProject(context.cloudflare.env, projectId, userId);

  if (!project) {
    throw new Response("Project not found", { status: 404 });
  }

  return { project };
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

  if (!name || name.trim().length === 0) {
    return { error: "Project name is required" };
  }

  await projectService.updateProject(context.cloudflare.env, projectId, userId, name.trim(), color, foregroundColor);
  return redirect(`/p/${projectId}`);
}

export default function EditProject() {
  const { project } = useLoaderData<typeof loader>();
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
          />
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
        <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-3">
          Deleting this project will also delete all its cards. This action cannot be undone.
        </p>
        <DeleteProjectModal projectName={project.name} />
      </div>
    </div>
  );
}
