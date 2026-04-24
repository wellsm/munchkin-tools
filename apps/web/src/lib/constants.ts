import {
  Crosshair,
  Cross,
  Flame,
  Gem,
  Hammer,
  type LucideIcon,
  Mars,
  Music2,
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

export type ClassEntry = { id: MunchkinClass; icon: LucideIcon; color: string };
export type RaceEntry = { id: MunchkinRace; icon: LucideIcon; color: string };
export type GenderEntry = { id: Gender; icon: LucideIcon };

// Per-class / per-race tint for chips (applied as inline backgroundColor).
// Lightness kept around 0.65-0.85 so text-background (dark) is readable.
export const CLASSES: ClassEntry[] = [
  { id: "warrior", icon: Sword, color: "oklch(0.7 0.18 30)" },        // warm red
  { id: "wizard", icon: Sparkles, color: "oklch(0.7 0.2 290)" },      // violet
  { id: "cleric", icon: Cross, color: "oklch(0.88 0.12 85)" },        // soft gold
  { id: "thief", icon: VenetianMask, color: "oklch(0.65 0.12 160)" }, // forest green
  { id: "bard", icon: Music2, color: "oklch(0.75 0.18 340)" },        // pink
  { id: "ranger", icon: Crosshair, color: "oklch(0.7 0.12 200)" },    // teal
];

export const RACES: RaceEntry[] = [
  { id: "human", icon: User, color: "oklch(0.75 0.02 0)" },        // neutral gray (default)
  { id: "elf", icon: TreePine, color: "oklch(0.75 0.18 140)" },    // bright green
  { id: "dwarf", icon: Hammer, color: "oklch(0.62 0.1 50)" },      // earthy brown
  { id: "halfling", icon: Rabbit, color: "oklch(0.85 0.12 75)" },  // mustard yellow
  { id: "orc", icon: Flame, color: "oklch(0.58 0.12 145)" },       // dark menacing green
  { id: "gnome", icon: Gem, color: "oklch(0.78 0.14 230)" },       // sky blue
];

// Filtered RACES for the picker: in Munchkin, Human is the default state when
// you have no Race card. Empty races[] = Human; the UI renders a Human chip
// from the default, and the picker offers only the non-default races.
export const SELECTABLE_RACES: RaceEntry[] = RACES.filter((r) => r.id !== "human");
export const DEFAULT_RACE = RACES.find((r) => r.id === "human")!;

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
