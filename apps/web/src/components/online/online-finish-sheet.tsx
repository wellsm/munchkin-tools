import { Check, Flag, Minus, Plus, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Doc } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { avatarInitial, playerAvatarColor } from '@/lib/avatar-color'
import { MIN_LEVEL } from '@/lib/constants'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { cn } from '@/lib/utils'

type Room = Doc<'rooms'>
type RoomPlayer = Room['players'][number]

type Props = {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ParticipantAction = {
  increment: number
  reset: boolean
}

const INITIAL_ACTION: ParticipantAction = { increment: 0, reset: false }

export function OnlineFinishSheet({ room, open, onOpenChange }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const requesterId = usePlayerIdentityStore((s) => s.playerId)
  const updatePlayer = useMutation(api.rooms.updatePlayer)
  const resetCombat = useMutation(api.rooms.resetCombat)

  const { players, combat, maxLevel } = room

  const participants: RoomPlayer[] = [
    ...(combat.mainCombatantId
      ? (() => {
          const m = players.find((p) => p.playerId === combat.mainCombatantId)

          if (!m) {
            return []
          }

          return [m]
        })()
      : []),
    ...combat.helperIds
      .map((id) => players.find((p) => p.playerId === id))
      .filter((p): p is RoomPlayer => p !== undefined),
  ]

  const [actions, setActions] = useState<Record<string, ParticipantAction>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      const seed: Record<string, ParticipantAction> = {}

      for (const p of participants) {
        seed[p.playerId] = { ...INITIAL_ACTION }
      }

      setActions(seed)
      setError(null)
    }
  }, [open, combat.mainCombatantId, combat.helperIds.join(',')])

  function capFor(player: RoomPlayer): number {
    return Math.max(0, maxLevel - player.level)
  }

  function actionFor(id: string): ParticipantAction {
    return actions[id] ?? INITIAL_ACTION
  }

  function adjust(id: string, delta: number) {
    setActions((prev) => {
      const player = participants.find((p) => p.playerId === id)

      if (!player) {
        return prev
      }

      const current = prev[id] ?? INITIAL_ACTION

      if (current.reset) {
        return prev
      }

      const next = Math.max(0, Math.min(capFor(player), current.increment + delta))

      return { ...prev, [id]: { ...current, increment: next } }
    })
  }

  function toggleReset(id: string) {
    setActions((prev) => {
      const current = prev[id] ?? INITIAL_ACTION
      const nextReset = !current.reset

      return {
        ...prev,
        [id]: { increment: nextReset ? 0 : current.increment, reset: nextReset },
      }
    })
  }

  async function handleSave() {
    const mainId = combat.mainCombatantId
    setSaving(true)
    setError(null)

    try {
      for (const p of participants) {
        const action = actionFor(p.playerId)

        if (action.reset) {
          if (p.level !== MIN_LEVEL) {
            await updatePlayer({
              roomId: room._id,
              requesterId,
              targetId: p.playerId,
              patch: { level: MIN_LEVEL },
            })
          }

          continue
        }

        if (action.increment <= 0) {
          continue
        }

        const nextLevel = Math.min(maxLevel, p.level + action.increment)
        await updatePlayer({
          roomId: room._id,
          requesterId,
          targetId: p.playerId,
          patch: { level: nextLevel },
        })
      }

      await resetCombat({ roomId: room._id, requesterId })
      onOpenChange(false)

      if (mainId) {
        navigate(`/online/${room._id}/player/${mainId}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Flag className="size-6 text-primary" aria-hidden />
            <SheetTitle className="font-munchkin text-3xl">{t.finish.title}</SheetTitle>
          </div>
          <SheetDescription>{t.finish.description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto mt-4 px-4">
          {participants.length === 0 && (
            <p className="text-center text-muted-foreground p-4">{t.finish.noParticipants}</p>
          )}
          <ul className="flex flex-col gap-3">
            {participants.map((p) => {
              const action = actionFor(p.playerId)
              const projected = action.reset
                ? MIN_LEVEL
                : Math.min(maxLevel, p.level + action.increment)
              const cap = capFor(p)
              const changed = action.reset || action.increment > 0
              const avatarBg = playerAvatarColor({
                id: p.playerId,
                color: p.color ?? undefined,
              })

              return (
                <li
                  key={p.playerId}
                  className="flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3"
                >
                  <div
                    className="size-12 shrink-0 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: avatarBg }}
                    aria-hidden
                  >
                    <span className="font-munchkin text-2xl text-background leading-none">
                      {avatarInitial(p.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-lg font-munchkin truncate">{p.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {changed ? (
                        <span className={action.reset ? 'text-destructive' : 'text-primary'}>
                          {t.finish.levelTransition(p.level, projected)}
                        </span>
                      ) : (
                        t.combat.levelFormat(p.level)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={cn(
                        'flex items-center rounded-md border border-border/60 overflow-hidden transition-opacity',
                        action.reset && 'opacity-40',
                      )}
                    >
                      <button
                        type="button"
                        aria-label={t.finish.decreaseLevelGain(p.name)}
                        onClick={() => adjust(p.playerId, -1)}
                        disabled={action.reset || action.increment <= 0}
                        className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="px-3 py-2 font-munchkin text-primary text-lg tabular-nums min-w-10 text-center">
                        +{action.increment}
                      </span>
                      <button
                        type="button"
                        aria-label={t.finish.increaseLevelGain(p.name)}
                        onClick={() => adjust(p.playerId, 1)}
                        disabled={action.reset || action.increment >= cap}
                        className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={t.finish.resetLevelTo(p.name, MIN_LEVEL)}
                      aria-pressed={action.reset}
                      onClick={() => toggleReset(p.playerId)}
                      className={cn(
                        'inline-flex items-center justify-center size-10 rounded-md border transition-colors',
                        action.reset
                          ? 'border-destructive/60 bg-destructive/10 text-destructive'
                          : 'border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <RotateCcw className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {error && (
            <p className="text-sm text-muted-foreground mt-4 text-center">{error}</p>
          )}
        </div>

        <div className="p-4 pt-2 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Check className="size-4" /> {t.common.save}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
