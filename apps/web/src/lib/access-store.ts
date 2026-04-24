import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AccessState = {
  code: string | null
  setCode: (code: string | null) => void
  clear: () => void
}

export const useAccessStore = create<AccessState>()(
  persist(
    (set) => ({
      code: null,
      setCode: (code) => set({ code: code?.trim() || null }),
      clear: () => set({ code: null }),
    }),
    { name: 'munchkin-tools-access' },
  ),
)
