import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { OnlineFightingView } from "./online-fighting-view";
import { OnlineWhoFightsView } from "./online-who-fights-view";

type Room = Doc<"rooms">;

type Props = {
  room: Room;
};

export function OnlineCombatTab({ room }: Props) {
  if (room.combat.mainCombatantId === null) {
    return <OnlineWhoFightsView room={room} />;
  }

  return <OnlineFightingView room={room} />;
}
