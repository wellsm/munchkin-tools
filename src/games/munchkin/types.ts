export type MunchkinClass = 'cleric' | 'warrior' | 'thief' | 'wizard'
export type MunchkinRace = 'dwarf' | 'elf' | 'halfling' | 'human'

export type Player = {
  id: string
  name: string
  level: number
  itemBonus: number
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
