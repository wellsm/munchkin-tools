import { internalMutation, query } from './_generated/server'
import { v } from 'convex/values'

// PUBLIC — returns whether the support/donation CTA should show.
// Defaults to true when the flag hasn't been set yet (fresh deploys).
export const isSupportEnabled = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('settings').first()

    if (!settings) {
      return true
    }

    return settings.supportEnabled ?? true
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
        supportEnabled: args.enabled,
      })

      return
    }

    await ctx.db.patch(existing._id, { supportEnabled: args.enabled })
  },
})
