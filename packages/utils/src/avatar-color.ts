export const AVATAR_COLORS = [
  'oklch(0.85 0.03 240)',
  'oklch(0.88 0.12 90)',
  'oklch(0.78 0.09 330)',
  'oklch(0.82 0.1 180)',
  'oklch(0.82 0.1 30)',
  'oklch(0.82 0.1 290)',
  'oklch(0.80 0.08 150)',
  'oklch(0.82 0.09 60)',
]

export function avatarColor(id: string): string {
  let hash = 0

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }

  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function playerAvatarColor(player: {
  id: string
  color?: string | null | undefined
}): string {
  if (player.color) {
    return player.color
  }

  return avatarColor(player.id)
}

export function avatarInitial(name: string): string {
  const trimmed = name.trim()

  if (trimmed.length === 0) {
    return '?'
  }

  return trimmed[0].toUpperCase()
}
