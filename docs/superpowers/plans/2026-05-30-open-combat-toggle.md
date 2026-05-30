# Open Combat Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a host-only "open combat" room toggle so any non-spectator player can start a combat, and the starter can control it and add one helper.

**Architecture:** Two new optional fields on the Convex `rooms` schema (`openCombat` on the room, `startedById` on the combat object). Backend mutations widen their host-only permission checks to also accept the starter when open combat is on. Frontend gates (`who-fights` start, `fighting-view` control/add-helper) mirror the same logic, and the settings tab gains a host-only Switch.

**Tech Stack:** Convex (backend mutations + schema validators) in `packages/convex`; React 19 + TypeScript (Vite) in `apps/web`; Tailwind; i18n via typed strings objects (`en.ts`/`pt.ts`). Monorepo uses **npm workspaces**.

**Verification model:** This repo has automated tests ONLY for pure functions in `apps/web` (vitest — `apps/web/src/lib/*.test.ts`). There is no Convex mutation test harness (`convex-test` is not installed) and no `typecheck` npm script. Do NOT add a test framework or Convex tests — out of scope. Per-task verification uses these real commands:
- Web TypeScript: `npm run build --workspace=@munchkin-tools/web` (runs `tsc -b && vite build`).
- Web lint: `npm run lint --workspace=@munchkin-tools/web`.
- Web unit tests: `npm test --workspace=@munchkin-tools/web` (vitest run).
- Convex: there is no offline typecheck script — schema + mutation validity is confirmed when `convex dev` pushes (Task 11). For Convex-only tasks, the verification is "code matches the snippet; full validation deferred to the push in Task 11."

---

### Task 1: Schema — add `openCombat` and `startedById`

**Files:**
- Modify: `packages/convex/convex/schema.ts` (the `combat` object ~line 58-64; room fields ~line 72-76)

- [ ] **Step 1: Add `startedById` to the combat object**

In `packages/convex/convex/schema.ts`, change the `combat` object from:

```ts
    combat: v.object({
      mainCombatantId: v.union(v.string(), v.null()),
      helperIds: v.array(v.string()),
      partyModifier: v.number(),
      monsterLevel: v.number(),
      monsterModifier: v.number(),
    }),
```

to:

```ts
    combat: v.object({
      mainCombatantId: v.union(v.string(), v.null()),
      helperIds: v.array(v.string()),
      partyModifier: v.number(),
      monsterLevel: v.number(),
      monsterModifier: v.number(),
      startedById: v.optional(v.union(v.string(), v.null())),
    }),
```

- [ ] **Step 2: Add `openCombat` room field**

In the same file, in the `rooms` table fields, add `openCombat` right after `started: v.boolean(),`:

```ts
    started: v.boolean(),
    openCombat: v.optional(v.boolean()),
    createdAt: v.number(),
```

- [ ] **Step 3: Verify**

Both fields are `v.optional`, so existing documents stay valid (no migration). Full validation happens on the Convex push in Task 11. Confirm the edits match the snippets above.

- [ ] **Step 4: Commit**

```bash
git add packages/convex/convex/schema.ts
git commit -m "feat(schema): add openCombat room flag and combat.startedById"
```

---

### Task 2: Backend — `defaultCombat` sets `startedById`

**Files:**
- Modify: `packages/convex/convex/rooms.ts:68-76`

- [ ] **Step 1: Add `startedById: null` to `defaultCombat`**

Change `defaultCombat` from:

```ts
function defaultCombat(): Room['combat'] {
  return {
    mainCombatantId: null,
    helperIds: [],
    partyModifier: 0,
    monsterLevel: 0,
    monsterModifier: 0,
  }
}
```

to:

```ts
function defaultCombat(): Room['combat'] {
  return {
    mainCombatantId: null,
    helperIds: [],
    partyModifier: 0,
    monsterLevel: 0,
    monsterModifier: 0,
    startedById: null,
  }
}
```

- [ ] **Step 2: Verify**

`Room['combat']` now includes the optional `startedById`; this satisfies it explicitly. Validation deferred to Task 11 push.

- [ ] **Step 3: Commit**

```bash
git add packages/convex/convex/rooms.ts
git commit -m "feat(combat): reset startedById in defaultCombat"
```

---

### Task 3: Backend — `requireCombatControl` accepts the starter when open

**Files:**
- Modify: `packages/convex/convex/rooms.ts:96-107`

- [ ] **Step 1: Widen `requireCombatControl`**

Replace the function (lines 96-107) with:

```ts
// Combat controls (Monster Level, Modifiers, Remove Helper, Fled, Finish) can
// be operated by active participants (main combatant, current helper) OR by
// the host — hosts often referee from outside the fight. When the room has
// open combat enabled, the player who started the combat can also control it.
function requireCombatControl(room: Room, requesterId: string): void {
  const requester = requireMember(room, requesterId)
  const isMain = room.combat.mainCombatantId === requesterId
  const isHelper = room.combat.helperIds.includes(requesterId)
  const isStarter = room.openCombat === true && room.combat.startedById === requesterId

  if (!isMain && !isHelper && !requester.isHost && !isStarter) {
    throw new Error('Only the fighter, their helper, or the host can control this combat')
  }
}
```

