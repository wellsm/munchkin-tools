import type { Player } from '../types'

export function calculateStrength(player: Player): number {
  return player.level + player.gear
}
