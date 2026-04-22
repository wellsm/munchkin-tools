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

type MunchkinStore = {
  players: Player[]
  settings: GameSettings
  combat: CombatState

  addPlayer: (input: NewPlayerInput) => void
  updatePlayer: (id: string, patch: Partial<NewPlayerInput>) => void
  removePlayer: (id: string) => void

  toggleParticipant: (id: string) => void
  setMunchkinBuff: (n: number) => void
  setMonsterLevel: (n: number) => void
  setMonsterBuff: (n: number) => void
  resetCombat: () => void

  setMaxPlayers: (n: number) => void
  setMaxLevel: (n: number) => void
  resetAllPlayers: () => void
}

const INITIAL_COMBAT: CombatState = {
  participatingIds: [],
  munchkinBuff: 0,
  monsterLevel: 0,
  monsterBuff: 0,
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
    itemBonus: Math.round(input.itemBonus) || 0,
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
        set({
          players: players.filter((p) => p.id !== id),
          combat: {
            ...combat,
            participatingIds: combat.participatingIds.filter((pid) => pid !== id),
          },
        })
      },

      toggleParticipant: (id) => {
        const { combat } = get()
        const exists = combat.participatingIds.includes(id)
        const participatingIds = exists
          ? combat.participatingIds.filter((pid) => pid !== id)
          : [...combat.participatingIds, id]
        set({ combat: { ...combat, participatingIds } })
      },

      setMunchkinBuff: (n) => set({ combat: { ...get().combat, munchkinBuff: Math.round(n) || 0 } }),
      setMonsterLevel: (n) => set({ combat: { ...get().combat, monsterLevel: Math.max(0, Math.round(n) || 0) } }),
      setMonsterBuff: (n) => set({ combat: { ...get().combat, monsterBuff: Math.round(n) || 0 } }),

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
