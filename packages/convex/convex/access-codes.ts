import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

// Call from the Convex dashboard: Run function → accessCodes:seed → args { code, notes }
// Or use `npx convex run accessCodes:seed --json '{"code":"ABC123","notes":"first test"}'`
export const seed = internalMutation({
  args: {
    code: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('accessCodes')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { active: true, notes: args.notes })

      return existing._id
    }

    return ctx.db.insert('accessCodes', {
      code: args.code,
      active: true,
      notes: args.notes,
    })
  },
})

export const deactivate = internalMutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('accessCodes')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .first()

    if (!existing) {
      return
    }

    await ctx.db.patch(existing._id, { active: false })
  },
})
