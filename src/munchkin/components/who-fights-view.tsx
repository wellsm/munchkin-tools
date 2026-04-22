import { useMunchkinStore } from '../store'
import { HeroRow } from './hero-row'

export function WhoFightsView() {
  const players = useMunchkinStore((s) => s.players)

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
        {players.map((p) => (
          <HeroRow key={p.id} player={p} />
        ))}
      </ul>
    </div>
  )
}
