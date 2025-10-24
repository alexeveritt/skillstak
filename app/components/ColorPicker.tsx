import { useState } from "react";
import { clsx } from "clsx";

// Color pairs: [background, foreground/text color, name]
const COLOR_OPTIONS = [
  ["#fef3c7", "#78350f", "Soft Yellow"],
  ["#fce7f3", "#831843", "Soft Pink"],
  ["#e0e7ff", "#3730a3", "Soft Indigo"],
  ["#dbeafe", "#1e3a8a", "Soft Blue"],
  ["#d1fae5", "#065f46", "Soft Green"],
  ["#fed7aa", "#7c2d12", "Soft Orange"],
  ["#e9d5ff", "#6b21a8", "Soft Purple"],
  ["#fecaca", "#991b1b", "Soft Red"],
  ["#ccfbf1", "#134e4a", "Soft Teal"],
  ["#fef08a", "#713f12", "Light Yellow"],
  ["#fbcfe8", "#9f1239", "Light Pink"],
  ["#c7d2fe", "#4338ca", "Light Indigo"],
  ["#bfdbfe", "#1e40af", "Light Blue"],
  ["#a7f3d0", "#047857", "Light Green"],
  ["#fde68a", "#92400e", "Light Amber"],
  ["#ddd6fe", "#7c3aed", "Light Purple"],
  ["#fca5a5", "#b91c1c", "Light Red"],
  ["#99f6e4", "#0f766e", "Light Teal"],
] as const;

type ColorPickerProps = {
  value?: string;
  onChange: (backgroundColor: string, foregroundColor: string) => void;
};

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customBg, setCustomBg] = useState("");
  const [customFg, setCustomFg] = useState("#000000");

  // Find if current value matches a preset
  const selectedIndex = COLOR_OPTIONS.findIndex(([bg]) => bg === value);

  const handlePresetClick = (bg: string, fg: string) => {
    onChange(bg, fg);
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    if (customBg) {
      onChange(customBg, customFg);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium mb-2">Choose a card color</div>

      {/* Color Swatches */}
      <div className="grid grid-cols-6 gap-2">
        {COLOR_OPTIONS.map(([bg, fg, name], index) => (
          <button
            key={bg}
            type="button"
            onClick={() => handlePresetClick(bg, fg)}
            className={clsx(
              "h-12 rounded border-2 transition-all relative group",
              selectedIndex === index ? "border-black ring-2 ring-black" : "border-gray-300 hover:border-gray-400"
            )}
            style={{ backgroundColor: bg }}
            title={name}
          >
            {/* Preview text */}
            <span
              className={clsx(
                "text-xs font-medium absolute inset-0 flex items-center justify-center transition-opacity",
                selectedIndex === index ? "opacity-0" : "opacity-0 group-hover:opacity-100"
              )}
              style={{ color: fg }}
            >
              Aa
            </span>
            {/* Checkmark for selected */}
            {selectedIndex === index && (
              <span
                className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                style={{ color: fg }}
              >
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Option */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm text-slate-600 underline hover:text-slate-800"
        >
          {showCustom ? "Hide custom color" : "Use custom color"}
        </button>

        {showCustom && (
          <div className="mt-3 p-3 border rounded bg-slate-50 space-y-2">
            <div>
              <label htmlFor="custom-bg" className="block text-xs font-medium text-slate-700 mb-1">
                Background Color (hex code)
              </label>
              <input
                type="text"
                id="custom-bg"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                placeholder="#fef3c7"
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label htmlFor="custom-fg" className="block text-xs font-medium text-slate-700 mb-1">
                Text Color (hex code)
              </label>
              <input
                type="text"
                id="custom-fg"
                value={customFg}
                onChange={(e) => setCustomFg(e.target.value)}
                placeholder="#000000"
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            {/* Preview */}
            {customBg && (
              <div
                className="rounded p-3 text-center font-medium"
                style={{ backgroundColor: customBg, color: customFg }}
              >
                Preview: Your card will look like this
              </div>
            )}
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="w-full bg-black text-white rounded px-3 py-1 text-sm hover:bg-gray-800"
            >
              Apply Custom Color
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
