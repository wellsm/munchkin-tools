export type MunchkinClass =
  | 'cleric'
  | 'warrior'
  | 'thief'
  | 'wizard'
  | 'bard'
  | 'ranger'
export type MunchkinRace =
  | 'dwarf'
  | 'elf'
  | 'halfling'
  | 'human'
  | 'orc'
  | 'gnome'
export type Gender = 'male' | 'female'

export type Player = {
  id: string
  name: string
  level: number
  gear: number
  gender: Gender | null
  color?: string
  classes: MunchkinClass[]
  races: MunchkinRace[]
}

export type CombatState = {
  mainCombatantId: string | null
  helperIds: string[]
  partyModifier: number
  monsterLevel: number
  monsterModifier: number
}

export type GameSettings = {
  maxPlayers: number
  maxLevel: number
}
