import { useMutation } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Doc } from '@munchkin-tools/convex/convex/_generated/dataModel'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

type Room = Doc<'rooms'>

type Props = {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SpectatorPickerSheet({ room, open, onOpenChange }: Props) {
  const t = useT()
  const requesterId = usePlayerIdentityStore((s) => s.playerId)
  const setSpectator = useMutation(api.rooms.setSpectator)

  function toggle(targetId: string, value: boolean) {
    void setSpectator({ roomId: room._id, requesterId, targetId, value })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">
            {t.spectators.pickTitle}
          </SheetTitle>
          <SheetDescription>{t.spectators.description}</SheetDescription>
        </SheetHeader>

        <ul className="p-4 flex flex-col gap-2">
          {room.players.map((p) => {
            const isSpec = p.isSpectator ?? false

            return (
              <li key={p.playerId}>
                <button
                  type="button"
                  onClick={() => toggle(p.playerId, !isSpec)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3 hover:bg-accent transition-colors"
                >
                  <span className="font-munchkin text-lg truncate">
                    {p.name}
                  </span>
                  <Checkbox
                    checked={isSpec}
                    onCheckedChange={(value) =>
                      toggle(p.playerId, value === true)
                    }
                    aria-label={t.spectators.toggleAria(p.name)}
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </SheetContent>
    </Sheet>
  )
}
