import { useMunchkinStore } from '../store'
import { WhoFightsView } from '../components/who-fights-view'
import { FightingView } from '../components/fighting-view'

export function CombatTab() {
  const mainCombatantId = useMunchkinStore((s) => s.combat.mainCombatantId)

  if (mainCombatantId === null) {
    return <WhoFightsView />
  }

  return <FightingView />
}
