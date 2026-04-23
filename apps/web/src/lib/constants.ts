import {
  Cross,
  Hammer,
  type LucideIcon,
  Mars,
  Rabbit,
  Sparkles,
  Sword,
  TreePine,
  User,
  VenetianMask,
  Venus,
} from "lucide-react";
import type { Gender, MunchkinClass, MunchkinRace } from "./types";

export const MAX_CLASSES_PER_PLAYER = 2;
export const MAX_RACES_PER_PLAYER = 2;
export const DEFAULT_MAX_PLAYERS = 8;
export const MIN_MAX_PLAYERS = 3;
export const PRODUCT_MAX_PLAYERS = 8;
export const DEFAULT_MAX_LEVEL = 10;
export const MIN_LEVEL = 1;

export type ClassEntry = { id: MunchkinClass; icon: LucideIcon };
export type RaceEntry = { id: MunchkinRace; icon: LucideIcon };
export type GenderEntry = { id: Gender; icon: LucideIcon };

export const CLASSES: ClassEntry[] = [
  { id: "warrior", icon: Sword },
  { id: "wizard", icon: Sparkles },
  { id: "cleric", icon: Cross },
  { id: "thief", icon: VenetianMask },
];

export const RACES: RaceEntry[] = [
  { id: "human", icon: User },
  { id: "elf", icon: TreePine },
  { id: "dwarf", icon: Hammer },
  { id: "halfling", icon: Rabbit },
];

export const GENDERS: GenderEntry[] = [
  { id: "male", icon: Mars },
  { id: "female", icon: Venus },
];

export function classById(id: MunchkinClass): ClassEntry {
  return CLASSES.find((c) => c.id === id)!;
}

export function raceById(id: MunchkinRace): RaceEntry {
  return RACES.find((r) => r.id === id)!;
}

export function genderById(id: Gender): GenderEntry {
  return GENDERS.find((g) => g.id === id)!;
}
