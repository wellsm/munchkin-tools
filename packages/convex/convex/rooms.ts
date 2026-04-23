import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { generateCode } from './lib/codes'

const MAX_CODE_GENERATION_ATTEMPTS = 10
const MAX_CLASSES_PER_PLAYER = 2
const MAX_RACES_PER_PLAYER = 2
const MAX_HELPERS = 1
const MAX_PLAYERS_PER_ROOM = 8
const DEFAULT_MAX_LEVEL = 10
const MIN_LEVEL = 1

const classValidator = v.union(
  v.literal('cleric'),
  v.literal('warrior'),
  v.literal('thief'),
  v.literal('wizard'),
)
const raceValidator = v.union(
  v.literal('dwarf'),
  v.literal('elf'),
  v.literal('halfling'),
  v.literal('human'),
)
const genderValidator = v.union(v.literal('male'), v.literal('female'), v.null())

type Room = Doc<'rooms'>
type RoomPlayer = Room['players'][number]

async function generateUniqueRoomCode(ctx: MutationCtx): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const candidate = generateCode()
    const existing = await ctx.db
      .query('rooms')
      .withIndex('by_code', (q) => q.eq('code', candidate))
      .first()

    if (!existing) {
      return candidate
    }
  }

  throw new Error('Could not generate a unique room code; try again')
}

function defaultHero(): Omit<RoomPlayer, 'playerId' | 'name' | 'joinedAt' | 'isHost'> {
  return {
    level: MIN_LEVEL,
    gear: 0,
    gender: null,
    color: null,
    classes: [],
    races: [],
  }
}

function defaultCombat(): Room['combat'] {
  return {
    mainCombatantId: null,
    helperIds: [],
    partyModifier: 0,
    monsterLevel: 0,
    monsterModifier: 0,
  }
}

function requireMember(room: Room, playerId: string): RoomPlayer {
  const member = room.players.find((p) => p.playerId === playerId)

  if (!member) {
    throw new Error('Not a room member')
  }

  return member
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, Math.round(value)))
}

export const createRoom = mutation({
  args: {
    playerId: v.string(),
    hostName: v.string(),
    accessCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.hostName.trim()

    if (trimmedName.length === 0) {
      throw new Error('Name is required')
    }

    if (args.playerId.trim().length === 0) {
      throw new Error('Player id is required')
    }

    const settings = await ctx.db.query('settings').first()
    const needed = settings?.accessCodeNeeded ?? false

    if (needed) {
      const providedCode = args.accessCode?.trim() ?? ''

      if (providedCode.length === 0) {
        throw new Error('Access code is required')
      }

      if (settings?.accessCode !== providedCode) {
        throw new Error('Invalid access code')
      }
    }

    const code = await generateUniqueRoomCode(ctx)
    const now = Date.now()
    const roomId = await ctx.db.insert('rooms', {
      code,
      hostName: trimmedName,
      players: [
        {
          playerId: args.playerId,
          name: trimmedName,
          joinedAt: now,
          isHost: true,
          ...defaultHero(),
        },
      ],
      combat: defaultCombat(),
      maxLevel: DEFAULT_MAX_LEVEL,
      started: false,
      createdAt: now,
    })

    return roomId
  },
})

export const joinRoom = mutation({
  args: {
    roomId: v.id('rooms'),
    playerId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    if (room.started) {
      throw new Error('Match already started')
    }

    const trimmedName = args.name.trim()

    if (trimmedName.length === 0) {
      throw new Error('Name is required')
    }

    if (args.playerId.trim().length === 0) {
      throw new Error('Player id is required')
    }

    const existingIndex = room.players.findIndex((p) => p.playerId === args.playerId)

    if (existingIndex >= 0) {
      const current = room.players[existingIndex]

      if (current.name === trimmedName) {
        return
      }

      const nextPlayers = [...room.players]
      nextPlayers[existingIndex] = { ...current, name: trimmedName }
      await ctx.db.patch(args.roomId, { players: nextPlayers })

      return
    }

    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      throw new Error('Room is full')
    }

    const nextPlayers: RoomPlayer[] = [
      ...room.players,
      {
        playerId: args.playerId,
        name: trimmedName,
        joinedAt: Date.now(),
        isHost: false,
        ...defaultHero(),
      },
    ]

    await ctx.db.patch(args.roomId, { players: nextPlayers })
  },
})

export const getRoom = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      return null
    }

    return room
  },
})

export const removePlayer = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const requester = room.players.find((p) => p.playerId === args.requesterId)

    if (!requester || !requester.isHost) {
      throw new Error('Only the host can remove players')
    }

    if (args.targetId === args.requesterId) {
      throw new Error('Host cannot remove themselves')
    }

    const nextPlayers = room.players.filter((p) => p.playerId !== args.targetId)

    if (nextPlayers.length === room.players.length) {
      return
    }

    const nextCombat = {
      ...room.combat,
      mainCombatantId:
        room.combat.mainCombatantId === args.targetId ? null : room.combat.mainCombatantId,
      helperIds: room.combat.helperIds.filter((id) => id !== args.targetId),
    }

    await ctx.db.patch(args.roomId, { players: nextPlayers, combat: nextCombat })
  },
})

