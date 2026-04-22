export type MunchkinClass = 'cleric' | 'warrior' | 'thief' | 'wizard'
export type MunchkinRace = 'dwarf' | 'elf' | 'halfling' | 'human'
export type Gender = 'male' | 'female'

export type Player = {
  id: string
  name: string
  level: number
  gear: number
  gender: Gender | null
  classes: MunchkinClass[]
  races: MunchkinRace[]
}

export type CombatState = {
  participatingIds: string[]
  munchkinBuff: number
  monsterLevel: number
  monsterBuff: number
}

export type GameSettings = {
  maxPlayers: number
  maxLevel: number
}
