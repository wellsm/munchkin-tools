import { describe, it, expect } from 'vitest'
import { combatTotals } from './combat'
import type { Player, CombatState } from '../types'

function p(id: string, level: number, itemBonus = 0): Player {
  return { id, name: id, level, itemBonus, classes: [], races: [] }
}

const emptyCombat: CombatState = {
  participatingIds: [],
  munchkinBuff: 0,
  monsterLevel: 0,
  monsterBuff: 0,
}

describe('combatTotals', () => {
  it('sums only participating players plus munchkinBuff', () => {
    const players = [p('a', 3, 2), p('b', 5, 0), p('c', 10, 10)]
    const combat = { ...emptyCombat, participatingIds: ['a', 'b'], munchkinBuff: 1 }
    const result = combatTotals(players, combat)

    expect(result.munchkinTotal).toBe(3 + 2 + 5 + 0 + 1)
  })

  it('sums monster level and buff', () => {
    const combat = { ...emptyCombat, monsterLevel: 8, monsterBuff: -2 }
    const result = combatTotals([], combat)

    expect(result.monsterTotal).toBe(6)
  })

  it('outcome is winning when munchkins strictly greater than monster', () => {
    const players = [p('a', 10)]
    const combat = { ...emptyCombat, participatingIds: ['a'], monsterLevel: 5 }

    expect(combatTotals(players, combat).outcome).toBe('winning')
  })

  it('outcome is losing on tie (standard munchkin rule)', () => {
    const players = [p('a', 5)]
    const combat = { ...emptyCombat, participatingIds: ['a'], monsterLevel: 5 }

    expect(combatTotals(players, combat).outcome).toBe('losing')
  })

  it('ignores non-participating players even if listed', () => {
    const players = [p('a', 10), p('b', 99)]
    const combat = { ...emptyCombat, participatingIds: ['a'] }

    expect(combatTotals(players, combat).munchkinTotal).toBe(10)
  })

  it('gracefully ignores participating ids that no longer exist', () => {
    const players = [p('a', 3)]
    const combat = { ...emptyCombat, participatingIds: ['a', 'ghost'] }

    expect(combatTotals(players, combat).munchkinTotal).toBe(3)
  })
})
