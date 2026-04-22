import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Player, CombatState, GameSettings, MunchkinClass, MunchkinRace } from './types'
import {
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  DEFAULT_MAX_PLAYERS,
  DEFAULT_MAX_LEVEL,
  MIN_MAX_PLAYERS,
  PRODUCT_MAX_PLAYERS,
} from './constants'

type NewPlayerInput = Omit<Player, 'id'>

const MAX_HELPERS = 1

type MunchkinStore = {
  players: Player[]
  settings: GameSettings
  combat: CombatState

  addPlayer: (input: NewPlayerInput) => void
  updatePlayer: (id: string, patch: Partial<NewPlayerInput>) => void
  removePlayer: (id: string) => void
  levelUpHeroes: (ids: string[]) => void

  setMainCombatant: (id: string | null) => void
  addHelper: (id: string) => void
  removeHelper: (id: string) => void
  clearHelpers: () => void
  setPartyModifier: (n: number) => void
  setMonsterLevel: (n: number) => void
  setMonsterModifier: (n: number) => void
  resetCombat: () => void

  setMaxPlayers: (n: number) => void
  setMaxLevel: (n: number) => void
  resetAllPlayers: () => void
}

const INITIAL_COMBAT: CombatState = {
  mainCombatantId: null,
  helperIds: [],
  partyModifier: 0,
  monsterLevel: 0,
  monsterModifier: 0,
}

const INITIAL_SETTINGS: GameSettings = {
  maxPlayers: DEFAULT_MAX_PLAYERS,
  maxLevel: DEFAULT_MAX_LEVEL,
}

function clampList<T>(list: T[], max: number): T[] {
  return list.slice(0, max)
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  const rounded = Math.round(value)

  return Math.min(max, Math.max(min, rounded))
}

function sanitizeInput(input: NewPlayerInput, maxLevel: number): NewPlayerInput {
  return {
    name: input.name.trim(),
    level: clampInt(input.level, 1, maxLevel),
    gear: Math.round(input.gear) || 0,
    gender: input.gender ?? null,
    classes: clampList<MunchkinClass>(input.classes, MAX_CLASSES_PER_PLAYER),
    races: clampList<MunchkinRace>(input.races, MAX_RACES_PER_PLAYER),
  }
}

export const useMunchkinStore = create<MunchkinStore>()(
  persist(
    (set, get) => ({
      players: [],
      settings: { ...INITIAL_SETTINGS },
      combat: { ...INITIAL_COMBAT },

      addPlayer: (input) => {
        const { players, settings } = get()

        if (players.length >= settings.maxPlayers) {
          return
        }

        const sanitized = sanitizeInput(input, settings.maxLevel)
        const player: Player = { id: crypto.randomUUID(), ...sanitized }
        set({ players: [...players, player] })
      },

      updatePlayer: (id, patch) => {
        const { players, settings } = get()
        const next = players.map((p) => {
          if (p.id !== id) {
            return p
          }

          const merged = { ...p, ...patch }
          const sanitized = sanitizeInput(merged, settings.maxLevel)

          return { ...merged, ...sanitized, id: p.id }
        })
        set({ players: next })
      },

      removePlayer: (id) => {
        const { players, combat } = get()
        const players_next = players.filter((p) => p.id !== id)

        if (combat.mainCombatantId === id) {
          set({
            players: players_next,
            combat: { ...combat, mainCombatantId: null, helperIds: [] },
          })

          return
        }

        if (combat.helperIds.includes(id)) {
          set({
            players: players_next,
            combat: { ...combat, helperIds: combat.helperIds.filter((hid) => hid !== id) },
          })

          return
        }

        set({ players: players_next })
      },

      levelUpHeroes: (ids) => {
        const { players, settings } = get()
        const idSet = new Set(ids)
        const next = players.map((p) => {
          if (!idSet.has(p.id)) {
            return p
          }

          const nextLevel = Math.min(settings.maxLevel, p.level + 1)

          return { ...p, level: nextLevel }
        })
        set({ players: next })
      },

      setMainCombatant: (id) => {
        const { combat } = get()

        if (id === null) {
          set({ combat: { ...combat, mainCombatantId: null, helperIds: [] } })

          return
        }

        const helperIds = combat.helperIds.filter((hid) => hid !== id)
        set({ combat: { ...combat, mainCombatantId: id, helperIds } })
      },

      addHelper: (id) => {
        const { combat } = get()

        if (id === null) {
          return
        }

        if (id === combat.mainCombatantId) {
          return
        }

        if (combat.helperIds.includes(id)) {
          return
        }

        if (combat.helperIds.length >= MAX_HELPERS) {
          return
        }

        set({ combat: { ...combat, helperIds: [...combat.helperIds, id] } })
      },

      removeHelper: (id) => {
        const { combat } = get()
        set({ combat: { ...combat, helperIds: combat.helperIds.filter((hid) => hid !== id) } })
      },

      clearHelpers: () => {
        const { combat } = get()
        set({ combat: { ...combat, helperIds: [] } })
      },

      setPartyModifier: (n) => set({ combat: { ...get().combat, partyModifier: Math.round(n) || 0 } }),
      setMonsterLevel: (n) => set({ combat: { ...get().combat, monsterLevel: Math.max(0, Math.round(n) || 0) } }),
      setMonsterModifier: (n) => set({ combat: { ...get().combat, monsterModifier: Math.round(n) || 0 } }),

      resetCombat: () => set({ combat: { ...INITIAL_COMBAT } }),

      setMaxPlayers: (n) => {
        const { players, settings } = get()
        const clampedRange = clampInt(n, MIN_MAX_PLAYERS, PRODUCT_MAX_PLAYERS)
        const floor = Math.max(MIN_MAX_PLAYERS, players.length)
        const finalValue = Math.max(clampedRange, floor)
        set({ settings: { ...settings, maxPlayers: finalValue } })
      },

      setMaxLevel: (n) => {
        const { settings, players } = get()
        const clamped = clampInt(n, 1, 99)
        const adjustedPlayers = players.map((p) => {
          if (p.level <= clamped) {
            return p
          }

          return { ...p, level: clamped }
        })
        set({ settings: { ...settings, maxLevel: clamped }, players: adjustedPlayers })
      },

      resetAllPlayers: () => set({ players: [], combat: { ...INITIAL_COMBAT } }),
    }),
    {
      name: 'munchkin-store-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ players: s.players, settings: s.settings }),
    },
  ),
)
