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
        playerId: v.string(),
        name: v.string(),
        level: v.number(),
        gear: v.number(),
        gender: v.union(v.literal('male'), v.literal('female'), v.null()),
        color: v.union(v.string(), v.null()),
        classes: v.array(
          v.union(
            v.literal('cleric'),
            v.literal('warrior'),
            v.literal('thief'),
            v.literal('wizard'),
          ),
        ),
        races: v.array(
          v.union(
            v.literal('dwarf'),
            v.literal('elf'),
            v.literal('halfling'),
            v.literal('human'),
          ),
        ),
        joinedAt: v.number(),
        isHost: v.boolean(),
        ready: v.boolean(),
      }),
    ),
    combat: v.object({
      mainCombatantId: v.union(v.string(), v.null()),
      helperIds: v.array(v.string()),
      partyModifier: v.number(),
      monsterLevel: v.number(),
      monsterModifier: v.number(),
    }),
    joinRequests: v.array(
      v.object({
        playerId: v.string(),
        name: v.string(),
        requestedAt: v.number(),
      }),
    ),
    maxPlayers: v.number(),
    maxLevel: v.number(),
    started: v.boolean(),
    createdAt: v.number(),
  }).index('by_code', ['code']),
})
