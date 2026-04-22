import { Swords } from 'lucide-react'
import { avatarColor, avatarInitial } from '../lib/avatar-color'
import { combatBreed } from '../lib/combat-breed'
import { calculateStrength } from '../lib/strength'
import { useMunchkinStore } from '../store'

export function WhoFightsView() {
  const players = useMunchkinStore((s) => s.players)
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant)

  if (players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Add heroes in the Heroes tab before combat.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 max-w-md mx-auto w-full">
      <h2 className="text-4xl font-munchkin mb-4">Combat</h2>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
          Who Fights?
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <ul className="flex flex-col gap-3">
        {players.map((p) => {
          const strength = calculateStrength(p)

          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setMainCombatant(p.id)}
                className="w-full flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3 hover:bg-accent transition-colors text-left"
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
                  <span className="text-sm tracking-wide text-muted-foreground truncate">
                    {combatBreed(p)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-md border border-primary/60 bg-primary/10 px-2.5 py-1.5 min-w-12 shrink-0">
                  <span className="font-munchkin text-xl text-primary leading-none tabular-nums">
                    {strength}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-muted-foreground mt-0.5">
                    STR
                  </span>
                </div>
                <Swords className="size-5 text-muted-foreground shrink-0" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
