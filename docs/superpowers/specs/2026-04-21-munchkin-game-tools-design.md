# Game Tools — Munchkin Companion App

**Date:** 2026-04-21
**Status:** Approved design, pending implementation plan

## Purpose

A web companion app for tabletop game sessions. The physical table remains the source of truth; the app is a fast calculator that removes the need to redo arithmetic mid-round (level + items + buffs = strength vs monster total).

First (only) supported game: **Munchkin**. Architecture is multi-game: adding a new game should be a single directory under `src/games/<game>/` plus one entry in a registry.

## Non-goals

- Replacing the physical game or cards
- Tracking card inventory, treasure piles, or turn order
- Multi-device sync / multiplayer server
- Authentication / accounts
- Per-player buffs in combat (confirmed: team-level only)

## Stack

- **Vite** (build / dev server)
- **React** + **TypeScript**
- **Tailwind CSS 4** (semantic tokens only — `bg-primary`, `text-foreground`, `bg-destructive` etc., never raw colors like `bg-blue-500`)
- **shadcn/ui** (primitives: Button, Input, Dialog, AlertDialog, Tabs, Badge)
- **Zustand** (state per game, with `persist` middleware)
- **React Router v6** (routing)
- **Vitest** + **@testing-library/react** (tests)
- **lucide-react** (icons; ships with shadcn)

## Code style conventions

- **File names:** `snake_case` (e.g. `player_card.tsx`)
- **Classes / function components:** `PascalCase` (e.g. `function PlayerCard()`)
- **Functions / hooks / helpers:** `camelCase` (e.g. `calculateStrength`)
- **Constants:** `UPPER_CASE` (e.g. `MAX_PLAYERS`, `CLASSES`)
- **No single-line `if` with return** — always use block form
- **Always one blank line before** `return`, `if`, `continue`, `break`
- shadcn-generated files under `components/ui/` keep their `kebab-case` (generated code; not rewritten)

## Directory layout

```
src/
├── routes/
│   ├── home.tsx                       # function Home() — list of games
│   └── munchkin_game.tsx               # function MunchkinGame() — 3 tabs
├── games/
│   ├── registry.ts                    # GAMES catalogue (id, name, path, icon)
│   └── munchkin/
│       ├── store.ts                   # Zustand store + persist
│       ├── types.ts                   # Player, MunchkinClass, MunchkinRace, CombatState, GameSettings
│       ├── constants.ts               # CLASSES, RACES catalogues with icon & label
│       ├── lib/
│       │   ├── strength.ts            # calculateStrength(player)
│       │   ├── combat.ts              # combatTotals(players, combat) -> { munchkinTotal, monsterTotal, outcome }
│       │   ├── grid_layout.ts         # gridLayoutFor(count) -> { cols, rows, density }
│       │   ├── strength.test.ts
│       │   ├── combat.test.ts
│       │   └── grid_layout.test.ts
│       ├── components/
│       │   ├── player_card.tsx        # function PlayerCard({ player, density })
│       │   ├── player_form.tsx        # shared add/edit
│       │   └── player_detail_dialog.tsx
│       ├── tabs/
│       │   ├── players_tab.tsx
│       │   ├── combat_tab.tsx
│       │   └── settings_tab.tsx
│       └── store.test.ts
├── components/ui/                     # shadcn components (kebab-case, generated)
├── lib/utils.ts                       # cn() from shadcn
├── app.tsx                            # Router + ThemeProvider
└── main.tsx                           # entrypoint
```

## Data model

```ts
// src/games/munchkin/types.ts

export type MunchkinClass = 'cleric' | 'warrior' | 'thief' | 'wizard'
export type MunchkinRace = 'dwarf' | 'elf' | 'halfling' | 'human'

export type Player = {
  id: string            // crypto.randomUUID()
  name: string          // required, trimmed, non-empty
  level: number         // integer, 1..settings.maxLevel
  itemBonus: number     // integer, may be negative
  classes: MunchkinClass[]   // 0..2 (Super Munchkin rule)
  races: MunchkinRace[]      // 0..2 (Half-Breed rule)
}

export type CombatState = {
  participatingIds: string[]   // Player.id of players checked-in to fight
  munchkinBuff: number         // team buff, integer, may be negative
  monsterLevel: number         // integer, >= 0
  monsterBuff: number          // integer, may be negative
}

export type GameSettings = {
  maxPlayers: number           // default 8, range 2..8
  maxLevel: number             // default 10
}
```

**Derived (not stored):**

- `strength(player) = player.level + player.itemBonus`
- `munchkinTotal = sum(strength(p) for p in participating) + munchkinBuff`
- `monsterTotal = monsterLevel + monsterBuff`
- `outcome = munchkinTotal > monsterTotal ? 'winning' : 'losing'` (tie = monster wins, standard Munchkin rule)

## Store

```ts
// src/games/munchkin/store.ts (shape only)
type MunchkinStore = {
  players: Player[]
  settings: GameSettings
  combat: CombatState

  addPlayer: (input: Omit<Player, 'id'>) => void
  updatePlayer: (id: string, patch: Partial<Omit<Player, 'id'>>) => void
  removePlayer: (id: string) => void

  toggleParticipant: (id: string) => void
  setMunchkinBuff: (n: number) => void
  setMonsterLevel: (n: number) => void
  setMonsterBuff: (n: number) => void
  resetCombat: () => void

  setMaxPlayers: (n: number) => void
  setMaxLevel: (n: number) => void
  resetAllPlayers: () => void
}
```

**Persistence:** `persist` middleware, partializing so only `players` and `settings` hit localStorage. `combat` is ephemeral.

**Storage key:** `munchkin-store-v1` (versioned to allow future migrations).

