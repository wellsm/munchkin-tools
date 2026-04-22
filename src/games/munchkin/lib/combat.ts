import type { Player, CombatState } from '../types'
import { calculateStrength } from './strength'

export type CombatOutcome = 'winning' | 'losing'

export type CombatResult = {
  munchkinTotal: number
  monsterTotal: number
  difference: number
  outcome: CombatOutcome
}

export function combatTotals(players: Player[], combat: CombatState): CombatResult {
  const participatingSet = new Set(combat.participatingIds)
  const participating = players.filter((p) => participatingSet.has(p.id))
  const munchkinTotal = participating.reduce((acc, p) => acc + calculateStrength(p), 0) + combat.munchkinBuff
  const monsterTotal = combat.monsterLevel + combat.monsterBuff
  const outcome: CombatOutcome = munchkinTotal > monsterTotal ? 'winning' : 'losing'

  return {
    munchkinTotal,
    monsterTotal,
    difference: Math.abs(munchkinTotal - monsterTotal),
    outcome,
  }
}
