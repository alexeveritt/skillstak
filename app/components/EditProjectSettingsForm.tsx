import { Form, Link } from "react-router";
import { ColorPicker } from "./ColorPicker";

export interface EditProjectSettingsFormProps {
  project: { id: string; name: string };
  selectedColor: string;
  selectedForegroundColor: string;
  onColorChange: (bg: string, fg: string) => void;
}

export function EditProjectSettingsForm({
  project,
  selectedColor,
  selectedForegroundColor,
  onColorChange,
}: EditProjectSettingsFormProps) {
  return (
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
          <ColorPicker value={selectedColor} onChange={onColorChange} />
          <input type="hidden" name="color" value={selectedColor} />
          <input type="hidden" name="foregroundColor" value={selectedForegroundColor} />
        </div>
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
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-2.5 rounded-lg font-medium border border-blue-300 transition-colors"
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
  );
}
