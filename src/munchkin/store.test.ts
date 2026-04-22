import { describe, it, expect, beforeEach } from 'vitest'
import { useMunchkinStore } from './store'
import { DEFAULT_MAX_PLAYERS, DEFAULT_MAX_LEVEL } from './constants'

function reset() {
  useMunchkinStore.setState(useMunchkinStore.getInitialState(), true)
}

function addHero(name: string) {
  useMunchkinStore.getState().addPlayer({
    name,
    level: 1,
    gear: 0,
    gender: null,
    classes: [],
    races: [],
  })
}

beforeEach(() => {
  localStorage.clear()
  reset()
})

describe('munchkin store', () => {
  it('starts empty with default settings', () => {
    const s = useMunchkinStore.getState()

    expect(s.players).toEqual([])
    expect(s.settings.maxPlayers).toBe(DEFAULT_MAX_PLAYERS)
    expect(s.settings.maxLevel).toBe(DEFAULT_MAX_LEVEL)
    expect(s.combat).toEqual({
      mainCombatantId: null,
      helperIds: [],
      partyModifier: 0,
      monsterLevel: 0,
      monsterModifier: 0,
    })
  })

  it('addPlayer adds with generated id', () => {
    useMunchkinStore.getState().addPlayer({
      name: 'Ana',
      level: 1,
      gear: 0,
      gender: null,
      classes: ['warrior'],
      races: ['elf'],
    })
    const [p] = useMunchkinStore.getState().players

    expect(p.name).toBe('Ana')
    expect(p.id).toMatch(/^.+$/)
  })

  it('addPlayer refuses when at maxPlayers', () => {
    const { setMaxPlayers } = useMunchkinStore.getState()
    setMaxPlayers(2)
    addHero('A')
    addHero('B')
    addHero('C')

    expect(useMunchkinStore.getState().players.length).toBe(2)
  })

  it('addPlayer caps classes and races at 2', () => {
    useMunchkinStore.getState().addPlayer({
      name: 'Over',
      level: 1,
      gear: 0,
      gender: null,
      classes: ['warrior', 'wizard', 'cleric'],
      races: ['elf', 'dwarf', 'human'],
    })
    const [p] = useMunchkinStore.getState().players

    expect(p.classes.length).toBe(2)
    expect(p.races.length).toBe(2)
  })

  it('updatePlayer merges patch', () => {
    addHero('Ana')
    const id = useMunchkinStore.getState().players[0].id
    useMunchkinStore.getState().updatePlayer(id, { level: 5 })

    expect(useMunchkinStore.getState().players[0].level).toBe(5)
  })

  it('updatePlayer clamps classes/races to 2', () => {
    addHero('Ana')
    const id = useMunchkinStore.getState().players[0].id
    useMunchkinStore.getState().updatePlayer(id, { classes: ['warrior', 'wizard', 'thief'] })

    expect(useMunchkinStore.getState().players[0].classes.length).toBe(2)
  })

  it('setMainCombatant sets the main combatant id', () => {
    addHero('Ana')
    const id = useMunchkinStore.getState().players[0].id
    useMunchkinStore.getState().setMainCombatant(id)

    expect(useMunchkinStore.getState().combat.mainCombatantId).toBe(id)
  })

  it('setMainCombatant(null) clears main and helpers', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    const { setMainCombatant, addHelper } = useMunchkinStore.getState()
    setMainCombatant(a.id)
    addHelper(b.id)
    setMainCombatant(null)
    const { combat } = useMunchkinStore.getState()

    expect(combat.mainCombatantId).toBeNull()
    expect(combat.helperIds).toEqual([])
  })

  it('setMainCombatant for existing helper removes from helpers and sets as main', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    const { setMainCombatant, addHelper } = useMunchkinStore.getState()
    setMainCombatant(a.id)
    addHelper(b.id)
    setMainCombatant(b.id)
    const { combat } = useMunchkinStore.getState()

    expect(combat.mainCombatantId).toBe(b.id)
    expect(combat.helperIds).toEqual([])
  })

  it('addHelper adds a helper', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)

    expect(useMunchkinStore.getState().combat.helperIds).toEqual([b.id])
  })

  it('addHelper is ignored when id equals main combatant', () => {
    addHero('Ana')
    const id = useMunchkinStore.getState().players[0].id
    useMunchkinStore.getState().setMainCombatant(id)
    useMunchkinStore.getState().addHelper(id)

    expect(useMunchkinStore.getState().combat.helperIds).toEqual([])
  })

  it('addHelper is ignored when already a helper', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)
    useMunchkinStore.getState().addHelper(b.id)

    expect(useMunchkinStore.getState().combat.helperIds).toEqual([b.id])
  })

  it('addHelper respects max 1 helper', () => {
    addHero('Ana')
    addHero('Bob')
    addHero('Cara')
    const [a, b, c] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)
    useMunchkinStore.getState().addHelper(c.id)

    expect(useMunchkinStore.getState().combat.helperIds).toEqual([b.id])
  })

  it('removeHelper removes the helper', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)
    useMunchkinStore.getState().removeHelper(b.id)

    expect(useMunchkinStore.getState().combat.helperIds).toEqual([])
  })

  it('clearHelpers empties the helpers', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)
    useMunchkinStore.getState().clearHelpers()

    expect(useMunchkinStore.getState().combat.helperIds).toEqual([])
  })

  it('setPartyModifier / setMonsterLevel / setMonsterModifier update values', () => {
    const { setPartyModifier, setMonsterLevel, setMonsterModifier } = useMunchkinStore.getState()
    setPartyModifier(3)
    setMonsterLevel(7)
    setMonsterModifier(-2)
    const { combat } = useMunchkinStore.getState()

    expect(combat.partyModifier).toBe(3)
    expect(combat.monsterLevel).toBe(7)
    expect(combat.monsterModifier).toBe(-2)
  })

  it('resetCombat zeroes combat state without touching players', () => {
    addHero('Ana')
    const id = useMunchkinStore.getState().players[0].id
    const { setMainCombatant, setPartyModifier, setMonsterLevel, resetCombat } = useMunchkinStore.getState()
    setMainCombatant(id)
    setPartyModifier(5)
    setMonsterLevel(8)
    resetCombat()
    const s = useMunchkinStore.getState()

    expect(s.combat).toEqual({
      mainCombatantId: null,
      helperIds: [],
      partyModifier: 0,
      monsterLevel: 0,
      monsterModifier: 0,
    })
    expect(s.players.length).toBe(1)
  })

  it('removePlayer of main combatant clears main and helpers', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)
    useMunchkinStore.getState().removePlayer(a.id)
    const { combat, players } = useMunchkinStore.getState()

    expect(players.map((p) => p.id)).toEqual([b.id])
    expect(combat.mainCombatantId).toBeNull()
    expect(combat.helperIds).toEqual([])
  })

  it('removePlayer of helper removes from helperIds only', () => {
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().setMainCombatant(a.id)
    useMunchkinStore.getState().addHelper(b.id)
    useMunchkinStore.getState().removePlayer(b.id)
    const { combat, players } = useMunchkinStore.getState()

    expect(players.map((p) => p.id)).toEqual([a.id])
    expect(combat.mainCombatantId).toBe(a.id)
    expect(combat.helperIds).toEqual([])
  })

  it('levelUpHeroes increments level by 1 up to maxLevel', () => {
    const { setMaxLevel } = useMunchkinStore.getState()
    setMaxLevel(3)
    addHero('Ana')
    addHero('Bob')
    const [a, b] = useMunchkinStore.getState().players
    useMunchkinStore.getState().updatePlayer(a.id, { level: 2 })
    useMunchkinStore.getState().updatePlayer(b.id, { level: 3 })
    useMunchkinStore.getState().levelUpHeroes([a.id, b.id])
    const players = useMunchkinStore.getState().players

    expect(players.find((p) => p.id === a.id)?.level).toBe(3)
    expect(players.find((p) => p.id === b.id)?.level).toBe(3)
  })

  it('setMaxPlayers refuses to drop below current player count', () => {
    const { setMaxPlayers } = useMunchkinStore.getState()
    addHero('A')
    addHero('B')
    addHero('C')
    setMaxPlayers(2)

    expect(useMunchkinStore.getState().settings.maxPlayers).toBe(3)
  })

  it('setMaxPlayers clamps to product range', () => {
    const { setMaxPlayers } = useMunchkinStore.getState()
    setMaxPlayers(99)

    expect(useMunchkinStore.getState().settings.maxPlayers).toBe(8)
    setMaxPlayers(0)
    expect(useMunchkinStore.getState().settings.maxPlayers).toBe(2)
  })

  it('resetAllPlayers clears players and combat, keeps settings', () => {
    const { setMaxLevel, resetAllPlayers } = useMunchkinStore.getState()
    addHero('A')
    setMaxLevel(20)
    resetAllPlayers()
    const s = useMunchkinStore.getState()

    expect(s.players).toEqual([])
    expect(s.combat.mainCombatantId).toBeNull()
    expect(s.combat.helperIds).toEqual([])
    expect(s.settings.maxLevel).toBe(20)
  })
})
