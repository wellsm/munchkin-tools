import { describe, it, expect } from 'vitest'
import { avatarColor, avatarInitial } from './avatar-color'

describe('avatarColor', () => {
  it('returns the same color for the same id', () => {
    expect(avatarColor('abc')).toBe(avatarColor('abc'))
  })

  it('returns a color string for empty id', () => {
    expect(typeof avatarColor('')).toBe('string')
  })

  it('color is one of the palette', () => {
    const c = avatarColor('some-id')
    expect(c).toMatch(/^oklch\(/)
  })
})

describe('avatarInitial', () => {
  it('returns uppercase first character', () => {
    expect(avatarInitial('Well')).toBe('W')
    expect(avatarInitial('mari')).toBe('M')
  })

  it('trims whitespace', () => {
    expect(avatarInitial('  Gu')).toBe('G')
  })

  it('returns ? for empty', () => {
    expect(avatarInitial('')).toBe('?')
    expect(avatarInitial('   ')).toBe('?')
  })
})