## Routes & navigation

- `/` — `Home`: cards derived from `GAMES` registry; only Munchkin visible for now.
- `/munchkin` — `MunchkinGame`: 3 tabs (`Players`, `Combat`, `Settings`).

**Layout of `/munchkin`:**

```
┌────────────────────────────────────┐
│  ← Voltar     Munchkin             │  slim header
├────────────────────────────────────┤
│                                    │
│     active tab content             │  flex-1, overflow-hidden
│                                    │
├────────────────────────────────────┤
│  👥 Players  ⚔️ Combate  ⚙️ Config  │  fixed bottom tab bar
└────────────────────────────────────┘
```

- Container: `flex flex-col h-dvh` (dynamic viewport height → iOS-safe).
- Tab bar at the bottom via shadcn `Tabs` with `TabsList` placed after `TabsContent` in DOM and flex order.
- Player detail = shadcn `Dialog` modal (no separate route).

## Components

### `player_card.tsx`
Props: `{ player: Player; density: 'loose' | 'normal' | 'dense' }`

Displays: name, level, item sum, strength (large), class icons, race icons. Classes use `text-primary` in circular container; races use `text-accent-foreground` in rounded-square container — shape + color distinguish them.

Density affects typography and internal layout:
- `loose` (≤4): `text-2xl` name, `text-5xl` strength, `p-6`
- `normal` (5–6): `text-xl` name, `text-4xl` strength, `p-4`
- `dense` (7–8): `text-lg` name, `text-3xl` strength, `p-3`, icons `size-4`, icons stacked below name instead of beside

Clicking the card opens `PlayerDetailDialog`.

### `player_form.tsx`
Shared by add / edit flows. Fields:
- Name (`Input`, required, trimmed)
- Level (number stepper, 1..`settings.maxLevel`)
- Item bonus (number stepper, integer, any sign)
- Classes (chip selector, max 2, `CLASSES` catalogue)
- Races (chip selector, max 2, `RACES` catalogue)

Validation is synchronous; submit button disabled until valid.

### `player_detail_dialog.tsx`
Modal showing all fields with icon **and** text label (e.g. "Clérigo ✝️", "Elfo 🧝"). Two actions: **Edit** (switches dialog body to `PlayerForm` in edit mode) and **Remove** (`AlertDialog` confirmation).

### `players_tab.tsx`
- Grid: `gridLayoutFor(players.length)` drives `cols`/`rows`/`density`.
- FAB in top-right: "+ Adicionar". Hidden when `players.length >= settings.maxPlayers`.
- Empty state when `players.length === 0`: centered CTA.

### `combat_tab.tsx`
Two regions (side-by-side on desktop, stacked on mobile):
- **Left / top** — list of players with a checkbox each → toggles `participatingIds`.
- **Right / bottom** — totals panel:
  - Munchkins block: summed strength of participants + `munchkinBuff` stepper
  - Monster block: `monsterLevel` input + `monsterBuff` stepper
  - Outcome badge: "Vencendo por X" (`bg-primary`) or "Perdendo por Y" (`bg-destructive`)
  - "Resetar combate" button

### `settings_tab.tsx`
- `maxPlayers` stepper (2..8). `-` disabled when `maxPlayers === players.length` (don't silently delete players).
- `maxLevel` stepper (1..99).
- Theme toggle (light/dark).
- "Apagar todos os jogadores" (`AlertDialog` confirmation).

## Grid sizing

```ts
// src/games/munchkin/lib/grid_layout.ts
export function gridLayoutFor(count: number) {
  if (count <= 4) {
    return { cols: 1, rows: 4, density: 'loose' as const }
  }

  if (count <= 6) {
    return { cols: 2, rows: 3, density: 'normal' as const }
  }

  return { cols: 2, rows: 4, density: 'dense' as const }
}
```

Applied with:
```tsx
style={{
  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
}}
```

`minmax(0, 1fr)` prevents long names from overflowing and breaking the grid. 7 players leave one empty cell in a 4×2 grid — the remaining cards fill evenly.

## Theming

Tailwind 4 with shadcn semantic tokens only. CSS variables configured in `app.css`:
- `--primary`, `--primary-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--background`, `--foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`, `--ring`

Dark mode via `class` strategy on `<html>`, toggled from settings.

## Testing

Using `vitest` + `@testing-library/react`. Colocated `*.test.ts` next to the file under test.

**Covered:**
- `store.ts` — CRUD, limit enforcement (max 2 classes/races, max players, level range), combat toggles, persist round-trip
- `lib/strength.ts` — `calculateStrength(player)`
- `lib/combat.ts` — totals and outcome
- `lib/grid_layout.ts` — layout for n=1..8

**Not covered (initial):** visual components, route integration. Regressions can earn targeted tests later.

## Registry contract for future games

```ts
// src/games/registry.ts
import type { LucideIcon } from 'lucide-react'

export type GameEntry = {
  id: string
  name: string
  description: string
  path: string            // route path
  icon: LucideIcon
}

export const GAMES: GameEntry[] = [
  { id: 'munchkin', name: 'Munchkin', description: '...', path: '/munchkin', icon: Swords },
]
```

Adding a new game: create `src/games/<id>/`, register a route in `app.tsx`, add one entry to `GAMES`. Home has no per-game knowledge.

## Open questions / decisions deferred

- **shadcn file naming:** generated files stay `kebab-case` (e.g. `components/ui/button.tsx`). Acceptable as "generated code" exception.
- **i18n:** UI strings are in Portuguese at present; no abstraction layer. Easy to introduce later if a 2nd language becomes a need.
- **Confirmation dialogs for destructive actions** (remove player, reset all) — using shadcn `AlertDialog`, no custom affordance.
