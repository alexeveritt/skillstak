import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Settings, Library, Trash2 } from "lucide-react";

export interface EditProjectTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function EditProjectTabs({ activeTab, onTabChange, children }: EditProjectTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-1">
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </TabsTrigger>
        <TabsTrigger value="cards" className="flex items-center gap-2">
          <Library className="w-4 h-4" />
          <span className="hidden sm:inline">Cards</span>
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Advanced</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
