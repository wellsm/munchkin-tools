import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Header } from "@/components/app/header";
import { useT } from "@/lib/i18n/store";
import { usePlayerIdentityStore } from "@/lib/player-identity";
import { NotificationButton } from "./notification-button";
import { OnlineMainCombatantPickerSheet } from "./online-main-combatant-picker-sheet";

type Room = Doc<"rooms">;

type Props = {
  room: Room;
};

export function OnlineWhoFightsView({ room }: Props) {
  const t = useT();
  const [, setSearchParams] = useSearchParams();
  const viewerId = usePlayerIdentityStore((s) => s.playerId);
  const viewer = room.players.find((p) => p.playerId === viewerId);
  const isHost = viewer?.isHost ?? false;
  const [open, setOpen] = useState(true);

  if (room.players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">{t.combat.addHeroesFirst}</p>
      </div>
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      setSearchParams((params) => {
        const copy = new URLSearchParams(params);

        copy.set("tab", "players");

        return copy;
      });
    }
  }

  if (!isHost) {
    return (
      <div className="h-full flex flex-col">
        <Header
          title={t.combat.title}
          right={<NotificationButton room={room} />}
        />
        <div className="flex-1 min-h-0 flex items-center justify-center p-6 text-center">
          <p className="text-muted-foreground">{t.combat.waitingForHost}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={t.combat.title} right={<NotificationButton room={room} />} />
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 text-center">
        <p className="font-munchkin text-2xl text-muted-foreground">
          {t.combat.whoFights}
        </p>
      </div>

      <OnlineMainCombatantPickerSheet
        room={room}
        open={open}
        onOpenChange={handleOpenChange}
      />
    </div>
  );
}
