import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Rotate the access code every 24 hours.
// The handler no-ops when accessCodeNeeded is false, so leaving the cron on
// when access-gating is disabled is harmless.
crons.interval(
  'rotate access code',
  { hours: 24 },
  internal.access.rotateCode,
  {},
)

export default crons
