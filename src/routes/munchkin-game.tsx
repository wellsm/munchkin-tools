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

export function MunchkinGame() {
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border p-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Munchkin</h1>
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
        <TabsList className="grid grid-cols-3 w-full rounded-none border-t border-border h-16">
          <TabsTrigger value="players" className="flex flex-col gap-1 h-full">
            <Users className="size-5" />
            <span className="text-xs">Players</span>
          </TabsTrigger>
          <TabsTrigger value="combat" className="flex flex-col gap-1 h-full">
            <Swords className="size-5" />
            <span className="text-xs">Combate</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col gap-1 h-full">
            <SettingsIcon className="size-5" />
            <span className="text-xs">Config</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
