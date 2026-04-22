import { describe, it, expect, beforeEach } from 'vitest'
import { useMunchkinStore } from './store'
import { DEFAULT_MAX_PLAYERS, DEFAULT_MAX_LEVEL } from './constants'

function reset() {
  useMunchkinStore.setState(useMunchkinStore.getInitialState(), true)
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
    expect(s.combat.participatingIds).toEqual([])
  })

  it('addPlayer adds with generated id', () => {
    useMunchkinStore.getState().addPlayer({
      name: 'Ana',
      level: 1,
      itemBonus: 0,
      classes: ['warrior'],
      races: ['elf'],
    })
    const [p] = useMunchkinStore.getState().players

    expect(p.name).toBe('Ana')
    expect(p.id).toMatch(/^.+$/)
  })

  it('addPlayer refuses when at maxPlayers', () => {
    const { addPlayer, setMaxPlayers } = useMunchkinStore.getState()
    setMaxPlayers(2)
    addPlayer({ name: 'A', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'B', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'C', level: 1, itemBonus: 0, classes: [], races: [] })

    expect(useMunchkinStore.getState().players.length).toBe(2)
  })

  it('addPlayer caps classes and races at 2', () => {
    useMunchkinStore.getState().addPlayer({
      name: 'Over',
      level: 1,
      itemBonus: 0,
      classes: ['warrior', 'wizard', 'cleric'],
      races: ['elf', 'dwarf', 'human'],
    })
    const [p] = useMunchkinStore.getState().players

    expect(p.classes.length).toBe(2)
    expect(p.races.length).toBe(2)
  })

  it('updatePlayer merges patch', () => {
    const { addPlayer, updatePlayer } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    updatePlayer(id, { level: 5 })

    expect(useMunchkinStore.getState().players[0].level).toBe(5)
  })

  it('updatePlayer clamps classes/races to 2', () => {
    const { addPlayer, updatePlayer } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    updatePlayer(id, { classes: ['warrior', 'wizard', 'thief'] })

    expect(useMunchkinStore.getState().players[0].classes.length).toBe(2)
  })

  it('removePlayer drops from players and participatingIds', () => {
    const { addPlayer, removePlayer, toggleParticipant } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    toggleParticipant(id)
    removePlayer(id)

    expect(useMunchkinStore.getState().players).toEqual([])
    expect(useMunchkinStore.getState().combat.participatingIds).toEqual([])
  })

  it('toggleParticipant is idempotent toggle', () => {
    const { addPlayer, toggleParticipant } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    toggleParticipant(id)

    expect(useMunchkinStore.getState().combat.participatingIds).toEqual([id])
    toggleParticipant(id)
    expect(useMunchkinStore.getState().combat.participatingIds).toEqual([])
  })

  it('resetCombat zeroes combat state without touching players', () => {
    const { addPlayer, toggleParticipant, setMunchkinBuff, setMonsterLevel, resetCombat } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    toggleParticipant(useMunchkinStore.getState().players[0].id)
    setMunchkinBuff(5)
    setMonsterLevel(8)
    resetCombat()
    const s = useMunchkinStore.getState()

    expect(s.combat).toEqual({ participatingIds: [], munchkinBuff: 0, monsterLevel: 0, monsterBuff: 0 })
    expect(s.players.length).toBe(1)
  })

  it('setMaxPlayers refuses to drop below current player count', () => {
    const { addPlayer, setMaxPlayers } = useMunchkinStore.getState()
    addPlayer({ name: 'A', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'B', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'C', level: 1, itemBonus: 0, classes: [], races: [] })
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
    const { addPlayer, setMaxLevel, resetAllPlayers } = useMunchkinStore.getState()
    addPlayer({ name: 'A', level: 1, itemBonus: 0, classes: [], races: [] })
    setMaxLevel(20)
    resetAllPlayers()
    const s = useMunchkinStore.getState()

    expect(s.players).toEqual([])
    expect(s.combat.participatingIds).toEqual([])
    expect(s.settings.maxLevel).toBe(20)
  })
})
