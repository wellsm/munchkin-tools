# @munchkin-tools/web

Mobile-first Vite + React app for Munchkin Tools.

## Convex setup (first time)

The online features require Convex. Before `npm run dev` works end-to-end:

1. From the repo root: `cd packages/convex && npx convex dev` — prompts for login and creates a deployment.
2. Copy the deployment URL it prints into `apps/web/.env.local`:

       VITE_CONVEX_URL=https://your-deployment.convex.cloud

3. Seed an access code via the Convex dashboard or:

       cd packages/convex
       npx convex run accessCodes:seed --json '{"code":"LETME1N","notes":"dev"}'
