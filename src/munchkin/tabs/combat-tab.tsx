import { FightingView } from "../components/fighting-view";
import { WhoFightsView } from "../components/who-fights-view";
import { useMunchkinStore } from "../store";

export function CombatTab() {
  const mainCombatantId = useMunchkinStore((s) => s.combat.mainCombatantId);

  if (mainCombatantId === null) {
    return <WhoFightsView />;
  }

  return <FightingView />;
}
