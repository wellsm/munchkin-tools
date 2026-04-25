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
import { useAccessStore } from '@/lib/access-store'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { useRecentRoomsStore } from '@/lib/recent-rooms-store'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const convex = useConvex()
  const createRoom = useMutation(api.rooms.createRoom)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const setLastUsedName = usePlayerIdentityStore((s) => s.setLastUsedName)
  const storedAccessCode = useAccessStore((s) => s.code)
  const clearAccessCode = useAccessStore((s) => s.clear)
  const rememberRoom = useRecentRoomsStore((s) => s.remember)

  const [name, setName] = useState(lastUsedName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = !submitting && name.trim().length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const args: { playerId: string; hostName: string; accessCode?: string } = {
        playerId,
        hostName: name,
      }

      if (storedAccessCode) {
        args.accessCode = storedAccessCode
      }

      const roomId = await createRoom(args)
      const room = await convex.query(api.rooms.getRoom, { roomId })

      if (room) {
        rememberRoom({
          roomId,
          code: room.code,
          hostName: room.hostName,
          lastJoinedAt: Date.now(),
        })
      }

      setLastUsedName(name)
      onOpenChange(false)
      navigate(`/online/${roomId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.online.errorGeneric

      if (/access code/i.test(message)) {
        clearAccessCode()
      }

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
            {t.online.createRoom}
          </SheetTitle>
          <SheetDescription>{t.online.description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-name">{t.online.yourName}</Label>
            <Input
              id="create-name"
              autoFocus
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
              {submitting ? t.online.creating : t.online.createRoom}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
