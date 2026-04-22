import type { Player, CombatState } from '../types'
import { calculateStrength } from './strength'

export type CombatOutcome = 'winning' | 'losing'

export type CombatResult = {
  partyTotal: number
  monsterTotal: number
  difference: number
  outcome: CombatOutcome
}

export function combatTotals(players: Player[], combat: CombatState): CombatResult {
  const playerById = new Map(players.map((p) => [p.id, p]))
  const participants: Player[] = []

  if (combat.mainCombatantId !== null) {
    const main = playerById.get(combat.mainCombatantId)

    if (main) {
      participants.push(main)
    }
  }

  for (const helperId of combat.helperIds) {
    const helper = playerById.get(helperId)

    if (helper) {
      participants.push(helper)
    }
  }

  const heroSum = participants.reduce((acc, p) => acc + calculateStrength(p), 0)
  const partyTotal = heroSum + combat.partyModifier
  const monsterTotal = combat.monsterLevel + combat.monsterModifier
  const outcome: CombatOutcome = partyTotal > monsterTotal ? 'winning' : 'losing'

  return {
    partyTotal,
    monsterTotal,
    difference: Math.abs(partyTotal - monsterTotal),
    outcome,
  }
}
