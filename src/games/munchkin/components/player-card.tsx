import type { Player } from '../types'
import type { GridDensity } from '../lib/grid-layout'
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
  loose: 'text-6xl',
  normal: 'text-5xl',
  dense: 'text-4xl',
}

const CORNER_TEXT_SIZE: Record<GridDensity, string> = {
  loose: 'text-base',
  normal: 'text-sm',
  dense: 'text-xs',
}

const PADDING: Record<GridDensity, string> = {
  loose: 'p-6',
  normal: 'p-4',
  dense: 'p-3',
}

const ICON_WRAP_SIZE: Record<GridDensity, string> = {
  loose: 'size-8',
  normal: 'size-7',
  dense: 'size-6',
}

const ICON_SIZE: Record<GridDensity, string> = {
  loose: 'size-5',
  normal: 'size-4',
  dense: 'size-3.5',
}

function formatItemBonus(n: number): string {
  if (n > 0) {
    return `+${n}`
  }

  if (n < 0) {
    return String(n)
  }

  return '0'
}

export function PlayerCard({ player, density, onClick }: Props) {
  const strength = calculateStrength(player)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-lg border border-border bg-card text-card-foreground text-left shadow-sm hover:bg-accent transition-colors w-full h-full min-w-0 overflow-hidden',
        PADDING[density],
      )}
    >
      <div className="flex items-start justify-between w-full gap-2">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <span className={cn('font-semibold tabular-nums text-muted-foreground', CORNER_TEXT_SIZE[density])}>
            {formatItemBonus(player.itemBonus)}
          </span>
          <div className="flex flex-wrap gap-1">
            {player.classes.map((id) => {
              const entry = classById(id)
              const Icon = entry.icon

              return (
                <span
                  key={id}
                  title={entry.label}
                  className={cn('inline-flex items-center justify-center rounded-full bg-primary/10 text-primary', ICON_WRAP_SIZE[density])}
                >
                  <Icon className={ICON_SIZE[density]} aria-hidden />
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 min-w-0">
          <span className={cn('font-semibold tabular-nums text-muted-foreground', CORNER_TEXT_SIZE[density])}>
            Nv {player.level}
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            {player.races.map((id) => {
              const entry = raceById(id)
              const Icon = entry.icon

              return (
                <span
                  key={id}
                  title={entry.label}
                  className={cn('inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground', ICON_WRAP_SIZE[density])}
                >
                  <Icon className={ICON_SIZE[density]} aria-hidden />
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-1 w-full min-w-0">
        <span className={cn('font-semibold text-center truncate max-w-full', NAME_SIZE[density])}>
          {player.name}
        </span>
        <span className={cn('font-bold tabular-nums leading-none', STRENGTH_SIZE[density])}>
          {strength}
        </span>
      </div>
    </button>
  )
}
