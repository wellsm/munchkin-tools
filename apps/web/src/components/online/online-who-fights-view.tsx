import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@munchkin-tools/convex/convex/_generated/api";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Header } from "@/components/app/header";
import { useT } from "@/lib/i18n/store";
import { usePlayerIdentityStore } from "@/lib/player-identity";
import { NotificationButton } from "./notification-button";
import { OnlineHeroRow } from "./online-hero-row";

type Room = Doc<"rooms">;

type Props = {
  room: Room;
};

export function OnlineWhoFightsView({ room }: Props) {
  const t = useT();
  const setMainCombatant = useMutation(api.rooms.setMainCombatant);
  const requesterId = usePlayerIdentityStore((s) => s.playerId);
  const [error, setError] = useState<string | null>(null);

  async function setHero(targetId: string) {
    setError(null);

    try {
      await setMainCombatant({ roomId: room._id, requesterId, targetId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  if (room.players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">{t.combat.addHeroesFirst}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={t.combat.title} right={<NotificationButton room={room} />} />
      <div className="flex-1 min-h-0 overflow-auto p-4 mx-auto w-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
            {t.combat.whoFights}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {error && (
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {room.players.map((p) => (
            <OnlineHeroRow
              key={p.playerId}
              player={p}
              roomId={room._id}
              isMe={p.playerId === requesterId}
              onClick={() => setHero(p.playerId)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
