import { EditMenu } from "~/components/EditMenu";

export interface ProjectHeaderProps {
  name?: string;
  color?: string;
  foregroundColor?: string;
  id?: string;
}

export function ProjectHeader({ name, color, foregroundColor, id }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {color && (
          <span
            className="w-8 h-8 rounded-full border-2 border-gray-400 shadow-sm"
            style={{ backgroundColor: color }}
          ></span>
        )}
        <h1 className="text-3xl font-semibold" style={{ color: foregroundColor }}>
          {name}
        </h1>
      </div>
      {id && <EditMenu projectId={id} />}
    </div>
  );
}

