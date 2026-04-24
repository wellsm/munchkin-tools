import { internalMutation, mutation, query } from './_generated/server'
import { v } from 'convex/values'

const MAX_MESSAGE_LENGTH = 2000
const MAX_FIELD_LENGTH = 200

// PUBLIC — returns whether the in-app suggestions CTA should show.
// Defaults to true when the flag hasn't been set yet.
export const isEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('settings').first()

    if (!settings) {
      return true
    }

    return settings.suggestionsEnabled ?? true
  },
})

// INTERNAL — toggle the flag from the Convex dashboard.
export const setEnabled = internalMutation({
  args: { enabled: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('settings').first()

    if (!existing) {
      await ctx.db.insert('settings', {
        accessCodeNeeded: false,
        accessCode: null,
        suggestionsEnabled: args.enabled,
      })

      return
    }

    await ctx.db.patch(existing._id, { suggestionsEnabled: args.enabled })
  },
})

export const submit = mutation({
  args: {
    name: v.optional(v.string()),
    contact: v.optional(v.string()),
    message: v.string(),
    playerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query('settings').first()
    const enabled = settings?.suggestionsEnabled ?? true

    if (!enabled) {
      throw new Error('Suggestions are disabled')
    }

    const message = args.message.trim()

    if (message.length === 0) {
      throw new Error('Message is required')
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new Error('Message too long')
    }

    const name = args.name?.trim().slice(0, MAX_FIELD_LENGTH) || null
    const contact = args.contact?.trim().slice(0, MAX_FIELD_LENGTH) || null
    const playerId = args.playerId?.trim() || null

    await ctx.db.insert('suggestions', {
      name,
      contact,
      message,
      playerId,
      createdAt: Date.now(),
    })
  },
})
