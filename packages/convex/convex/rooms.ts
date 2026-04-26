import { AVATAR_COLORS } from '@munchkin-tools/utils/avatar-color'
import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { generateCode } from './lib/codes'

const MAX_CODE_GENERATION_ATTEMPTS = 10
const MAX_CLASSES_PER_PLAYER = 2
const MAX_RACES_PER_PLAYER = 2
const MAX_HELPERS = 1
const MIN_MAX_PLAYERS = 3
const PRODUCT_MAX_PLAYERS = 8
const DEFAULT_MAX_LEVEL = 10
const MIN_LEVEL = 1
const MAX_LEVEL_CEILING = 99

const classValidator = v.union(
  v.literal('cleric'),
  v.literal('warrior'),
  v.literal('thief'),
  v.literal('wizard'),
  v.literal('bard'),
  v.literal('ranger'),
)
const raceValidator = v.union(
  v.literal('dwarf'),
  v.literal('elf'),
  v.literal('halfling'),
  v.literal('human'),
  v.literal('orc'),
  v.literal('gnome'),
)
const genderValidator = v.union(v.literal('male'), v.literal('female'), v.null())

type Room = Doc<'rooms'>
type RoomPlayer = Room['players'][number]
type JoinRequest = Room['joinRequests'][number]

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
    color: AVATAR_COLORS[0],
    classes: [],
    races: [],
    ready: false,
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

// Combat controls (Monster Level, Modifiers, Remove Helper, Fled, Finish) can
// be operated by active participants (main combatant, current helper) OR by
// the host — hosts often referee from outside the fight.
function requireCombatControl(room: Room, requesterId: string): void {
  const requester = requireMember(room, requesterId)
  const isMain = room.combat.mainCombatantId === requesterId
  const isHelper = room.combat.helperIds.includes(requesterId)

  if (!isMain && !isHelper && !requester.isHost) {
    throw new Error('Only the fighter, their helper, or the host can control this combat')
  }
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
          ready: true,
        },
      ],
      combat: defaultCombat(),
      joinRequests: [],
      maxPlayers: PRODUCT_MAX_PLAYERS,
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

    if (room.started) {
      const pendingIndex = room.joinRequests.findIndex((r) => r.playerId === args.playerId)

      if (pendingIndex >= 0) {
        const current = room.joinRequests[pendingIndex]

        if (current.name === trimmedName) {
          return
        }

        const nextRequests = [...room.joinRequests]
        nextRequests[pendingIndex] = { ...current, name: trimmedName }
        await ctx.db.patch(args.roomId, { joinRequests: nextRequests })

        return
      }

      if (room.joinRequests.length >= PRODUCT_MAX_PLAYERS) {
        throw new Error('Too many pending join requests')
      }

      const nextRequests: JoinRequest[] = [
        ...room.joinRequests,
        {
          playerId: args.playerId,
          name: trimmedName,
          requestedAt: Date.now(),
        },
      ]

      await ctx.db.patch(args.roomId, { joinRequests: nextRequests })

      return
    }

    if (room.players.length >= room.maxPlayers) {
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
        color: AVATAR_COLORS[room.players.length]
      },
    ]

    await ctx.db.patch(args.roomId, { players: nextPlayers })
  },
})

export const approveJoinRequest = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    targetPlayerId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can approve join requests')
    }

    const pending = room.joinRequests.find((r) => r.playerId === args.targetPlayerId)

    if (!pending) {
      return
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full')
    }

    const nextRequests = room.joinRequests.filter((r) => r.playerId !== args.targetPlayerId)
    const nextPlayers: RoomPlayer[] = [
      ...room.players,
      {
        playerId: pending.playerId,
        name: pending.name,
        joinedAt: Date.now(),
        isHost: false,
        ...defaultHero(),
        color: AVATAR_COLORS[room.players.length % AVATAR_COLORS.length],
      },
    ]

    await ctx.db.patch(args.roomId, {
      players: nextPlayers,
      joinRequests: nextRequests,
    })
  },
})

export const denyJoinRequest = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    targetPlayerId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const requester = room.players.find((p) => p.playerId === args.requesterId)
    const isSelfCancel = args.requesterId === args.targetPlayerId

    if (!isSelfCancel && (!requester || !requester.isHost)) {
      throw new Error('Only the host can deny join requests')
    }

    const nextRequests = room.joinRequests.filter((r) => r.playerId !== args.targetPlayerId)

    if (nextRequests.length === room.joinRequests.length) {
      return
    }

    await ctx.db.patch(args.roomId, { joinRequests: nextRequests })
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

