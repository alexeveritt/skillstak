import { Link } from "react-router";

export interface ProjectEmptyStateProps {
  projectId?: string;
  projectName?: string;
}

export function ProjectEmptyState({ projectId, projectName }: ProjectEmptyStateProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Welcome to your{" "}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent font-extrabold">
            {projectName ?? "Project"}
          </span>{" "}
          Card Stack!
        </h2>
        <p className="text-gray-600 text-lg mb-2">You don't have any flashcards yet.</p>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Create your first flashcard to start learning with spaced repetition. Each card can have a question on the front and an answer on the back.
        </p>
        <Link
          to={`/p/${projectId}/edit?tab=cards`}
          className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all hover:scale-105"
        >
          Add Your First Card
        </Link>
      </div>
    </div>
  );
}

