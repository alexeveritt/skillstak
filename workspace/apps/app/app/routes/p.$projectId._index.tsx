// app/routes/p.$projectId._index.tsx
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData, useMatches } from "react-router";
import { ProjectActionButtons } from "../components/ProjectActionButtons";
import { ProjectEmptyState } from "../components/ProjectEmptyState";
import { ProjectHeader } from "../components/ProjectHeader";
import { ProjectStatsDashboard } from "../components/ProjectStatsDashboard";
import { requireUserId } from "../server/session";
import * as reviewService from "../services/review.service";
import { getEnvFromContext } from "~/server/db";

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const userId = await requireUserId(context, request);
  const projectId = params.projectId!;
  const env = getEnvFromContext(context);

  const stats = await reviewService.getProjectStats(env, projectId, userId);

  return { stats };
}

function formatNextReviewTime(nextDueAt: string | null): string | null {
  if (!nextDueAt) return null;

  // SQLite returns datetime in format 'YYYY-MM-DD HH:MM:SS' (UTC)
  // We need to handle it properly whether it has a 'Z' suffix or not
  let dueDate: Date;

  try {
    if (nextDueAt.endsWith("Z")) {
      dueDate = new Date(nextDueAt);
    } else if (nextDueAt.includes("T")) {
      // ISO format without Z
      dueDate = new Date(nextDueAt + "Z");
    } else {
      // SQLite format 'YYYY-MM-DD HH:MM:SS' - replace space with T and add Z
      dueDate = new Date(nextDueAt.replace(" ", "T") + "Z");
    }

    // Check if date is valid
    if (isNaN(dueDate.getTime())) {
      console.error("Invalid date format:", nextDueAt);
      return null;
    }
  } catch (error) {
    console.error("Error parsing date:", nextDueAt, error);
    return null;
  }

  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();

  // If the difference is negative or very small (less than 1 minute), don't show a time
  // This means cards should be due now, which is a data inconsistency
  if (diffMs < 60000) {
    return null;
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  } else if (diffDays === 1) {
    return "tomorrow";
  } else if (diffDays < 7) {
    return `in ${diffDays} days`;
  } else {
    const weeks = Math.floor(diffDays / 7);
    return `in ${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
}

export default function ProjectDetail() {
  const { stats } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const layoutData = matches.find((match) => match.id.includes("p.$projectId"))?.data as
    | { project?: { id: string; name: string; color?: string; foreground_color?: string } }
    | undefined;
  const project = layoutData?.project;
  const projectColor = project?.color || "#fef3c7";
  const projectForegroundColor = project?.foreground_color || "#78350f";

  return (
    <>
      {/* Header with Edit Menu - Only on main project page */}
      <ProjectHeader
        name={project?.name}
        color={projectColor}
        foregroundColor={projectForegroundColor}
        id={project?.id}
      />

      {/* Empty State when no cards - show immediately */}
      {stats && stats.total_cards === 0 && <ProjectEmptyState projectId={project?.id} projectName={project?.name} />}

      {/* Stats Dashboard - Only show when there are cards */}
      {stats && stats.total_cards > 0 && (
        <>
          <ProjectStatsDashboard
            stats={stats}
            projectColor={projectColor}
            projectForegroundColor={projectForegroundColor}
          />
          <ProjectActionButtons
            stats={{ due_now: stats.due_now, next_due_at: stats.next_due_at }}
            formatNextReviewTime={formatNextReviewTime}
          />
        </>
      )}
    </>
  );
}
