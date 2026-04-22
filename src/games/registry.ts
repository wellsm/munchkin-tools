import { Swords, type LucideIcon } from 'lucide-react'

export type GameEntry = {
  id: string
  name: string
  description: string
  path: string
  icon: LucideIcon
}

export const GAMES: GameEntry[] = [
  {
    id: 'munchkin',
    name: 'Munchkin',
    description: 'Contador de força, classes e raças.',
    path: '/munchkin',
    icon: Swords,
  },
]
