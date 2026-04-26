export type SortBy = 'level' | 'strength' | null

export function sortPlayers<T extends { level: number; gear: number }>(
  players: T[],
  by: SortBy,
): T[] {
  if (!by) {
    return players
  }

  const copy = [...players]

  copy.sort((a, b) => {
    if (by === 'level') {
      return b.level - a.level
    }

    return b.level + b.gear - (a.level + a.gear)
  })

  return copy
}
