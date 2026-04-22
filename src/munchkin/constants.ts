import { Cross, Sword, VenetianMask, Sparkles, Hammer, TreePine, Rabbit, User, Mars, Venus, type LucideIcon } from 'lucide-react'
import type { MunchkinClass, MunchkinRace, Gender } from './types'

export const MAX_CLASSES_PER_PLAYER = 2
export const MAX_RACES_PER_PLAYER = 2
export const DEFAULT_MAX_PLAYERS = 8
export const MIN_MAX_PLAYERS = 3
export const PRODUCT_MAX_PLAYERS = 8
export const DEFAULT_MAX_LEVEL = 10
export const MIN_LEVEL = 1

export type ClassEntry = { id: MunchkinClass; label: string; icon: LucideIcon }
export type RaceEntry = { id: MunchkinRace; label: string; icon: LucideIcon }
export type GenderEntry = { id: Gender; label: string; icon: LucideIcon }

export const CLASSES: ClassEntry[] = [
  { id: 'warrior', label: 'Warrior', icon: Sword },
  { id: 'wizard', label: 'Wizard', icon: Sparkles },
  { id: 'cleric', label: 'Cleric', icon: Cross },
  { id: 'thief', label: 'Thief', icon: VenetianMask },
]

export const RACES: RaceEntry[] = [
  { id: 'human', label: 'Human', icon: User },
  { id: 'elf', label: 'Elf', icon: TreePine },
  { id: 'dwarf', label: 'Dwarf', icon: Hammer },
  { id: 'halfling', label: 'Halfling', icon: Rabbit },
]

export const GENDERS: GenderEntry[] = [
  { id: 'male', label: 'Male', icon: Mars },
  { id: 'female', label: 'Female', icon: Venus },
]

export function classById(id: MunchkinClass): ClassEntry {
  return CLASSES.find((c) => c.id === id)!
}

export function raceById(id: MunchkinRace): RaceEntry {
  return RACES.find((r) => r.id === id)!
}

export function genderById(id: Gender): GenderEntry {
  return GENDERS.find((g) => g.id === id)!
}
