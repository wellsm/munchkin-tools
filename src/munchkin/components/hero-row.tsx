import { Link } from 'react-router-dom'
import { ChevronRight, Mars, Venus } from 'lucide-react'
import type { Player } from '../types'
import { calculateStrength } from '../lib/strength'
import { avatarColor, avatarInitial } from '../lib/avatar-color'
import { classById, raceById } from '../constants'
import { StatBox } from './stat-box'

type Props = {
  player: Player
}

export function HeroRow({ player }: Props) {
  const strength = calculateStrength(player)
  const racesText = player.races.map((id) => raceById(id).label).join('')
  const classesText = player.classes.map((id) => classById(id).label).join('')
  const breed = `${racesText}${classesText}` || 'Unknown'

  return (
    <Link
      to={`/player/${player.id}`}
      className="flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3 hover:bg-accent transition-colors"
    >
      <div
        className="size-12 shrink-0 rounded-full flex items-center justify-center"
        style={{ backgroundColor: avatarColor(player.id) }}
        aria-hidden
      >
        <span className="font-munchkin text-2xl text-background leading-none">
          {avatarInitial(player.name)}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-munchkin truncate">{player.name}</span>
          {player.gender === 'male' && <Mars className="size-4 text-muted-foreground shrink-0" aria-label="Male" />}
          {player.gender === 'female' && <Venus className="size-4 text-muted-foreground shrink-0" aria-label="Female" />}
        </div>
        <span className="text-sm text-muted-foreground truncate">{breed}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <StatBox value={player.level} label="LVL" />
        <StatBox value={player.gear} label="GEAR" />
        <StatBox value={strength} label="STR" highlighted />
      </div>

      <ChevronRight className="size-5 text-muted-foreground shrink-0" aria-hidden />
    </Link>
  )
}
