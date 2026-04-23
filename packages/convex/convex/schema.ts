import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Singleton row. At most one document exists at a time — queried via .first().
  settings: defineTable({
    accessCodeNeeded: v.boolean(),
    accessCode: v.union(v.string(), v.null()),
    rotatedAt: v.optional(v.number()),
  }),

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
