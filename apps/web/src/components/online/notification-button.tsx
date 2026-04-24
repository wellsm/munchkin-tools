import { useState } from 'react'
import { Bell } from 'lucide-react'
import type { Doc } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { PendingRequestsSheet } from './pending-requests-sheet'

type Room = Doc<'rooms'>

type Props = {
  room: Room
}

export function NotificationButton({ room }: Props) {
  const t = useT()
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const [open, setOpen] = useState(false)

  const me = room.players.find((p) => p.playerId === playerId)
  const isHost = me?.isHost ?? false
  const count = room.joinRequests.length
  const hasRequests = count > 0
  const clickable = isHost && hasRequests

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t.waitingRoom.joinRequestsTitle}
        onClick={() => setOpen(true)}
        disabled={!clickable}
        className="relative"
      >
        <Bell
          className={
            hasRequests ? 'size-6 text-foreground' : 'size-6 text-muted-foreground'
          }
        />
        {hasRequests && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center"
            aria-hidden
          >
            {count}
          </span>
        )}
      </Button>
      <PendingRequestsSheet
        room={room}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
