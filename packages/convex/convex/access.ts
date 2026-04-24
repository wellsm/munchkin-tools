import { internalMutation, query } from './_generated/server'
import { v } from 'convex/values'
import { generateCode } from './lib/codes'

// PUBLIC — only reveals the flag, never the code itself.
export const isAccessCodeNeeded = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query('settings').first()

    if (!settings) {
      return false
    }

    return settings.accessCodeNeeded
  },
})

// PUBLIC — verifies a candidate access code without revealing the real one.
// Returns { ok: true } when the gate is off OR the code matches.
export const verifyAccessCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query('settings').first()

    if (!settings || !settings.accessCodeNeeded) {
      return { ok: true }
    }

    return { ok: settings.accessCode === args.code.trim() }
  },
})

// INTERNAL — toggle the flag. Enabling auto-generates a code if there is none.
export const setNeeded = internalMutation({
  args: { needed: v.boolean() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('settings').first()

    if (!existing) {
      await ctx.db.insert('settings', {
        accessCodeNeeded: args.needed,
        accessCode: args.needed ? generateCode() : null,
        rotatedAt: args.needed ? Date.now() : undefined,
      })

      return
    }

    const needsNewCode = args.needed && existing.accessCode === null
    const nextCode = needsNewCode ? generateCode() : existing.accessCode
    const rotatedAt = needsNewCode ? Date.now() : existing.rotatedAt

    await ctx.db.patch(existing._id, {
      accessCodeNeeded: args.needed,
      accessCode: nextCode,
      rotatedAt,
    })
  },
})

// INTERNAL — cron target. Rotates only when the flag is on.
export const rotateCode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('settings').first()

    if (!existing || !existing.accessCodeNeeded) {
      return
    }

    await ctx.db.patch(existing._id, {
      accessCode: generateCode(),
      rotatedAt: Date.now(),
    })
  },
})
