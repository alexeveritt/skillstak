import { FileUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ModalHeader } from "./ModalHeader";

type ImportCard = {
  f: string;
  b: string;
};

type ImportProjectData = {
  name: string;
  cards: ImportCard[];
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["application/json", "text/json"];
const ALLOWED_EXTENSIONS = [".json"];

function isValidFileType(file: File): boolean {
  const hasValidMimeType = ALLOWED_MIME_TYPES.includes(file.type);
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
  return hasValidMimeType || hasValidExtension;
}

async function preValidateJsonContent(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const firstChunk = await file.slice(0, 1024).text();
    const trimmed = firstChunk.trim();

    if (!trimmed.startsWith("{")) {
      return { valid: false, error: "Invalid file format. Expected a project file with project name and cards." };
    }

    const binaryPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;
    if (binaryPattern.test(trimmed)) {
      return { valid: false, error: "This file type is not supported. Please upload a valid project file." };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Failed to read file content" };
  }
}

interface ImportProjectModalProps {
  onImport: (projectData: ImportProjectData) => void;
}

export function ImportProjectModal({ onImport }: ImportProjectModalProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fetcher = useFetcher();

  const isImporting = fetcher.state === "submitting" || fetcher.state === "loading";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(t("importProject.fileTooLarge", { size: sizeMB }));
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!isValidFileType(file)) {
      setError(t("importProject.invalidFileType"));
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    // Pre-validate content
    const preValidation = await preValidateJsonContent(file);
    if (!preValidation.valid) {
      setError(preValidation.error || t("importProject.invalidContent"));
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setError("");

    try {
      const text = await selectedFile.text();
      const parsed = JSON.parse(text);

      // Validate structure
      if (!parsed.name || typeof parsed.name !== "string" || parsed.name.trim().length === 0) {
        setError(t("importProject.missingProjectName"));
        return;
      }

      if (!Array.isArray(parsed.cards)) {
        setError(t("importProject.invalidCardsArray"));
        return;
      }

      // Validate cards
      const validCards: ImportCard[] = [];
      for (let i = 0; i < parsed.cards.length; i++) {
        const card = parsed.cards[i];
        if (!card.f || typeof card.f !== "string" || card.f.trim().length === 0) {
          continue;
        }
        if (!card.b || typeof card.b !== "string" || card.b.trim().length === 0) {
          continue;
        }
        validCards.push({ f: card.f.trim(), b: card.b.trim() });
      }

      if (validCards.length === 0) {
        setError(t("importProject.noValidCards"));
        return;
      }

      // Call the onImport callback with the validated data
      onImport({
        name: parsed.name.trim(),
        cards: validCards,
      });

      // Reset and close
      setSelectedFile(null);
      setError("");
      setIsOpen(false);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setError(t("importProject.invalidJson"));
      } else {
        setError(t("importProject.importFailed"));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <FileUp className="mr-2 h-4 w-4" />
          {t("home.importProject")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <ModalHeader
          title={`📦 ${t("importProject.title")}`}
          onClose={() => setIsOpen(false)}
          projectColor="#10b981"
          projectForegroundColor="#065f46"
        />
        <div className="px-6 pb-6 mt-4">
          <p className="text-sm text-gray-600 mb-4">{t("importProject.description")}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4 text-sm">
            <p className="font-medium mb-1">{t("importProject.fileRequirements")}</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>{t("importProject.requirement1")}</li>
              <li>{t("importProject.requirement2")}</li>
              <li>{t("importProject.requirement3")}</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                disabled={isImporting}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
              />
              {selectedFile && !error && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isImporting}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-colors border-2 border-gray-300 disabled:opacity-50"
              >
                {t("home.cancel")}
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || isImporting || !!error}
                className="px-4 py-2.5 text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white"
              >
                <FileUp className="w-4 h-4 flex-shrink-0" />
                <span>{isImporting ? t("importProject.importing") : t("home.import")}</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
