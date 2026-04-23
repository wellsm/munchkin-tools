import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  accessCodes: defineTable({
    code: v.string(),
    active: v.boolean(),
    notes: v.optional(v.string()),
  }).index('by_code', ['code']),

  rooms: defineTable({
    hostName: v.string(),
    players: v.array(
      v.object({
        name: v.string(),
        joinedAt: v.number(),
        isHost: v.boolean(),
      }),
    ),
    started: v.boolean(),
    createdAt: v.number(),
  }),
})