export const findRoomIdByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.code.trim().toUpperCase()

    if (normalized.length === 0) {
      return null
    }

    const room = await ctx.db
      .query('rooms')
      .withIndex('by_code', (q) => q.eq('code', normalized))
      .first()

    if (!room) {
      return null
    }

    return room._id
  },
})

export const leaveRoom = mutation({
  args: {
    roomId: v.id('rooms'),
    playerId: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      return
    }

    const leaver = room.players.find((p) => p.playerId === args.playerId)

    if (!leaver) {
      return
    }

    if (leaver.isHost) {
      await ctx.db.delete(args.roomId)

      return
    }

    const nextPlayers = room.players.filter((p) => p.playerId !== args.playerId)
    const nextCombat = {
      ...room.combat,
      mainCombatantId:
        room.combat.mainCombatantId === args.playerId ? null : room.combat.mainCombatantId,
      helperIds: room.combat.helperIds.filter((id) => id !== args.playerId),
    }
    const nextRequests = room.joinRequests.filter((r) => r.playerId !== args.playerId)

    await ctx.db.patch(args.roomId, {
      players: nextPlayers,
      combat: nextCombat,
      joinRequests: nextRequests,
    })
  },
})

export const setMaxPlayers = mutation({
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

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can change max players')
    }

    const clamped = clampInt(args.value, MIN_MAX_PLAYERS, PRODUCT_MAX_PLAYERS)
    const floor = Math.max(MIN_MAX_PLAYERS, room.players.length)
    const next = Math.max(clamped, floor)
    await ctx.db.patch(args.roomId, { maxPlayers: next })
  },
})

export const setMaxLevel = mutation({
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

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can change max level')
    }

    const nextMax = clampInt(args.value, MIN_LEVEL, MAX_LEVEL_CEILING)
    const demotedPlayers = room.players.map((p) => {
      if (p.level <= nextMax) {
        return p
      }

      return { ...p, level: nextMax }
    })
    await ctx.db.patch(args.roomId, { maxLevel: nextMax, players: demotedPlayers })
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
      ready: v.optional(v.boolean()),
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

    if (args.patch.ready !== undefined) {
      next.ready = args.patch.ready
    }

    const nextPlayers = [...room.players]
    nextPlayers[targetIndex] = next
    await ctx.db.patch(args.roomId, { players: nextPlayers })
  },
})

export const setSpectator = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    targetId: v.string(),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can change spectator status')
    }

    const targetIndex = room.players.findIndex((p) => p.playerId === args.targetId)

    if (targetIndex < 0) {
      throw new Error('Target player not found')
    }

    const next = [...room.players]
    next[targetIndex] = { ...next[targetIndex], isSpectator: args.value }

    // Removing a spectator from combat: if they were main or helper, drop them.
    let combat = room.combat

    if (args.value) {
      const isMain = combat.mainCombatantId === args.targetId

      if (isMain) {
        combat = { ...combat, mainCombatantId: null, helperIds: [] }
      } else if (combat.helperIds.includes(args.targetId)) {
        combat = { ...combat, helperIds: combat.helperIds.filter((id) => id !== args.targetId) }
      }
    }

    await ctx.db.patch(args.roomId, { players: next, combat })
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

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can set the main combatant')
    }

    if (args.targetId !== null) {
      const target = room.players.find((p) => p.playerId === args.targetId)

      if (!target) {
        throw new Error('Target player not found')
      }

      if (target.isSpectator) {
        throw new Error('Spectators cannot fight')
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

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can add a helper')
    }

    const helperPlayer = room.players.find((p) => p.playerId === args.helperId)

    if (!helperPlayer) {
      throw new Error('Helper not found in this room')
    }

    if (helperPlayer.isSpectator) {
      throw new Error('Spectators cannot fight')
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

    requireCombatControl(room, args.requesterId)

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

    requireCombatControl(room, args.requesterId)

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

    requireCombatControl(room, args.requesterId)

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

    requireCombatControl(room, args.requesterId)

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

    requireCombatControl(room, args.requesterId)

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

    requireCombatControl(room, args.requesterId)
    await ctx.db.patch(args.roomId, { combat: defaultCombat() })
  },
})

export type RoomId = Id<'rooms'>
