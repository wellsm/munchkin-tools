import type { Player } from './types'
import type { Dictionary } from './i18n/en'

export function combatBreed(player: Player, t: Dictionary): string {
  const races = player.races.map((id) => t.heroEdit.races[id].toUpperCase()).join(' / ')
  const classes = player.classes.map((id) => t.heroEdit.classes[id].toUpperCase()).join(' / ')

  if (races && classes) {
    return `${races} · ${classes}`
  }

  return races || classes || 'UNKNOWN'
}