export const startMatch = mutation({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    if (room.started) {
      return
    }

    await ctx.db.patch(args.roomId, { started: true })
  },
})

export const updatePlayer = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    targetId: v.string(),
    patch: v.object({
      name: v.optional(v.string()),
      level: v.optional(v.number()),
      gear: v.optional(v.number()),
      gender: v.optional(genderValidator),
      color: v.optional(v.union(v.string(), v.null())),
      classes: v.optional(v.array(classValidator)),
      races: v.optional(v.array(raceValidator)),
    }),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const requester = requireMember(room, args.requesterId)

    if (args.requesterId !== args.targetId && !requester.isHost) {
      throw new Error('Only the host can edit other players')
    }

    const targetIndex = room.players.findIndex((p) => p.playerId === args.targetId)

    if (targetIndex < 0) {
      throw new Error('Target player not found')
    }

    const target = room.players[targetIndex]
    const next: RoomPlayer = { ...target }

    if (args.patch.name !== undefined) {
      const trimmed = args.patch.name.trim()

      if (trimmed.length === 0) {
        throw new Error('Name cannot be empty')
      }

      next.name = trimmed
    }

    if (args.patch.level !== undefined) {
      next.level = clampInt(args.patch.level, MIN_LEVEL, room.maxLevel)
    }

    if (args.patch.gear !== undefined) {
      next.gear = Math.round(args.patch.gear) || 0
    }

    if (args.patch.gender !== undefined) {
      next.gender = args.patch.gender
    }

    if (args.patch.color !== undefined) {
      next.color = args.patch.color
    }

    if (args.patch.classes !== undefined) {
      next.classes = args.patch.classes.slice(0, MAX_CLASSES_PER_PLAYER)
    }

    if (args.patch.races !== undefined) {
      next.races = args.patch.races.slice(0, MAX_RACES_PER_PLAYER)
    }

    const nextPlayers = [...room.players]
    nextPlayers[targetIndex] = next
    await ctx.db.patch(args.roomId, { players: nextPlayers })
  },
})

export const setMainCombatant = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    targetId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    if (args.targetId !== null) {
      const exists = room.players.some((p) => p.playerId === args.targetId)

      if (!exists) {
        throw new Error('Target player not found')
      }
    }

    if (args.targetId === null) {
      await ctx.db.patch(args.roomId, {
        combat: { ...room.combat, mainCombatantId: null, helperIds: [] },
      })

      return
    }

    const nextHelpers = room.combat.helperIds.filter((id) => id !== args.targetId)
    await ctx.db.patch(args.roomId, {
      combat: { ...room.combat, mainCombatantId: args.targetId, helperIds: nextHelpers },
    })
  },
})

export const addHelper = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    helperId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    const helperExists = room.players.some((p) => p.playerId === args.helperId)

    if (!helperExists) {
      throw new Error('Helper not found in this room')
    }

    if (room.combat.mainCombatantId === args.helperId) {
      return
    }

    if (room.combat.helperIds.includes(args.helperId)) {
      return
    }

    if (room.combat.helperIds.length >= MAX_HELPERS) {
      return
    }

    await ctx.db.patch(args.roomId, {
      combat: {
        ...room.combat,
        helperIds: [...room.combat.helperIds, args.helperId],
      },
    })
  },
})

export const removeHelper = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    helperId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    const nextHelpers = room.combat.helperIds.filter((id) => id !== args.helperId)

    if (nextHelpers.length === room.combat.helperIds.length) {
      return
    }

    await ctx.db.patch(args.roomId, {
      combat: { ...room.combat, helperIds: nextHelpers },
    })
  },
})

export const clearHelpers = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    if (room.combat.helperIds.length === 0) {
      return
    }

    await ctx.db.patch(args.roomId, {
      combat: { ...room.combat, helperIds: [] },
    })
  },
})

export const setPartyModifier = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    await ctx.db.patch(args.roomId, {
      combat: { ...room.combat, partyModifier: Math.round(args.value) || 0 },
    })
  },
})

export const setMonsterLevel = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    await ctx.db.patch(args.roomId, {
      combat: {
        ...room.combat,
        monsterLevel: Math.max(0, Math.round(args.value) || 0),
      },
    })
  },
})

export const setMonsterModifier = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)

    await ctx.db.patch(args.roomId, {
      combat: { ...room.combat, monsterModifier: Math.round(args.value) || 0 },
    })
  },
})

export const resetCombat = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    requireMember(room, args.requesterId)
    await ctx.db.patch(args.roomId, { combat: defaultCombat() })
  },
})

export type RoomId = Id<'rooms'>
