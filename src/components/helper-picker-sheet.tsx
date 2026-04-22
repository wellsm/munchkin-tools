import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { avatarInitial, playerAvatarColor } from '@/lib/avatar-color'
import { combatBreed } from '@/lib/combat-breed'
import { calculateStrength } from '@/lib/strength'
import { useMunchkinStore } from '@/lib/store'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelperPickerSheet({ open, onOpenChange }: Props) {
  const players = useMunchkinStore((s) => s.players)
  const combat = useMunchkinStore((s) => s.combat)
  const addHelper = useMunchkinStore((s) => s.addHelper)

  const available = players.filter(
    (p) => p.id !== combat.mainCombatantId && !combat.helperIds.includes(p.id),
  )

  function pick(id: string) {
    addHelper(id)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">Choose a helper</SheetTitle>
          <SheetDescription>Pick another hero to join the fight.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto mt-4 px-4 pb-4">
          {available.length === 0 && (
            <p className="text-center text-muted-foreground p-4">No other heroes available.</p>
          )}
          <ul className="flex flex-col gap-2">
            {available.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pick(p.id)}
                  className="w-full flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3 hover:bg-accent transition-colors text-left"
                >
                  <div
                    className="size-10 shrink-0 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: playerAvatarColor(p) }}
                    aria-hidden
                  >
                    <span className="font-munchkin text-xl text-background leading-none">
                      {avatarInitial(p.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-lg font-munchkin truncate">{p.name}</span>
                    <span className="text-sm tracking-wide text-muted-foreground truncate">
                      {combatBreed(p)}
                    </span>
                  </div>
                  <span className="font-munchkin text-xl text-primary tabular-nums">
                    {calculateStrength(p)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
