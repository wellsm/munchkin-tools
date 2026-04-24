import { Settings as SettingsIcon, Swords, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/lib/i18n/store";
import { OnlineCombatTab } from "./online-combat-tab";
import { OnlineHeroesTab } from "./online-heroes-tab";
import { OnlineSettingsTab } from "./online-settings-tab";

type Room = Doc<"rooms">;

type Props = {
  room: Room;
};

const TAB_TRIGGER_CLS =
  "relative flex flex-col gap-1.5 h-full rounded-none data-[state=active]:text-primary data-[state=active]:bg-accent/30 before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:h-1 before:w-full  before:bg-primary before:opacity-0 data-[state=active]:before:opacity-100 before:transition-opacity";

const VALID_TABS = ["players", "combat", "settings"] as const;
const MIN_HEROES_FOR_COMBAT = 3;

type TabValue = (typeof VALID_TABS)[number];

export function OnlineGame({ room }: Props) {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const playerCount = room.players.length;
  const canFight = playerCount >= MIN_HEROES_FOR_COMBAT;

  const rawTab = searchParams.get("tab");
  const requestedTab: TabValue = (VALID_TABS as readonly string[]).includes(
    rawTab ?? "",
  )
    ? (rawTab as TabValue)
    : "players";
  const tab: TabValue =
    requestedTab === "combat" && !canFight ? "players" : requestedTab;

  function setTab(next: string) {
    setSearchParams((params) => {
      const copy = new URLSearchParams(params);

      copy.set("tab", next);

      return copy;
    });
  }

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex flex-col flex-1 overflow-hidden"
      >
        <TabsContent value="players" className="flex-1 overflow-hidden p-0 m-0">
          <OnlineHeroesTab room={room} />
        </TabsContent>
        <TabsContent value="combat" className="flex-1 overflow-hidden p-0 m-0">
          <OnlineCombatTab room={room} />
        </TabsContent>
        <TabsContent value="settings" className="flex-1 overflow-hidden p-0 m-0">
          <OnlineSettingsTab room={room} />
        </TabsContent>
        <TabsList className="grid grid-cols-3 w-full rounded-none border-t border-border h-20 p-0">
          <TabsTrigger value="players" className={TAB_TRIGGER_CLS}>
            <Users className="size-6" />
            <span className="text-sm">{t.tabs.heroes}</span>
          </TabsTrigger>
          <TabsTrigger
            value="combat"
            className={TAB_TRIGGER_CLS}
            disabled={!canFight}
            aria-label={
              canFight
                ? t.tabs.combat
                : t.combat.combatNeeds(MIN_HEROES_FOR_COMBAT)
            }
          >
            <Swords className="size-6" />
            <span className="text-sm">{t.tabs.combat}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className={TAB_TRIGGER_CLS}>
            <SettingsIcon className="size-6" />
            <span className="text-sm">{t.tabs.settings}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
