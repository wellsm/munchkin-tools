import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { combatBreed } from "@/lib/combat-breed";
import { useT } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";
import { calculateStrength } from "@/lib/strength";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MainCombatantPickerSheet({ open, onOpenChange }: Props) {
  const t = useT();
  const players = useMunchkinStore((s) => s.players);
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant);

  function pick(id: string) {
    setMainCombatant(id);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">
            {t.combat.whoFights}
          </SheetTitle>
          <SheetDescription>{t.combat.pickMainDescription}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto mt-4 px-4 pb-4">
          <ul className="flex flex-col gap-2">
            {players.map((p) => (
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
                    <span className="text-lg font-munchkin truncate">
                      {p.name}
                    </span>
                    <span className="text-sm tracking-wide text-muted-foreground truncate">
                      {combatBreed(p, t)}
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
  );
}
