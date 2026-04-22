import { describe, it, expect } from 'vitest'
import { calculateStrength } from './strength'
import type { Player } from '../types'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test',
    level: 1,
    gear: 0,
    gender: null,
    classes: [],
    races: [],
    ...overrides,
  }
}

describe('calculateStrength', () => {
  it('is level + gear', () => {
    expect(calculateStrength(makePlayer({ level: 5, gear: 3 }))).toBe(8)
  })

  it('supports negative gear', () => {
    expect(calculateStrength(makePlayer({ level: 4, gear: -2 }))).toBe(2)
  })

  it('works at level 1 with no gear', () => {
    expect(calculateStrength(makePlayer({ level: 1, gear: 0 }))).toBe(1)
  })
})
