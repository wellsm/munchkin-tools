import { Crown, Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { avatarColor, avatarInitial } from '../lib/avatar-color'
import { useMunchkinStore } from '../store'
import type { Player } from '../types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VictorySheet({ open, onOpenChange }: Props) {
  const navigate = useNavigate()
  const players = useMunchkinStore((s) => s.players)
  const combat = useMunchkinStore((s) => s.combat)
  const updatePlayer = useMunchkinStore((s) => s.updatePlayer)
  const resetCombat = useMunchkinStore((s) => s.resetCombat)
  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel)

  const participants: Player[] = [
    ...(combat.mainCombatantId
      ? (() => {
          const m = players.find((p) => p.id === combat.mainCombatantId)

          if (!m) {
            return []
          }

          return [m]
        })()
      : []),
    ...combat.helperIds
      .map((id) => players.find((p) => p.id === id))
      .filter((p): p is Player => p !== undefined),
  ]

  const [increments, setIncrements] = useState<Record<string, number>>({})

  // Reset increments when sheet opens
  useEffect(() => {
    if (open) {
      const seed: Record<string, number> = {}

      for (const p of participants) {
        seed[p.id] = 0
      }

      setIncrements(seed)
    }
  }, [open, combat.mainCombatantId, combat.helperIds.join(',')])

  function capFor(player: Player): number {
    return Math.max(0, maxLevel - player.level)
  }

  function adjust(id: string, delta: number) {
    setIncrements((prev) => {
      const player = participants.find((p) => p.id === id)

      if (!player) {
        return prev
      }

      const current = prev[id] ?? 0
      const next = Math.max(0, Math.min(capFor(player), current + delta))

      return { ...prev, [id]: next }
    })
  }

  function handleSave() {
    const mainId = combat.mainCombatantId

    for (const p of participants) {
      const delta = increments[p.id] ?? 0

      if (delta <= 0) {
        continue
      }

      const nextLevel = Math.min(maxLevel, p.level + delta)
      updatePlayer(p.id, { level: nextLevel })
    }

    resetCombat()
    onOpenChange(false)

    if (mainId) {
      navigate(`/player/${mainId}`)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Crown className="size-6 text-primary" aria-hidden />
            <SheetTitle className="font-munchkin text-3xl">Victory!</SheetTitle>
          </div>
          <SheetDescription>Award level-ups to participants.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto mt-4 px-4">
          {participants.length === 0 && (
            <p className="text-center text-muted-foreground p-4">No participants.</p>
          )}
          <ul className="flex flex-col gap-3">
            {participants.map((p) => {
              const inc = increments[p.id] ?? 0
              const projected = Math.min(maxLevel, p.level + inc)
              const cap = capFor(p)

              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3"
                >
                  <div
                    className="size-12 shrink-0 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: avatarColor(p.id) }}
                    aria-hidden
                  >
                    <span className="font-munchkin text-2xl text-background leading-none">
                      {avatarInitial(p.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-lg font-munchkin truncate">{p.name}</span>
                    <span className="text-sm text-muted-foreground">
                      Level {p.level}
                      {inc > 0 && (
                        <span className="text-primary">
                          {' '}→ {projected}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center rounded-md border border-border/60 overflow-hidden shrink-0">
                    <button
                      type="button"
                      aria-label={`Decrease ${p.name} level gain`}
                      onClick={() => adjust(p.id, -1)}
                      disabled={inc <= 0}
                      className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="px-3 py-2 font-munchkin text-primary text-lg tabular-nums min-w-10 text-center">
                      +{inc}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${p.name} level gain`}
                      onClick={() => adjust(p.id, 1)}
                      disabled={inc >= cap}
                      className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="p-4 pt-2 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Crown className="size-4" /> Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
