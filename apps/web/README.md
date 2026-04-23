# @munchkin-tools/web

Mobile-first Vite + React app for Munchkin Tools.

## Convex setup (first time)

The online features require Convex. Before `npm run dev` works end-to-end:

1. From the repo root: `cd packages/convex && npx convex dev` — prompts for login and creates a deployment.
2. Copy the deployment URL it prints into `apps/web/.env.local`:

       VITE_CONVEX_URL=https://your-deployment.convex.cloud

### Access gating (optional)

By default, room creation is open — anyone can create a room. To require an access code:

- From the repo root:

       cd packages/convex
       npx convex run access:setNeeded --json '{"needed":true}'

  The first call also generates a 6-char code.

- The current code lives in the Convex dashboard → Data → `settings` table → `accessCode` field. Share it with testers.
- A cron (`packages/convex/convex/crons.ts`) rotates the code every 24 hours.
- To disable gating: `npx convex run access:setNeeded --json '{"needed":false}'`.
