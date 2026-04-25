import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RecentRoom = {
  roomId: string
  code: string
  hostName: string
  lastJoinedAt: number
}

type RecentRoomsState = {
  rooms: RecentRoom[]
  remember: (room: RecentRoom) => void
  forget: (roomId: string) => void
  clear: () => void
}

const MAX_RECENT = 3

export const useRecentRoomsStore = create<RecentRoomsState>()(
  persist(
    (set) => ({
      rooms: [],
      remember: (room) =>
        set((state) => {
          const deduped = state.rooms.filter((r) => r.roomId !== room.roomId)
          const next = [room, ...deduped].slice(0, MAX_RECENT)

          return { rooms: next }
        }),
      forget: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter((r) => r.roomId !== roomId),
        })),
      clear: () => set({ rooms: [] }),
    }),
    {
      name: 'munchkin-tools-recent-rooms',
      // Trim on rehydrate so devices that had more rooms under an older
      // MAX_RECENT shrink to the current cap without waiting for a new
      // remember() call.
      onRehydrateStorage: () => (state) => {
        if (state && state.rooms.length > MAX_RECENT) {
          state.rooms = state.rooms.slice(0, MAX_RECENT)
        }
      },
    },
  ),
)