- [ ] **Step 2: Verify**

Confirm edit matches snippet. Validation deferred to Task 11 push.

- [ ] **Step 3: Commit**

```bash
git add packages/convex/convex/rooms.ts
git commit -m "feat(combat): let starter control combat when open"
```

---

### Task 4: Backend — `setMainCombatant` allows starter to begin, records `startedById`

**Files:**
- Modify: `packages/convex/convex/rooms.ts:659-703`

- [ ] **Step 1: Replace the permission check**

In `setMainCombatant`'s handler, replace the host-only check:

```ts
    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can set the main combatant')
    }
```

with:

```ts
    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost && !(room.openCombat === true && !requester.isSpectator)) {
      throw new Error('Only the host can set the main combatant')
    }
```

- [ ] **Step 2: Record/clear `startedById` in both patch branches**

The clear branch (targetId === null) becomes:

```ts
    if (args.targetId === null) {
      await ctx.db.patch(args.roomId, {
        combat: { ...room.combat, mainCombatantId: null, helperIds: [], startedById: null },
      })

      return
    }
```

The set branch (bottom of the handler) becomes:

```ts
    const nextHelpers = room.combat.helperIds.filter((id) => id !== args.targetId)
    await ctx.db.patch(args.roomId, {
      combat: {
        ...room.combat,
        mainCombatantId: args.targetId,
        helperIds: nextHelpers,
        startedById: args.requesterId,
      },
    })
```

- [ ] **Step 3: Verify**

The existing target-spectator check (`if (target.isSpectator) throw`) stays unchanged above these branches. Confirm edits match snippets. Validation deferred to Task 11 push.

- [ ] **Step 4: Commit**

```bash
git add packages/convex/convex/rooms.ts
git commit -m "feat(combat): let non-host start combat when open and record starter"
```

---

### Task 5: Backend — `addHelper` allows the starter when open

**Files:**
- Modify: `packages/convex/convex/rooms.ts:705-722`

- [ ] **Step 1: Widen the permission check**

In `addHelper`'s handler, replace:

```ts
    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can add a helper')
    }
```

with:

```ts
    const requester = requireMember(room, args.requesterId)
    const isStarter = room.openCombat === true && room.combat.startedById === args.requesterId

    if (!requester.isHost && !isStarter) {
      throw new Error('Only the host can add a helper')
    }
```

- [ ] **Step 2: Verify**

The spectator-helper check and `MAX_HELPERS` limit below stay unchanged. Confirm edit matches snippet. Validation deferred to Task 11 push.

- [ ] **Step 3: Commit**

```bash
git add packages/convex/convex/rooms.ts
git commit -m "feat(combat): let starter add helper when open"
```

---

### Task 6: Backend — `setOpenCombat` mutation (host-only)

**Files:**
- Modify: `packages/convex/convex/rooms.ts` (add immediately after the `setMaxLevel` mutation block, ~line 498)

- [ ] **Step 1: Add the mutation**

Add this new mutation right after the `setMaxLevel` mutation's closing `})`:

```ts
export const setOpenCombat = mutation({
  args: {
    roomId: v.id('rooms'),
    requesterId: v.string(),
    value: v.boolean(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const requester = requireMember(room, args.requesterId)

    if (!requester.isHost) {
      throw new Error('Only the host can change open combat')
    }

    await ctx.db.patch(args.roomId, { openCombat: args.value })
  },
})
```

- [ ] **Step 2: Verify**

The generated API (`api.rooms.setOpenCombat`) is produced by codegen on the Convex push (Task 11). Confirm the mutation matches the existing `setMaxLevel` pattern.

- [ ] **Step 3: Commit**

```bash
git add packages/convex/convex/rooms.ts
git commit -m "feat(rooms): add host-only setOpenCombat mutation"
```

---

### Task 7: i18n — add toggle strings

**Files:**
- Modify: `apps/web/src/lib/i18n/en.ts` (after `maxLevelHint`, ~line 226)
- Modify: `apps/web/src/lib/i18n/pt.ts` (after `maxLevelHint`, ~line 229)

- [ ] **Step 1: Add keys to `en.ts`**

In the `settings` object in `apps/web/src/lib/i18n/en.ts`, add right after the `maxLevelHint:` line:

```ts
    openCombat: 'Open combat',
    openCombatHint: 'Let any player start and run their own combat',
```

- [ ] **Step 2: Add keys to `pt.ts`**

In the matching `settings` object in `apps/web/src/lib/i18n/pt.ts`, add right after the `maxLevelHint:` line:

```ts
    openCombat: 'Combate aberto',
    openCombatHint: 'Permite que qualquer jogador inicie e conduza o próprio combate',
```

- [ ] **Step 3: Verify**

