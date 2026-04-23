import { mutation, query } from './_generated/server'
import type { MutationCtx } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { generateCode } from './lib/codes'

const MAX_CODE_GENERATION_ATTEMPTS = 10

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
        },
      ],
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

    const nextPlayers = [
      ...room.players,
      {
        playerId: args.playerId,
        name: trimmedName,
        joinedAt: Date.now(),
        isHost: false,
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

    await ctx.db.patch(args.roomId, { players: nextPlayers })
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

export type RoomId = Id<'rooms'>
