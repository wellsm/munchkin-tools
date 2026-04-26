import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@munchkin-tools/convex/convex/_generated/api";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { combatBreed } from "@/lib/combat-breed";
import { useT } from "@/lib/i18n/store";
import { usePlayerIdentityStore } from "@/lib/player-identity";

type Room = Doc<"rooms">;
type RoomPlayer = Room["players"][number];

type Props = {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toBreedPlayer(p: RoomPlayer) {
  return {
    id: p.playerId,
    name: p.name,
    level: p.level,
    gear: p.gear,
    gender: p.gender,
    color: p.color ?? undefined,
    classes: p.classes,
    races: p.races,
  };
}

export function OnlineMainCombatantPickerSheet({ room, open, onOpenChange }: Props) {
  const t = useT();
  const requesterId = usePlayerIdentityStore((s) => s.playerId);
  const setMainCombatant = useMutation(api.rooms.setMainCombatant);
  const [error, setError] = useState<string | null>(null);

  async function pick(targetId: string) {
    setError(null);

    try {
      await setMainCombatant({ roomId: room._id, requesterId, targetId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">
            {t.combat.whoFights}
          </SheetTitle>
          <SheetDescription>{t.combat.pickMainDescription}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto mt-4 px-4 pb-4">
          {error && (
            <p className="text-sm text-muted-foreground mb-3 text-center">
              {error}
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {room.players.filter((p) => !p.isSpectator).map((p) => {
              const avatarBg = playerAvatarColor({
                id: p.playerId,
                color: p.color ?? undefined,
              });

              return (
                <li key={p.playerId}>
                  <button
                    type="button"
                    onClick={() => pick(p.playerId)}
                    className="w-full flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3 hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className="size-10 shrink-0 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: avatarBg }}
                      aria-hidden
                    >
                      <span className="font-munchkin text-xl text-background leading-none">
                        {avatarInitial(p.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="text-lg font-munchkin truncate">
                        {p.name}
                      </span>
                      <span className="text-sm tracking-wide text-muted-foreground truncate">
                        {combatBreed(toBreedPlayer(p), t)}
                      </span>
                    </div>
                    <span className="font-munchkin text-xl text-primary tabular-nums">
                      {p.level + p.gear}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
