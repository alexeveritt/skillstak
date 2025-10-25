// app/routes/p.$projectId.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, Outlet, useLoaderData, useLocation } from "react-router";
import { EditMenu } from "~/components/EditMenu";
import { requireUserId } from "../server/session";
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

export default function ProjectLayout() {
  const { project } = useLoaderData<typeof loader>();
  const location = useLocation();
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  // Check if we're on the main project page (exact match)
  const isMainProjectPage = location.pathname === `/p/${project.id}`;

  // Determine page subtitle based on current route
  const getPageSubtitle = () => {
    if (location.pathname.includes("/review")) {
      // Use location.search instead of window.location for SSR compatibility
      const searchParams = new URLSearchParams(location.search);
      const mode = searchParams.get("mode");
      return mode === "practice" ? "Practice Mode" : "Review Session";
    }
    if (location.pathname.includes("/cards/") && location.pathname.includes("/edit")) return "Edit Card";
    if (location.pathname.includes("/cards/import")) return "Import Cards";
    if (location.pathname.includes("/cards/export")) return "Export Cards";
    if (location.pathname.includes("/cards")) return "Cards";
    if (location.pathname.includes("/edit")) return "Manage Card Pack";
    return null;
  };

  const pageSubtitle = getPageSubtitle();

  return (
    <>
      {/* Header - Only show on non-main project pages */}
      {!isMainProjectPage && (
        <div className="mb-6">
          <div className="flex items-center gap-3 justify-between">
            <Link to={`/p/${project.id}`} className="flex items-center gap-3 group">
              {project.color && (
                <span
                  className="w-8 h-8 rounded-full border-2 border-gray-400 shadow-sm flex-shrink-0"
                  style={{ backgroundColor: projectColor }}
                ></span>
              )}
              <h1 className="text-3xl font-semibold group-hover:underline" style={{ color: projectForegroundColor }}>
                {project.name}
              </h1>
            </Link>
            <EditMenu projectId={project.id} />
          </div>
          {pageSubtitle && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-base font-semibold text-gray-700">{pageSubtitle}</p>
            </div>
          )}
        </div>
      )}

      {/* Render child routes */}
      <Outlet />
    </>
  );
}
