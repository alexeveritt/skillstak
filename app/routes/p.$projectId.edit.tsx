import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, redirect, useLoaderData } from "react-router";
import { requireUserId } from "../server/session";
import { q } from "../server/db";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId({ request, cloudflare: context.cloudflare });
  const projectId = params.projectId!;

  const [project] = await q<{ id: string; name: string }>(
    context.cloudflare.env,
    "SELECT id, name FROM project WHERE id = ? AND user_id = ?",
    [projectId, userId]
  );

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
    await q(context.cloudflare.env, "DELETE FROM card WHERE project_id = ?", [projectId]);
    await q(context.cloudflare.env, "DELETE FROM project WHERE id = ? AND user_id = ?", [projectId, userId]);
    return redirect("/");
  }

  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0) {
    return { error: "Project name is required" };
  }

  await q(context.cloudflare.env, "UPDATE project SET name = ? WHERE id = ? AND user_id = ?", [
    name.trim(),
    projectId,
    userId,
  ]);
  return redirect(`/p/${projectId}`);
}

export default function EditProject() {
  const { project } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Edit Project</h1>
      <Form method="post" className="space-y-4">
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
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save Changes
          </button>
          <a href={`/p/${project.id}`} className="border px-4 py-2 rounded hover:bg-gray-50">
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
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={(e) => {
              if (!confirm("Are you sure you want to delete this project and all its cards?")) e.preventDefault();
            }}
          >
            Delete Project
          </button>
        </Form>
      </div>
    </div>
  );
}
