import { describe, it, expect } from 'vitest'
import { combatTotals } from './combat'
import type { Player, CombatState } from '../types'

function p(id: string, level: number, gear = 0): Player {
  return { id, name: id, level, gear, gender: null, classes: [], races: [] }
}

const emptyCombat: CombatState = {
  mainCombatantId: null,
  helperIds: [],
  partyModifier: 0,
  monsterLevel: 0,
  monsterModifier: 0,
}

describe('combatTotals', () => {
  it('sums main combatant plus helpers', () => {
    const players = [p('a', 3, 2), p('b', 5, 0), p('c', 10, 10)]
    const combat: CombatState = { ...emptyCombat, mainCombatantId: 'a', helperIds: ['b'] }
    const result = combatTotals(players, combat)

    expect(result.partyTotal).toBe(3 + 2 + 5 + 0)
  })

  it('adds partyModifier to the party total', () => {
    const players = [p('a', 4)]
    const combat: CombatState = { ...emptyCombat, mainCombatantId: 'a', partyModifier: 3 }

    expect(combatTotals(players, combat).partyTotal).toBe(7)
  })

  it('null main and no helpers → only partyModifier counts', () => {
    const combat: CombatState = { ...emptyCombat, partyModifier: 4 }

    expect(combatTotals([], combat).partyTotal).toBe(4)
  })

  it('computes monsterTotal from level + modifier', () => {
    const combat: CombatState = { ...emptyCombat, monsterLevel: 8, monsterModifier: -2 }

    expect(combatTotals([], combat).monsterTotal).toBe(6)
  })

  it('outcome is winning when party strictly greater than monster', () => {
    const players = [p('a', 10)]
    const combat: CombatState = { ...emptyCombat, mainCombatantId: 'a', monsterLevel: 5 }

    expect(combatTotals(players, combat).outcome).toBe('winning')
  })

  it('outcome is losing on tie (standard munchkin rule)', () => {
    const players = [p('a', 5)]
    const combat: CombatState = { ...emptyCombat, mainCombatantId: 'a', monsterLevel: 5 }

    expect(combatTotals(players, combat).outcome).toBe('losing')
  })

  it('difference is the absolute gap when losing', () => {
    const players = [p('a', 3)]
    const combat: CombatState = { ...emptyCombat, mainCombatantId: 'a', monsterLevel: 8 }
    const result = combatTotals(players, combat)

    expect(result.difference).toBe(5)
    expect(result.outcome).toBe('losing')
  })

  it('gracefully ignores ids that no longer exist on players', () => {
    const players = [p('a', 3)]
    const combat: CombatState = { ...emptyCombat, mainCombatantId: 'ghost', helperIds: ['a', 'other-ghost'] }
    const result = combatTotals(players, combat)

    expect(result.partyTotal).toBe(3)
  })
})
