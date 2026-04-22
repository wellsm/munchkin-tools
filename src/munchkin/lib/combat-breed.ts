import type { Player } from '../types'
import { classById, raceById } from '../constants'

export function combatBreed(player: Player): string {
  const races = player.races.map((id) => raceById(id).label.toUpperCase()).join(' / ')
  const classes = player.classes.map((id) => classById(id).label.toUpperCase()).join(' / ')

  if (races && classes) {
    return `${races} · ${classes}`
  }

  return races || classes || 'UNKNOWN'
}
