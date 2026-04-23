import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'

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

    const now = Date.now()
    const roomId = await ctx.db.insert('rooms', {
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
