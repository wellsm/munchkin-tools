import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useT } from '@/lib/i18n/store'
import { RoomShareCard } from './room-share-card'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomCode: string
  inviteUrl: string
}

export function ShareSheet({ open, onOpenChange, roomCode, inviteUrl }: Props) {
  const t = useT()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">
            {t.settings.shareRoom}
          </SheetTitle>
        </SheetHeader>
        <div className="p-4 pt-0 max-w-md mx-auto w-full">
          <RoomShareCard roomCode={roomCode} inviteUrl={inviteUrl} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
