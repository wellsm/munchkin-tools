# @munchkin-tools/convex

Convex backend for Munchkin Tools.

## First-time setup

From the repo root, after `npm install`:

    cd packages/convex
    npx convex dev

This prompts for login, creates a Convex project, and generates `convex/_generated/`. The generated folder is gitignored.

## Schema

Edit `convex/schema.ts` and add tables. See https://docs.convex.dev/database/schemas.
