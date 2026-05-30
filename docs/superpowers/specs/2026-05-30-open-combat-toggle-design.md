# Open Combat Toggle — Design

**Date:** 2026-05-30
**Status:** Approved

## Goal

Add a host-only room setting that lets non-host players run combat. When the
host enables "open combat", any non-spectator player can start a combat, and
the player who started it can control that combat and add one helper
(ajudante) — abilities that are otherwise host-only.

## Background

The online game already has a layered permission model:

- `requireCombatControl(room, requesterId)` (`packages/convex/convex/rooms.ts`)
  gates monster-level / modifier / remove-helper / finish / flee actions to the
  main combatant, current helper, or host.
- `setMainCombatant` and `addHelper` are host-only.
- Room-level settings (`maxPlayers`, `maxLevel`) are stored on the `rooms`
  document and synced to all peers via Convex subscriptions. Host-only toggles
  live in `online-settings-tab.tsx`.
- Spectators (`isSpectator`) stay in the room but cannot fight and are filtered
  out of pickers.

This feature adds one room toggle and threads "the starter" through the combat
permission checks.

## Behavior (toggle ON)

- Any non-spectator player can start a combat (pick the main combatant).
- The player who started the current combat can control it (monster level,
  modifiers, remove helper, finish, flee) and add one helper.
- Other players who are not the starter, not a fighter, and not the host get no
  control (unchanged from today).
- The host always controls everything (unchanged).

Behavior (toggle OFF) is identical to current behavior: host-only start,
host/main/helper control.

## Data Model (`packages/convex/convex/schema.ts`)

Add to the `rooms` table:

- `openCombat: v.optional(v.boolean())` — room toggle, default off (absent ==
  off).

Add to the `combat` object:

- `startedById: v.optional(v.union(v.string(), v.null()))` — playerId of whoever
  started the current combat, or null.

Both fields are optional, so existing room documents validate without a
migration. `defaultCombat()` returns `startedById: null`.

## Backend (`packages/convex/convex/rooms.ts`)

1. **`setOpenCombat` mutation (new, host-only).** Args:
   `{ roomId, requesterId, value: boolean }`. Validates requester is host,
   patches `openCombat`.

2. **`setMainCombatant` permission change.** Replace the host-only check with:
   allow if requester is host OR (`room.openCombat` is true AND requester is not
   a spectator). When starting (targetId !== null), set
   `combat.startedById = requesterId`. When clearing (targetId === null), set
   `combat.startedById = null`. Spectator-cannot-fight check on the target stays.

3. **`requireCombatControl` change.** Add the starter when open combat is on:

   ```ts
   const isStarter = room.combat.startedById === requesterId
   if (!isMain && !isHelper && !requester.isHost && !(room.openCombat && isStarter)) {
     throw new Error(...)
   }
   ```

4. **`addHelper` permission change.** Replace the host-only check with: allow if
   requester is host OR (`room.openCombat` is true AND
   `room.combat.startedById === requesterId`). The max-1-helper limit and the
   spectator-cannot-be-helper check stay.

`resetCombat` already resets combat via `defaultCombat()`, so `startedById`
returns to null on reset. No other mutation needs the starter.

## Frontend

1. **`online-settings-tab.tsx`.** Add a host-only `Switch` "Open combat" with a
   short hint, in the host party/settings section. `onCheckedChange` calls a new
   `setOpenCombat` mutation with `{ roomId, requesterId: playerId, value }`.

2. **`online-who-fights-view.tsx`.** The non-host early-return gate changes from
   `if (!isHost)` to `if (!isHost && !(room.openCombat && !viewer?.isSpectator))`.
   When open combat is on, a non-spectator non-host sees the main-combatant
   picker instead of the "waiting for host" message.

3. **`online-fighting-view.tsx`.** Compute
   `const isStarter = combat.startedById === requesterId`, then:
   - `canControl = isMain || isHelper || isHost || (room.openCombat && isStarter)`
   - `canAddHelper = (isHost || (room.openCombat && isStarter)) && helpers.length < 1`

4. **i18n (`apps/web/src/lib/i18n/en.ts`, `pt.ts`).** Add label and hint strings
   for the open-combat toggle under the settings namespace.

## Error Handling

Backend mutations throw on permission failure (existing pattern); the frontend
already surfaces thrown messages via the `runMutation`/`catch` + `error` state
in the pickers and fighting view. No new error surfaces needed.

## Testing

- Manual: host toggles open combat on; a second non-host player starts a
  combat, sets monster level, adds a helper, and finishes — all succeed. A
  third player (not starter, not fighter) sees no controls. Spectator cannot
  start. Toggle off restores host-only behavior.
- Verify existing rooms (no `openCombat` / `startedById`) still load and combat
  works host-only.

## Out of Scope

- Letting non-starters control combat when open (explicitly chose
  starter-only).
- Per-player combat-control permissions or roles beyond host/starter.
- Removing the 1-helper limit.
