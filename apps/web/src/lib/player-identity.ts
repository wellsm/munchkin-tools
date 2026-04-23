import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PlayerIdentityState = {
  playerId: string
  lastUsedName: string | null
  setLastUsedName: (name: string) => void
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  // Fallback for ancient browsers: time + random hex
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const usePlayerIdentityStore = create<PlayerIdentityState>()(
  persist(
    (set) => ({
      playerId: generateId(),
      lastUsedName: null,
      setLastUsedName: (name) => set({ lastUsedName: name.trim() || null }),
    }),
    { name: 'munchkin-tools-player-identity' },
  ),
)
