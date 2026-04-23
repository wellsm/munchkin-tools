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
    hostName: v.string(),
    accessCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.hostName.trim()

    if (trimmedName.length === 0) {
      throw new Error('Name is required')
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
      players: [{ name: trimmedName, joinedAt: now, isHost: true }],
      started: false,
      createdAt: now,
    })

    return roomId
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
