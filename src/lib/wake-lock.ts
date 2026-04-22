import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WakeLockState = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export const useWakeLockStore = create<WakeLockState>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: 'munchkin-tools-wake-lock' },
  ),
)

export function isWakeLockSupported(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  return 'wakeLock' in navigator
}

export function useWakeLockEffect() {
  const enabled = useWakeLockStore((s) => s.enabled)

  useEffect(() => {
    if (!enabled || !isWakeLockSupported()) {
      return
    }

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    async function acquire() {
      if (cancelled) {
        return
      }

      try {
        sentinel = await navigator.wakeLock.request('screen')

        sentinel.addEventListener('release', () => {
          sentinel = null
        })
      } catch {
        // User denied or browser blocked — silent no-op
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && enabled && !sentinel) {
        acquire()
      }
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)

      if (sentinel) {
        sentinel.release().catch(() => undefined)
        sentinel = null
      }
    }
  }, [enabled])
}
