import { Library, Settings, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTranslation } from "react-i18next";

export interface EditProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function EditProjectTabs({ activeTab, onTabChange, children }: EditProjectTabsProps) {
  const { t } = useTranslation();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-1">
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">{t("editProjectTabs.settings")}</span>
        </TabsTrigger>
        <TabsTrigger value="cards" className="flex items-center gap-2">
          <Library className="w-4 h-4" />
          <span className="hidden sm:inline">{t("editProjectTabs.cards")}</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">{t("editProjectTabs.advanced")}</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
