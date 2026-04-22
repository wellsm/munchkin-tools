import type { Player } from '../types'
import type { GridDensity } from '../lib/grid_layout'
import { calculateStrength } from '../lib/strength'
import { classById, raceById } from '../constants'
import { cn } from '@/lib/utils'

type Props = {
  player: Player
  density: GridDensity
  onClick?: () => void
}

const NAME_SIZE: Record<GridDensity, string> = {
  loose: 'text-2xl',
  normal: 'text-xl',
  dense: 'text-lg',
}

const STRENGTH_SIZE: Record<GridDensity, string> = {
  loose: 'text-5xl',
  normal: 'text-4xl',
  dense: 'text-3xl',
}

const PADDING: Record<GridDensity, string> = {
  loose: 'p-6',
  normal: 'p-4',
  dense: 'p-3',
}

const ICON_SIZE: Record<GridDensity, string> = {
  loose: 'size-6',
  normal: 'size-5',
  dense: 'size-4',
}

export function PlayerCard({ player, density, onClick }: Props) {
  const strength = calculateStrength(player)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start justify-between gap-2 rounded-lg border border-border bg-card text-card-foreground text-left shadow-sm hover:bg-accent transition-colors w-full h-full min-w-0',
        PADDING[density],
      )}
    >
      <div className="flex items-baseline justify-between w-full gap-2">
        <span className={cn('font-semibold truncate', NAME_SIZE[density])}>{player.name}</span>
        <span className="text-xs text-muted-foreground shrink-0">Nv {player.level}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold tabular-nums', STRENGTH_SIZE[density])}>{strength}</span>
        <span className="text-xs text-muted-foreground">
          ({player.level}
          {player.itemBonus >= 0 ? ' + ' : ' - '}
          {Math.abs(player.itemBonus)})
        </span>
      </div>
      <div className="flex flex-wrap gap-1 w-full">
        {player.classes.map((id) => {
          const entry = classById(id)
          const Icon = entry.icon

          return (
            <span
              key={id}
              title={entry.label}
              className={cn('inline-flex items-center justify-center rounded-full bg-primary/10 text-primary', ICON_SIZE[density] === 'size-4' ? 'size-6' : 'size-8')}
            >
              <Icon className={ICON_SIZE[density]} aria-hidden />
            </span>
          )
        })}
        {player.races.map((id) => {
          const entry = raceById(id)
          const Icon = entry.icon

          return (
            <span
              key={id}
              title={entry.label}
              className={cn('inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground', ICON_SIZE[density] === 'size-4' ? 'size-6' : 'size-8')}
            >
              <Icon className={ICON_SIZE[density]} aria-hidden />
            </span>
          )
        })}
      </div>
    </button>
  )
}
