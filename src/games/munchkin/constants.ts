import { Cross, Sword, VenetianMask, Sparkles, Hammer, TreePine, Rabbit, User, type LucideIcon } from 'lucide-react'
import type { MunchkinClass, MunchkinRace } from './types'

export const MAX_CLASSES_PER_PLAYER = 2
export const MAX_RACES_PER_PLAYER = 2
export const DEFAULT_MAX_PLAYERS = 8
export const MIN_MAX_PLAYERS = 2
export const PRODUCT_MAX_PLAYERS = 8
export const DEFAULT_MAX_LEVEL = 10
export const MIN_LEVEL = 1

export type ClassEntry = { id: MunchkinClass; label: string; icon: LucideIcon }
export type RaceEntry = { id: MunchkinRace; label: string; icon: LucideIcon }

export const CLASSES: ClassEntry[] = [
  { id: 'cleric', label: 'Clérigo', icon: Cross },
  { id: 'warrior', label: 'Guerreiro', icon: Sword },
  { id: 'thief', label: 'Ladrão', icon: VenetianMask },
  { id: 'wizard', label: 'Mago', icon: Sparkles },
]

export const RACES: RaceEntry[] = [
  { id: 'dwarf', label: 'Anão', icon: Hammer },
  { id: 'elf', label: 'Elfo', icon: TreePine },
  { id: 'halfling', label: 'Halfling', icon: Rabbit },
  { id: 'human', label: 'Humano', icon: User },
]

export function classById(id: MunchkinClass): ClassEntry {
  return CLASSES.find((c) => c.id === id)!
}

export function raceById(id: MunchkinRace): RaceEntry {
  return RACES.find((r) => r.id === id)!
}
