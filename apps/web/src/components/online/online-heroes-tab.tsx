import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Header } from "@/components/app/header";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/store";
import { usePlayerIdentityStore } from "@/lib/player-identity";
import { sortPlayers } from "@/lib/sort-players";
import { useSortPreferenceStore } from "@/lib/sort-preference-store";
import { NotificationButton } from "./notification-button";
import { OnlineHeroRow } from "./online-hero-row";
import { ShareSheet } from "./share-sheet";

type Room = Doc<"rooms">;

type Props = {
  room: Room;
};

export function OnlineHeroesTab({ room }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const viewerId = usePlayerIdentityStore((s) => s.playerId);
  const [shareOpen, setShareOpen] = useState(false);
  const sortBy = useSortPreferenceStore((s) => s.sortBy);
  const setSortBy = useSortPreferenceStore((s) => s.setSortBy);
  const players = room.players.filter((p) => !p.isSpectator);
  const sorted = sortPlayers(players, sortBy);
  const inviteUrl = `${window.location.origin}/online/${room._id}`;

  function toggleSort(next: 'level' | 'strength') {
    setSortBy(sortBy === next ? null : next);
  }

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">{t.heroes.noHeroes}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <Header
        title={t.heroes.title}
        onHome={() => navigate("/")}
        right={<NotificationButton room={room} />}
      />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-24">
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant={sortBy === 'level' ? 'default' : 'outline'}
            onClick={() => toggleSort('level')}
          >
            {t.heroes.sortByLevel}
          </Button>
          <Button
            size="sm"
            variant={sortBy === 'strength' ? 'default' : 'outline'}
            onClick={() => toggleSort('strength')}
          >
            {t.heroes.sortByStrength}
          </Button>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((p) => (
            <li key={p.playerId}>
              <OnlineHeroRow
                player={p}
                roomId={room._id}
                isMe={p.playerId === viewerId}
              />
            </li>
          ))}
        </ul>
      </div>

      <Button
        size="icon"
        className="absolute bottom-4 right-4 size-14 rounded-full shadow-lg"
        onClick={() => setShareOpen(true)}
        aria-label={t.waitingRoom.invite}
      >
        <Share2 className="size-7" />
      </Button>

      <ShareSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        roomCode={room.code}
        inviteUrl={inviteUrl}
      />
    </div>
  );
}
