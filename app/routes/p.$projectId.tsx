// app/routes/p.$projectId.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, Outlet, useLoaderData, useLocation } from "react-router";
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
    if (location.pathname.includes("/cards/new")) return "New Card";
    if (location.pathname.includes("/cards/") && location.pathname.includes("/edit")) return "Edit Card";
    if (location.pathname.includes("/cards/import")) return "Import Cards";
    if (location.pathname.includes("/cards/export")) return "Export Cards";
    if (location.pathname.includes("/cards")) return "Cards";
    if (location.pathname.includes("/edit")) return "Manage Card Pack";
    return null;
  };

  const pageSubtitle = getPageSubtitle();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - Only show on non-main project pages */}
      {!isMainProjectPage && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              to={`/p/${project.id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Card Pack"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: projectForegroundColor }}>
                {project.name}
              </h1>
              {pageSubtitle && <p className="text-sm text-gray-600 mt-1">{pageSubtitle}</p>}
            </div>
            {project.color && (
              <span
                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: projectColor }}
              ></span>
            )}
          </div>
        </div>
      )}

      {/* Render child routes */}
      <Outlet />
    </div>
  );
}
