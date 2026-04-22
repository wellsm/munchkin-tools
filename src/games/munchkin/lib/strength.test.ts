import { describe, it, expect } from 'vitest'
import { calculateStrength } from './strength'
import type { Player } from '../types'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test',
    level: 1,
    itemBonus: 0,
    classes: [],
    races: [],
    ...overrides,
  }
}

describe('calculateStrength', () => {
  it('is level + itemBonus', () => {
    expect(calculateStrength(makePlayer({ level: 5, itemBonus: 3 }))).toBe(8)
  })

  it('supports negative itemBonus', () => {
    expect(calculateStrength(makePlayer({ level: 4, itemBonus: -2 }))).toBe(2)
  })

  it('works at level 1 with no items', () => {
    expect(calculateStrength(makePlayer({ level: 1, itemBonus: 0 }))).toBe(1)
  })
})
