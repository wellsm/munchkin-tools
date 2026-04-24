import { useState } from 'react'
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
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

type Room = Doc<'rooms'>

type Props = {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PendingRequestsSheet({ room, open, onOpenChange }: Props) {
  const t = useT()
  const requesterId = usePlayerIdentityStore((s) => s.playerId)
  const approveJoinRequest = useMutation(api.rooms.approveJoinRequest)
  const denyJoinRequest = useMutation(api.rooms.denyJoinRequest)
  const [error, setError] = useState<string | null>(null)

  const me = room.players.find((p) => p.playerId === requesterId)
  const isHost = me?.isHost ?? false
  const requests = room.joinRequests

  async function runAction(fn: () => Promise<unknown>) {
    setError(null)

    try {
      await fn()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    }
  }

  function handleApprove(targetPlayerId: string) {
    void runAction(() =>
      approveJoinRequest({ roomId: room._id, requesterId, targetPlayerId }),
    )
  }

  function handleDeny(targetPlayerId: string) {
    void runAction(() =>
      denyJoinRequest({ roomId: room._id, requesterId, targetPlayerId }),
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">
            {t.waitingRoom.joinRequestsTitle}
          </SheetTitle>
          {!isHost && (
            <SheetDescription>
              {t.waitingRoom.onlyHostCanAccept}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="p-4 pt-0 max-w-md mx-auto w-full flex flex-col gap-3">
          {requests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              {t.waitingRoom.noJoinRequests}
            </p>
          )}
          {requests.map((req) => (
            <div
              key={req.playerId}
              className="rounded-xl border border-border/60 bg-card/50 p-3 flex items-center gap-3"
            >
              <span className="font-munchkin text-lg flex-1 truncate">
                {req.name}
              </span>
              <Button
                size="sm"
                onClick={() => handleApprove(req.playerId)}
                disabled={!isHost}
              >
                {t.waitingRoom.approve}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeny(req.playerId)}
                disabled={!isHost}
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {t.waitingRoom.deny}
              </Button>
            </div>
          ))}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
