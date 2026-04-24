import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvex, useMutation } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinRoomSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const convex = useConvex()
  const joinRoom = useMutation(api.rooms.joinRoom)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const setLastUsedName = usePlayerIdentityStore((s) => s.setLastUsedName)

  const [roomCode, setRoomCode] = useState('')
  const [name, setName] = useState(lastUsedName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit =
    !submitting && name.trim().length > 0 && roomCode.trim().length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const normalized = roomCode.trim().toUpperCase()
      const foundId = await convex.query(api.rooms.findRoomIdByCode, {
        code: normalized,
      })

      if (!foundId) {
        setError(t.online.errorRoomNotFound)

        return
      }

      await joinRoom({ roomId: foundId, playerId, name })
      setLastUsedName(name)
      onOpenChange(false)
      navigate(`/online/${foundId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.online.errorGeneric

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-3xl">
            {t.online.joinRoom}
          </SheetTitle>
          <SheetDescription>{t.online.description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="join-code">{t.online.roomCode}</Label>
            <Input
              id="join-code"
              autoFocus
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={t.online.roomCodePlaceholder}
              autoCapitalize="characters"
              className="font-munchkin text-2xl tabular-nums tracking-widest"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="join-name">{t.online.yourName}</Label>
            <Input
              id="join-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.online.yourNamePlaceholder}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? t.online.joining : t.online.joinRoom}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