Run: `npm run build --workspace=@munchkin-tools/web`
Expected: PASS. `en.ts` and `pt.ts` share a derived type; if either is missing a key, `tsc -b` fails — that mutual check is the safety net.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/i18n/en.ts apps/web/src/lib/i18n/pt.ts
git commit -m "i18n: add open-combat toggle strings"
```

---

### Task 8: Frontend — settings tab toggle

**Files:**
- Modify: `apps/web/src/components/online/online-settings-tab.tsx`

- [ ] **Step 1: Wire the mutation**

After `const setMaxLevel = useMutation(api.rooms.setMaxLevel)` (~line 58), add:

```tsx
  const setOpenCombat = useMutation(api.rooms.setOpenCombat)
```

- [ ] **Step 2: Add the Switch row inside the host party section**

In the host `party` section, after the second `StepperCard` (the `maxLevel` one, closing `/>` at ~line 124) and before the closing `</div>` of the `flex flex-col gap-3 mb-2` wrapper, add a Switch card matching the existing `keepAwake` pattern:

```tsx
              <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
                    {t.settings.openCombat}
                  </span>
                  <Switch
                    checked={room.openCombat ?? false}
                    onCheckedChange={(v) =>
                      setOpenCombat({ roomId, requesterId: playerId, value: v })
                    }
                    aria-label={t.settings.openCombat}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {t.settings.openCombatHint}
                </span>
              </section>
```

`Switch` is already imported (line 33); `roomId` and `playerId` are already in scope.

- [ ] **Step 3: Verify**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/online/online-settings-tab.tsx
git commit -m "feat(settings): host toggle for open combat"
```

---

### Task 9: Frontend — non-host can open the who-fights picker

**Files:**
- Modify: `apps/web/src/components/online/online-who-fights-view.tsx:47-60`

- [ ] **Step 1: Widen the non-host gate**

The component already computes `const viewer = room.players.find((p) => p.playerId === viewerId)` (line 21) and `const isHost = viewer?.isHost ?? false` (line 22). Change the early-return guard from:

```tsx
  if (!isHost) {
```

to:

```tsx
  const canStart =
    isHost || (room.openCombat === true && viewer != null && !viewer.isSpectator);

  if (!canStart) {
```

Place the `const canStart` block just above the `if`. The picker (`OnlineMainCombatantPickerSheet`) in the non-guarded return already calls `setMainCombatant` with the viewer's `requesterId`, so no other change is needed here.

- [ ] **Step 2: Verify**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/online/online-who-fights-view.tsx
git commit -m "feat(combat): non-host can start combat when open"
```

---

### Task 10: Frontend — starter controls and adds helper in fighting view

**Files:**
- Modify: `apps/web/src/components/online/online-fighting-view.tsx:120-125`

- [ ] **Step 1: Add starter to the control gates**

Replace lines 124-125:

```tsx
  const canControl = isMain || isHelper || isHost;
  const canAddHelper = isHost && helpers.length < 1;
```

with:

```tsx
  const isStarter = room.openCombat === true && combat.startedById === requesterId;
  const canControl = isMain || isHelper || isHost || isStarter;
  const canAddHelper = (isHost || isStarter) && helpers.length < 1;
```

`combat`, `requesterId`, `isMain`, `isHelper`, `isHost`, and `helpers` are all already in scope above these lines.

- [ ] **Step 2: Verify**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/online/online-fighting-view.tsx
git commit -m "feat(combat): starter controls and adds helper when open"
```

---

### Task 11: Full verification + manual smoke test

**Files:** none (verification only)

- [ ] **Step 1: Build, lint, unit tests**

Run:
```bash
npm run build --workspace=@munchkin-tools/web
npm run lint --workspace=@munchkin-tools/web
npm test --workspace=@munchkin-tools/web
```
Expected: all PASS (existing pure-function tests unaffected).

- [ ] **Step 2: Push Convex + run the web app**

Run (two terminals from repo root): `npm run dev:convex` and `npm run dev:web` (or just `npm run dev` to run both).
`convex dev` pushes the new schema + `setOpenCombat` mutation and runs codegen — this is where Convex schema/mutation validity is confirmed. Expected: push succeeds with no schema errors.

- [ ] **Step 3: Manual smoke test**

In the browser (two profiles/devices for host + player):
1. Host creates a room; two more players join (3 non-spectators total so the Combat tab unlocks).
2. Host opens Settings → toggles **Open combat** ON.
3. As a non-host player, open the Combat tab → confirm the who-fights picker appears (not "waiting for host"). Pick yourself as main combatant.
4. As that same starter, set monster level/modifier, add one helper → all succeed.
5. As a third player (not starter, not fighter, not host), open the fight view → confirm control buttons and add-helper are hidden/disabled.
6. Host marks a player spectator (Settings) → confirm that spectator cannot start combat even with open combat on.
7. Host toggles **Open combat** OFF → confirm non-host again sees "waiting for host" and cannot control.
8. Reload an existing room (no `openCombat`/`startedById`) → confirm it loads and host-only combat still works.

- [ ] **Step 4: Final commit (only if cleanup was needed)**

```bash
git add -A
git commit -m "chore: open-combat toggle verification cleanup"
```
(Skip if nothing changed.)
