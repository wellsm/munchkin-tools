import { useSearchParams } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Swords,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CombatTab } from "@/munchkin/tabs/combat-tab";
import { PlayersTab } from "@/munchkin/tabs/players-tab";
import { SettingsTab } from "@/munchkin/tabs/settings-tab";

const TAB_TRIGGER_CLS =
  "relative flex flex-col gap-1.5 h-full rounded-none data-[state=active]:text-primary data-[state=active]:bg-accent/30 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-12 before:rounded-b-full before:bg-primary before:opacity-0 data-[state=active]:before:opacity-100 before:transition-opacity";

const VALID_TABS = ["players", "combat", "settings"] as const;
type TabValue = (typeof VALID_TABS)[number];

export function MunchkinGame() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: TabValue = (VALID_TABS as readonly string[]).includes(rawTab ?? "")
    ? (rawTab as TabValue)
    : "players";

  function setTab(next: string) {
    setSearchParams((params) => {
      const copy = new URLSearchParams(params);
      copy.set("tab", next);

      return copy;
    });
  }

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <header className="flex items-center border-b border-border p-4">
        <h1 className="text-2xl font-munchkin">Munchkin Tools</h1>
      </header>
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsContent value="players" className="flex-1 overflow-hidden p-0 m-0">
          <PlayersTab />
        </TabsContent>
        <TabsContent value="combat" className="flex-1 overflow-hidden p-0 m-0">
          <CombatTab />
        </TabsContent>
        <TabsContent
          value="settings"
          className="flex-1 overflow-hidden p-0 m-0"
        >
          <SettingsTab />
        </TabsContent>
        <TabsList className="grid grid-cols-3 w-full rounded-none border-t border-border h-20 p-0">
          <TabsTrigger value="players" className={TAB_TRIGGER_CLS}>
            <Users className="size-6" />
            <span className="text-sm">Heroes</span>
          </TabsTrigger>
          <TabsTrigger value="combat" className={TAB_TRIGGER_CLS}>
            <Swords className="size-6" />
            <span className="text-sm">Combat</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className={TAB_TRIGGER_CLS}>
            <SettingsIcon className="size-6" />
            <span className="text-sm">Settings</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
