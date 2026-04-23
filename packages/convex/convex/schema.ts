import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  settings: defineTable({
    accessCodeNeeded: v.boolean(),
    accessCode: v.union(v.string(), v.null()),
    rotatedAt: v.optional(v.number()),
  }),

  rooms: defineTable({
    code: v.string(),
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
  }).index('by_code', ['code']),
})
