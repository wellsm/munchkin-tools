import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Header } from "@/components/app/header";
import { useT } from "@/lib/i18n/store";
import { OnlineHeroRow } from "./online-hero-row";

type Room = Doc<"rooms">;

type Props = {
  room: Room;
};

export function OnlineHeroesTab({ room }: Props) {
  const t = useT();
  const players = room.players;

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">{t.heroes.noHeroes}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <Header title={t.heroes.title} />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-24">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {players.map((p) => (
            <li key={p.playerId}>
              <OnlineHeroRow player={p} roomId={room._id} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
