import {
  ArrowLeft,
  Settings as SettingsIcon,
  Swords,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CombatTab } from "@/games/munchkin/tabs/combat-tab";
import { PlayersTab } from "@/games/munchkin/tabs/players-tab";
import { SettingsTab } from "@/games/munchkin/tabs/settings-tab";

const TAB_TRIGGER_CLS =
  "relative flex flex-col gap-1.5 h-full rounded-none data-[state=active]:text-primary data-[state=active]:bg-accent/30 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-12 before:rounded-b-full before:bg-primary before:opacity-0 data-[state=active]:before:opacity-100 before:transition-opacity";

export function MunchkinGame() {
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border p-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/">
            <ArrowLeft className="size-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Munchkin</h1>
      </header>
      <Tabs
        defaultValue="players"
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
            <span className="text-sm">Players</span>
          </TabsTrigger>
          <TabsTrigger value="combat" className={TAB_TRIGGER_CLS}>
            <Swords className="size-6" />
            <span className="text-sm">Combate</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className={TAB_TRIGGER_CLS}>
            <SettingsIcon className="size-6" />
            <span className="text-sm">Config</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
