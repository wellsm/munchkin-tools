import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SortBy } from './sort-players'

type SortPreferenceState = {
  sortBy: SortBy
  setSortBy: (sortBy: SortBy) => void
}

export const useSortPreferenceStore = create<SortPreferenceState>()(
  persist(
    (set) => ({
      sortBy: 'level',
      setSortBy: (sortBy) => set({ sortBy }),
    }),
    { name: 'munchkin-tools-sort-preference' },
  ),
)
