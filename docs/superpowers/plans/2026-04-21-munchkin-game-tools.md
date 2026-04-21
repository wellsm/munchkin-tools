# Munchkin Game Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web companion app for Munchkin (first of many games) that tracks players (name, level, items, classes, races), computes strength, and resolves combats against a monster — without reloading state during a session.

**Architecture:** Vite SPA with React + TypeScript. Each game is a self-contained feature under `src/games/<game>/` with its own Zustand store. Routing via react-router-dom. UI primitives via shadcn; styling via Tailwind 4 with semantic tokens only. Pure logic (store, strength, combat, grid) is TDD'd with Vitest; UI components are built-and-eyeballed (regression tests added only when a bug recurs).

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand (+ persist), React Router v6, Vitest, @testing-library/react, lucide-react.

**Reference spec:** `docs/superpowers/specs/2026-04-21-munchkin-game-tools-design.md`

**Style rules (enforce in every task):**
- File names `snake_case`; components `PascalCase`; functions `camelCase`; constants `UPPER_CASE`
- No single-line `if` with return; always block form
- One blank line before `return`, `if`, `continue`, `break`
- Tailwind: only semantic tokens (`bg-primary`, `text-foreground`, `bg-destructive`, etc.) — never raw palette colors
- Commit at the end of each task

---

## Task 1: Scaffold Vite + React + TS project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/app.tsx`, `.gitignore`

- [ ] **Step 1: Run Vite scaffold (non-interactive)**

Run:
```bash
cd /Users/well/Projects/game-tools && npm create vite@latest . -- --template react-ts --yes
```
Expected: files created. If the command prompts because the directory has `.git` and `docs/`, answer to proceed without overwriting those.

- [ ] **Step 2: Install core dependencies**

Run:
```bash
npm install react-router-dom zustand lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui
```
Expected: packages added to `package.json`.

- [ ] **Step 3: Rename scaffolded files to snake_case and clean boilerplate**

Delete `src/App.tsx`, `src/App.css`, `src/assets/react.svg`, `src/index.css` (the scaffold defaults). Create `src/app.tsx`:

```tsx
export function App() {
  return <div className="p-4 text-foreground">Bootstrapping…</div>
}
```

Update `src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Create empty `src/index.css` (populated in Task 2).

- [ ] **Step 4: Verify dev server boots**

Run:
```bash
npm run dev
```
Expected: Vite server starts at http://localhost:5173; page shows "Bootstrapping…". Kill the server (Ctrl-C) after confirming.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold vite + react + ts project"
```

---

## Task 2: Tailwind 4 + semantic tokens

**Files:**
- Modify: `package.json`, `vite.config.ts`
- Create/modify: `src/index.css`

- [ ] **Step 1: Install Tailwind 4 and its Vite plugin**

Run:
```bash
npm install -D tailwindcss@next @tailwindcss/vite
```
Expected: `tailwindcss@4.x` and `@tailwindcss/vite@4.x` in devDependencies.

- [ ] **Step 2: Register Tailwind plugin in `vite.config.ts`**

Replace contents with:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Configure semantic tokens in `src/index.css`**

Replace contents with:
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --radius: 0.5rem;
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}

body {
  @apply bg-background text-foreground;
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 4: Verify tokens compile**

Update `src/app.tsx`:
```tsx
export function App() {
  return (
    <div className="min-h-dvh bg-background text-foreground p-4">
      <h1 className="text-2xl font-bold">Game Tools</h1>
      <p className="text-muted-foreground">Tailwind semantic tokens working.</p>
    </div>
  )
}
```

Run `npm run dev`, visit http://localhost:5173, confirm the styles apply. Kill server.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: configure tailwind 4 with semantic tokens"
```

---

## Task 3: TypeScript path alias + Vitest config

**Files:**
- Modify: `tsconfig.app.json`, `tsconfig.json`, `package.json`
- Create: `vitest.config.ts`, `src/test/setup.ts`

- [ ] **Step 1: Add `@/*` path alias to `tsconfig.app.json`**

Under `compilerOptions`, add:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add test scripts to `package.json`**

In `scripts`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Smoke test**

Run:
```bash
npm run test
```
Expected: "No test files found" (exit 0 or informational — acceptable).

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: configure vitest and path alias"
```

---

## Task 4: Install shadcn primitives

**Files:** populates `src/components/ui/*` via shadcn CLI.

- [ ] **Step 1: Initialize shadcn**

Run:
```bash
npx shadcn@latest init --yes --base-color neutral
```
Expected: creates `components.json` and `src/lib/utils.ts`. Confirm `components.json` has `"style": "new-york"` or default and `"rsc": false`.

- [ ] **Step 2: Add required primitives**

Run:
```bash
npx shadcn@latest add button input label tabs dialog alert-dialog badge card checkbox --yes
```
Expected: files created under `src/components/ui/`.

- [ ] **Step 3: Verify TypeScript still compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: add shadcn primitives"
```

---

## Task 5: Types

**Files:**
- Create: `src/games/munchkin/types.ts`

- [ ] **Step 1: Write `src/games/munchkin/types.ts`**

```ts
export type MunchkinClass = 'cleric' | 'warrior' | 'thief' | 'wizard'
export type MunchkinRace = 'dwarf' | 'elf' | 'halfling' | 'human'

export type Player = {
  id: string
  name: string
  level: number
  itemBonus: number
  classes: MunchkinClass[]
  races: MunchkinRace[]
}

export type CombatState = {
  participatingIds: string[]
  munchkinBuff: number
  monsterLevel: number
  monsterBuff: number
}

export type GameSettings = {
  maxPlayers: number
  maxLevel: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/games/munchkin/types.ts
git commit -m "feat(munchkin): add types"
```

---

## Task 6: Constants (classes, races, limits)

**Files:**
- Create: `src/games/munchkin/constants.ts`

- [ ] **Step 1: Write `src/games/munchkin/constants.ts`**

```ts
import { Cross, Sword, Dagger, Sparkles, Hammer, TreePine, Rabbit, User, type LucideIcon } from 'lucide-react'
import type { MunchkinClass, MunchkinRace } from './types'

export const MAX_CLASSES_PER_PLAYER = 2
export const MAX_RACES_PER_PLAYER = 2
export const DEFAULT_MAX_PLAYERS = 8
export const MIN_MAX_PLAYERS = 2
export const PRODUCT_MAX_PLAYERS = 8
export const DEFAULT_MAX_LEVEL = 10
export const MIN_LEVEL = 1

export type ClassEntry = { id: MunchkinClass; label: string; icon: LucideIcon }
export type RaceEntry = { id: MunchkinRace; label: string; icon: LucideIcon }

export const CLASSES: ClassEntry[] = [
  { id: 'cleric', label: 'Clérigo', icon: Cross },
  { id: 'warrior', label: 'Guerreiro', icon: Sword },
  { id: 'thief', label: 'Ladrão', icon: Dagger },
  { id: 'wizard', label: 'Mago', icon: Sparkles },
]

export const RACES: RaceEntry[] = [
  { id: 'dwarf', label: 'Anão', icon: Hammer },
  { id: 'elf', label: 'Elfo', icon: TreePine },
  { id: 'halfling', label: 'Halfling', icon: Rabbit },
  { id: 'human', label: 'Humano', icon: User },
]

export function classById(id: MunchkinClass): ClassEntry {
  return CLASSES.find((c) => c.id === id)!
}

export function raceById(id: MunchkinRace): RaceEntry {
  return RACES.find((r) => r.id === id)!
}
```

- [ ] **Step 2: Verify `lucide-react` exports (`Dagger` may be `Swords` etc.)**

Run:
```bash
node -e "const i = require('lucide-react'); ['Cross','Sword','Dagger','Sparkles','Hammer','TreePine','Rabbit','User'].forEach(n => console.log(n, typeof i[n]))"
```
Expected: each name prints `function`. If `Dagger` is undefined, substitute with `Swords` (and update `constants.ts` accordingly).

- [ ] **Step 3: Commit**

```bash
git add src/games/munchkin/constants.ts
git commit -m "feat(munchkin): add classes and races catalogs"
```

---

## Task 7: `calculateStrength` (TDD)

**Files:**
- Create: `src/games/munchkin/lib/strength.ts`, `src/games/munchkin/lib/strength.test.ts`

- [ ] **Step 1: Write failing test**

`src/games/munchkin/lib/strength.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { calculateStrength } from './strength'
import type { Player } from '../types'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test',
    level: 1,
    itemBonus: 0,
    classes: [],
    races: [],
    ...overrides,
  }
}

describe('calculateStrength', () => {
  it('is level + itemBonus', () => {
    expect(calculateStrength(makePlayer({ level: 5, itemBonus: 3 }))).toBe(8)
  })

  it('supports negative itemBonus', () => {
    expect(calculateStrength(makePlayer({ level: 4, itemBonus: -2 }))).toBe(2)
  })

  it('works at level 1 with no items', () => {
    expect(calculateStrength(makePlayer({ level: 1, itemBonus: 0 }))).toBe(1)
  })
})
```

- [ ] **Step 2: Verify test fails**

Run:
```bash
npm run test -- strength
```
Expected: fails with "Cannot find module './strength'" (or similar).

- [ ] **Step 3: Implement**

`src/games/munchkin/lib/strength.ts`:
```ts
import type { Player } from '../types'

export function calculateStrength(player: Player): number {
  return player.level + player.itemBonus
}
```

- [ ] **Step 4: Verify test passes**

Run:
```bash
npm run test -- strength
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/games/munchkin/lib/strength.ts src/games/munchkin/lib/strength.test.ts
git commit -m "feat(munchkin): add calculateStrength"
```

---

## Task 8: `combatTotals` (TDD)

**Files:**
- Create: `src/games/munchkin/lib/combat.ts`, `src/games/munchkin/lib/combat.test.ts`

- [ ] **Step 1: Write failing test**

`src/games/munchkin/lib/combat.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { combatTotals } from './combat'
import type { Player, CombatState } from '../types'

function p(id: string, level: number, itemBonus = 0): Player {
  return { id, name: id, level, itemBonus, classes: [], races: [] }
}

const emptyCombat: CombatState = {
  participatingIds: [],
  munchkinBuff: 0,
  monsterLevel: 0,
  monsterBuff: 0,
}

describe('combatTotals', () => {
  it('sums only participating players plus munchkinBuff', () => {
    const players = [p('a', 3, 2), p('b', 5, 0), p('c', 10, 10)]
    const combat = { ...emptyCombat, participatingIds: ['a', 'b'], munchkinBuff: 1 }
    const result = combatTotals(players, combat)

    expect(result.munchkinTotal).toBe(3 + 2 + 5 + 0 + 1)
  })

  it('sums monster level and buff', () => {
    const combat = { ...emptyCombat, monsterLevel: 8, monsterBuff: -2 }
    const result = combatTotals([], combat)

    expect(result.monsterTotal).toBe(6)
  })

  it('outcome is winning when munchkins strictly greater than monster', () => {
    const players = [p('a', 10)]
    const combat = { ...emptyCombat, participatingIds: ['a'], monsterLevel: 5 }

    expect(combatTotals(players, combat).outcome).toBe('winning')
  })

  it('outcome is losing on tie (standard munchkin rule)', () => {
    const players = [p('a', 5)]
    const combat = { ...emptyCombat, participatingIds: ['a'], monsterLevel: 5 }

    expect(combatTotals(players, combat).outcome).toBe('losing')
  })

  it('ignores non-participating players even if listed', () => {
    const players = [p('a', 10), p('b', 99)]
    const combat = { ...emptyCombat, participatingIds: ['a'] }

    expect(combatTotals(players, combat).munchkinTotal).toBe(10)
  })

  it('gracefully ignores participating ids that no longer exist', () => {
    const players = [p('a', 3)]
    const combat = { ...emptyCombat, participatingIds: ['a', 'ghost'] }

    expect(combatTotals(players, combat).munchkinTotal).toBe(3)
  })
})
```

- [ ] **Step 2: Verify fails**

Run: `npm run test -- combat`
Expected: fails with module not found.

- [ ] **Step 3: Implement**

`src/games/munchkin/lib/combat.ts`:
```ts
import type { Player, CombatState } from '../types'
import { calculateStrength } from './strength'

export type CombatOutcome = 'winning' | 'losing'

export type CombatResult = {
  munchkinTotal: number
  monsterTotal: number
  difference: number
  outcome: CombatOutcome
}

export function combatTotals(players: Player[], combat: CombatState): CombatResult {
  const participatingSet = new Set(combat.participatingIds)
  const participating = players.filter((p) => participatingSet.has(p.id))
  const munchkinTotal = participating.reduce((acc, p) => acc + calculateStrength(p), 0) + combat.munchkinBuff
  const monsterTotal = combat.monsterLevel + combat.monsterBuff
  const outcome: CombatOutcome = munchkinTotal > monsterTotal ? 'winning' : 'losing'

  return {
    munchkinTotal,
    monsterTotal,
    difference: Math.abs(munchkinTotal - monsterTotal),
    outcome,
  }
}
```

- [ ] **Step 4: Verify passes**

Run: `npm run test -- combat`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/games/munchkin/lib/combat.ts src/games/munchkin/lib/combat.test.ts
git commit -m "feat(munchkin): add combatTotals"
```

---

## Task 9: `gridLayoutFor` (TDD)

**Files:**
- Create: `src/games/munchkin/lib/grid_layout.ts`, `src/games/munchkin/lib/grid_layout.test.ts`

- [ ] **Step 1: Write failing test**

`src/games/munchkin/lib/grid_layout.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { gridLayoutFor } from './grid_layout'

describe('gridLayoutFor', () => {
  it('n=1 → 1 col x 1 row, loose', () => {
    expect(gridLayoutFor(1)).toEqual({ cols: 1, rows: 1, density: 'loose' })
  })

  it('n=2 → 2 col x 1 row, loose', () => {
    expect(gridLayoutFor(2)).toEqual({ cols: 2, rows: 1, density: 'loose' })
  })

  it('n=3 → 2x2, loose', () => {
    expect(gridLayoutFor(3)).toEqual({ cols: 2, rows: 2, density: 'loose' })
  })

  it('n=4 → 2x2, loose', () => {
    expect(gridLayoutFor(4)).toEqual({ cols: 2, rows: 2, density: 'loose' })
  })

  it('n=5 → 3x2, normal', () => {
    expect(gridLayoutFor(5)).toEqual({ cols: 3, rows: 2, density: 'normal' })
  })

  it('n=6 → 3x2, normal', () => {
    expect(gridLayoutFor(6)).toEqual({ cols: 3, rows: 2, density: 'normal' })
  })

  it('n=7 → 4x2, dense', () => {
    expect(gridLayoutFor(7)).toEqual({ cols: 4, rows: 2, density: 'dense' })
  })

  it('n=8 → 4x2, dense', () => {
    expect(gridLayoutFor(8)).toEqual({ cols: 4, rows: 2, density: 'dense' })
  })
})
```

- [ ] **Step 2: Verify fails**

Run: `npm run test -- grid_layout`

- [ ] **Step 3: Implement**

`src/games/munchkin/lib/grid_layout.ts`:
```ts
export type GridDensity = 'loose' | 'normal' | 'dense'

export type GridLayout = {
  cols: number
  rows: number
  density: GridDensity
}

export function gridLayoutFor(count: number): GridLayout {
  if (count <= 2) {
    return { cols: Math.max(1, count), rows: 1, density: 'loose' }
  }

  if (count <= 4) {
    return { cols: 2, rows: 2, density: 'loose' }
  }

  if (count <= 6) {
    return { cols: 3, rows: 2, density: 'normal' }
  }

  return { cols: 4, rows: 2, density: 'dense' }
}
```

- [ ] **Step 4: Verify passes**

Run: `npm run test -- grid_layout`
Expected: 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/games/munchkin/lib/grid_layout.ts src/games/munchkin/lib/grid_layout.test.ts
git commit -m "feat(munchkin): add gridLayoutFor"
```

---

## Task 10: Zustand store (TDD)

**Files:**
- Create: `src/games/munchkin/store.ts`, `src/games/munchkin/store.test.ts`

- [ ] **Step 1: Write failing tests**

`src/games/munchkin/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useMunchkinStore } from './store'
import { DEFAULT_MAX_PLAYERS, DEFAULT_MAX_LEVEL } from './constants'

function reset() {
  useMunchkinStore.setState(useMunchkinStore.getInitialState(), true)
}

beforeEach(() => {
  localStorage.clear()
  reset()
})

describe('munchkin store', () => {
  it('starts empty with default settings', () => {
    const s = useMunchkinStore.getState()

    expect(s.players).toEqual([])
    expect(s.settings.maxPlayers).toBe(DEFAULT_MAX_PLAYERS)
    expect(s.settings.maxLevel).toBe(DEFAULT_MAX_LEVEL)
    expect(s.combat.participatingIds).toEqual([])
  })

  it('addPlayer adds with generated id', () => {
    useMunchkinStore.getState().addPlayer({
      name: 'Ana',
      level: 1,
      itemBonus: 0,
      classes: ['warrior'],
      races: ['elf'],
    })
    const [p] = useMunchkinStore.getState().players

    expect(p.name).toBe('Ana')
    expect(p.id).toMatch(/^.+$/)
  })

  it('addPlayer refuses when at maxPlayers', () => {
    const { addPlayer, setMaxPlayers } = useMunchkinStore.getState()
    setMaxPlayers(2)
    addPlayer({ name: 'A', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'B', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'C', level: 1, itemBonus: 0, classes: [], races: [] })

    expect(useMunchkinStore.getState().players.length).toBe(2)
  })

  it('addPlayer caps classes and races at 2', () => {
    useMunchkinStore.getState().addPlayer({
      name: 'Over',
      level: 1,
      itemBonus: 0,
      classes: ['warrior', 'wizard', 'cleric'],
      races: ['elf', 'dwarf', 'human'],
    })
    const [p] = useMunchkinStore.getState().players

    expect(p.classes.length).toBe(2)
    expect(p.races.length).toBe(2)
  })

  it('updatePlayer merges patch', () => {
    const { addPlayer, updatePlayer } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    updatePlayer(id, { level: 5 })

    expect(useMunchkinStore.getState().players[0].level).toBe(5)
  })

  it('updatePlayer clamps classes/races to 2', () => {
    const { addPlayer, updatePlayer } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    updatePlayer(id, { classes: ['warrior', 'wizard', 'thief'] })

    expect(useMunchkinStore.getState().players[0].classes.length).toBe(2)
  })

  it('removePlayer drops from players and participatingIds', () => {
    const { addPlayer, removePlayer, toggleParticipant } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    toggleParticipant(id)
    removePlayer(id)

    expect(useMunchkinStore.getState().players).toEqual([])
    expect(useMunchkinStore.getState().combat.participatingIds).toEqual([])
  })

  it('toggleParticipant is idempotent toggle', () => {
    const { addPlayer, toggleParticipant } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    const id = useMunchkinStore.getState().players[0].id
    toggleParticipant(id)

    expect(useMunchkinStore.getState().combat.participatingIds).toEqual([id])
    toggleParticipant(id)
    expect(useMunchkinStore.getState().combat.participatingIds).toEqual([])
  })

  it('resetCombat zeroes combat state without touching players', () => {
    const { addPlayer, toggleParticipant, setMunchkinBuff, setMonsterLevel, resetCombat } = useMunchkinStore.getState()
    addPlayer({ name: 'Ana', level: 1, itemBonus: 0, classes: [], races: [] })
    toggleParticipant(useMunchkinStore.getState().players[0].id)
    setMunchkinBuff(5)
    setMonsterLevel(8)
    resetCombat()
    const s = useMunchkinStore.getState()

    expect(s.combat).toEqual({ participatingIds: [], munchkinBuff: 0, monsterLevel: 0, monsterBuff: 0 })
    expect(s.players.length).toBe(1)
  })

  it('setMaxPlayers refuses to drop below current player count', () => {
    const { addPlayer, setMaxPlayers } = useMunchkinStore.getState()
    addPlayer({ name: 'A', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'B', level: 1, itemBonus: 0, classes: [], races: [] })
    addPlayer({ name: 'C', level: 1, itemBonus: 0, classes: [], races: [] })
    setMaxPlayers(2)

    expect(useMunchkinStore.getState().settings.maxPlayers).toBe(3)
  })

  it('setMaxPlayers clamps to product range', () => {
    const { setMaxPlayers } = useMunchkinStore.getState()
    setMaxPlayers(99)

    expect(useMunchkinStore.getState().settings.maxPlayers).toBe(8)
    setMaxPlayers(0)
    expect(useMunchkinStore.getState().settings.maxPlayers).toBe(2)
  })

  it('resetAllPlayers clears players and combat, keeps settings', () => {
    const { addPlayer, setMaxLevel, resetAllPlayers } = useMunchkinStore.getState()
    addPlayer({ name: 'A', level: 1, itemBonus: 0, classes: [], races: [] })
    setMaxLevel(20)
    resetAllPlayers()
    const s = useMunchkinStore.getState()

    expect(s.players).toEqual([])
    expect(s.combat.participatingIds).toEqual([])
    expect(s.settings.maxLevel).toBe(20)
  })
})
```

- [ ] **Step 2: Verify fails**

Run: `npm run test -- store`

- [ ] **Step 3: Implement store**

`src/games/munchkin/store.ts`:
```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Player, CombatState, GameSettings, MunchkinClass, MunchkinRace } from './types'
import {
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  DEFAULT_MAX_PLAYERS,
  DEFAULT_MAX_LEVEL,
  MIN_MAX_PLAYERS,
  PRODUCT_MAX_PLAYERS,
} from './constants'

type NewPlayerInput = Omit<Player, 'id'>

type MunchkinStore = {
  players: Player[]
  settings: GameSettings
  combat: CombatState

  addPlayer: (input: NewPlayerInput) => void
  updatePlayer: (id: string, patch: Partial<NewPlayerInput>) => void
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

const INITIAL_COMBAT: CombatState = {
  participatingIds: [],
  munchkinBuff: 0,
  monsterLevel: 0,
  monsterBuff: 0,
}

const INITIAL_SETTINGS: GameSettings = {
  maxPlayers: DEFAULT_MAX_PLAYERS,
  maxLevel: DEFAULT_MAX_LEVEL,
}

function clampList<T>(list: T[], max: number): T[] {
  return list.slice(0, max)
}

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  const rounded = Math.round(value)

  return Math.min(max, Math.max(min, rounded))
}

function sanitizeInput(input: NewPlayerInput, maxLevel: number): NewPlayerInput {
  return {
    name: input.name.trim(),
    level: clampInt(input.level, 1, maxLevel),
    itemBonus: Math.round(input.itemBonus) || 0,
    classes: clampList<MunchkinClass>(input.classes, MAX_CLASSES_PER_PLAYER),
    races: clampList<MunchkinRace>(input.races, MAX_RACES_PER_PLAYER),
  }
}

export const useMunchkinStore = create<MunchkinStore>()(
  persist(
    (set, get) => ({
      players: [],
      settings: { ...INITIAL_SETTINGS },
      combat: { ...INITIAL_COMBAT },

      addPlayer: (input) => {
        const { players, settings } = get()

        if (players.length >= settings.maxPlayers) {
          return
        }

        const sanitized = sanitizeInput(input, settings.maxLevel)
        const player: Player = { id: crypto.randomUUID(), ...sanitized }
        set({ players: [...players, player] })
      },

      updatePlayer: (id, patch) => {
        const { players, settings } = get()
        const next = players.map((p) => {
          if (p.id !== id) {
            return p
          }

          const merged = { ...p, ...patch }
          const sanitized = sanitizeInput(merged, settings.maxLevel)

          return { ...merged, ...sanitized, id: p.id }
        })
        set({ players: next })
      },

      removePlayer: (id) => {
        const { players, combat } = get()
        set({
          players: players.filter((p) => p.id !== id),
          combat: {
            ...combat,
            participatingIds: combat.participatingIds.filter((pid) => pid !== id),
          },
        })
      },

      toggleParticipant: (id) => {
        const { combat } = get()
        const exists = combat.participatingIds.includes(id)
        const participatingIds = exists
          ? combat.participatingIds.filter((pid) => pid !== id)
          : [...combat.participatingIds, id]
        set({ combat: { ...combat, participatingIds } })
      },

      setMunchkinBuff: (n) => set({ combat: { ...get().combat, munchkinBuff: Math.round(n) || 0 } }),
      setMonsterLevel: (n) => set({ combat: { ...get().combat, monsterLevel: Math.max(0, Math.round(n) || 0) } }),
      setMonsterBuff: (n) => set({ combat: { ...get().combat, monsterBuff: Math.round(n) || 0 } }),

      resetCombat: () => set({ combat: { ...INITIAL_COMBAT } }),

      setMaxPlayers: (n) => {
        const { players, settings } = get()
        const clampedRange = clampInt(n, MIN_MAX_PLAYERS, PRODUCT_MAX_PLAYERS)
        const floor = Math.max(MIN_MAX_PLAYERS, players.length)
        const finalValue = Math.max(clampedRange, floor)
        set({ settings: { ...settings, maxPlayers: finalValue } })
      },

      setMaxLevel: (n) => {
        const { settings, players } = get()
        const clamped = clampInt(n, 1, 99)
        const adjustedPlayers = players.map((p) => {
          if (p.level <= clamped) {
            return p
          }

          return { ...p, level: clamped }
        })
        set({ settings: { ...settings, maxLevel: clamped }, players: adjustedPlayers })
      },

      resetAllPlayers: () => set({ players: [], combat: { ...INITIAL_COMBAT } }),
    }),
    {
      name: 'munchkin-store-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ players: s.players, settings: s.settings }),
    },
  ),
)
```

- [ ] **Step 4: Verify tests pass**

Run: `npm run test -- store`
Expected: 12 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/games/munchkin/store.ts src/games/munchkin/store.test.ts
git commit -m "feat(munchkin): add zustand store with persist"
```

---

## Task 11: Game registry + routing shell

**Files:**
- Create: `src/games/registry.ts`, `src/routes/home.tsx`, `src/routes/munchkin_game.tsx`
- Modify: `src/app.tsx`

- [ ] **Step 1: Create registry**

`src/games/registry.ts`:
```ts
import { Swords, type LucideIcon } from 'lucide-react'

export type GameEntry = {
  id: string
  name: string
  description: string
  path: string
  icon: LucideIcon
}

export const GAMES: GameEntry[] = [
  {
    id: 'munchkin',
    name: 'Munchkin',
    description: 'Contador de força, classes e raças.',
    path: '/munchkin',
    icon: Swords,
  },
]
```

- [ ] **Step 2: Create Home**

`src/routes/home.tsx`:
```tsx
import { Link } from 'react-router-dom'
import { GAMES } from '@/games/registry'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border p-4">
        <h1 className="text-2xl font-bold">Game Tools</h1>
        <p className="text-muted-foreground text-sm">Ferramentas auxiliares para jogos de mesa.</p>
      </header>
      <main className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {GAMES.map((game) => {
          const Icon = game.icon

          return (
            <Link key={game.id} to={game.path} className="block">
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="size-8 text-primary" aria-hidden />
                  <div>
                    <CardTitle>{game.name}</CardTitle>
                    <CardDescription>{game.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          )
        })}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create MunchkinGame placeholder**

`src/routes/munchkin_game.tsx`:
```tsx
import { Link } from 'react-router-dom'
import { ArrowLeft, Swords, Users, Settings as SettingsIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export function MunchkinGame() {
  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border p-3">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link to="/">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Munchkin</h1>
      </header>
      <Tabs defaultValue="players" className="flex flex-col flex-1 overflow-hidden">
        <TabsContent value="players" className="flex-1 overflow-hidden p-0 m-0">
          <div className="p-4 text-muted-foreground">Players tab (em breve)</div>
        </TabsContent>
        <TabsContent value="combat" className="flex-1 overflow-hidden p-0 m-0">
          <div className="p-4 text-muted-foreground">Combat tab (em breve)</div>
        </TabsContent>
        <TabsContent value="settings" className="flex-1 overflow-hidden p-0 m-0">
          <div className="p-4 text-muted-foreground">Settings tab (em breve)</div>
        </TabsContent>
        <TabsList className="grid grid-cols-3 w-full rounded-none border-t border-border h-16">
          <TabsTrigger value="players" className="flex flex-col gap-1 h-full">
            <Users className="size-5" />
            <span className="text-xs">Players</span>
          </TabsTrigger>
          <TabsTrigger value="combat" className="flex flex-col gap-1 h-full">
            <Swords className="size-5" />
            <span className="text-xs">Combate</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col gap-1 h-full">
            <SettingsIcon className="size-5" />
            <span className="text-xs">Config</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 4: Wire router in `src/app.tsx`**

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/home'
import { MunchkinGame } from './routes/munchkin_game'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/munchkin" element={<MunchkinGame />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Visual verification**

Run `npm run dev`, open http://localhost:5173. Confirm:
- Home shows a Munchkin card with swords icon
- Clicking the card goes to `/munchkin`
- MunchkinGame shows header, three empty tabs, tab bar at the bottom, no scroll

Kill server.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add home route and munchkin shell with bottom tab bar"
```

---

## Task 12: `PlayerCard` component

**Files:**
- Create: `src/games/munchkin/components/player_card.tsx`

- [ ] **Step 1: Write component**

`src/games/munchkin/components/player_card.tsx`:
```tsx
import type { Player } from '../types'
import type { GridDensity } from '../lib/grid_layout'
import { calculateStrength } from '../lib/strength'
import { classById, raceById } from '../constants'
import { cn } from '@/lib/utils'

type Props = {
  player: Player
  density: GridDensity
  onClick?: () => void
}

const NAME_SIZE: Record<GridDensity, string> = {
  loose: 'text-2xl',
  normal: 'text-xl',
  dense: 'text-lg',
}

const STRENGTH_SIZE: Record<GridDensity, string> = {
  loose: 'text-5xl',
  normal: 'text-4xl',
  dense: 'text-3xl',
}

const PADDING: Record<GridDensity, string> = {
  loose: 'p-6',
  normal: 'p-4',
  dense: 'p-3',
}

const ICON_SIZE: Record<GridDensity, string> = {
  loose: 'size-6',
  normal: 'size-5',
  dense: 'size-4',
}

export function PlayerCard({ player, density, onClick }: Props) {
  const strength = calculateStrength(player)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start justify-between gap-2 rounded-lg border border-border bg-card text-card-foreground text-left shadow-sm hover:bg-accent transition-colors w-full h-full min-w-0',
        PADDING[density],
      )}
    >
      <div className="flex items-baseline justify-between w-full gap-2">
        <span className={cn('font-semibold truncate', NAME_SIZE[density])}>{player.name}</span>
        <span className="text-xs text-muted-foreground shrink-0">Nv {player.level}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold tabular-nums', STRENGTH_SIZE[density])}>{strength}</span>
        <span className="text-xs text-muted-foreground">
          ({player.level}
          {player.itemBonus >= 0 ? ' + ' : ' - '}
          {Math.abs(player.itemBonus)})
        </span>
      </div>
      <div className="flex flex-wrap gap-1 w-full">
        {player.classes.map((id) => {
          const entry = classById(id)
          const Icon = entry.icon

          return (
            <span
              key={id}
              title={entry.label}
              className={cn('inline-flex items-center justify-center rounded-full bg-primary/10 text-primary', ICON_SIZE[density] === 'size-4' ? 'size-6' : 'size-8')}
            >
              <Icon className={ICON_SIZE[density]} aria-hidden />
            </span>
          )
        })}
        {player.races.map((id) => {
          const entry = raceById(id)
          const Icon = entry.icon

          return (
            <span
              key={id}
              title={entry.label}
              className={cn('inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground', ICON_SIZE[density] === 'size-4' ? 'size-6' : 'size-8')}
            >
              <Icon className={ICON_SIZE[density]} aria-hidden />
            </span>
          )
        })}
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Smoke-check type compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/games/munchkin/components/player_card.tsx
git commit -m "feat(munchkin): add PlayerCard component"
```

---

## Task 13: `PlayerForm` component

**Files:**
- Create: `src/games/munchkin/components/player_form.tsx`

- [ ] **Step 1: Write component**

`src/games/munchkin/components/player_form.tsx`:
```tsx
import { useState } from 'react'
import type { Player, MunchkinClass, MunchkinRace } from '../types'
import {
  CLASSES,
  RACES,
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  MIN_LEVEL,
} from '../constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormValues = Omit<Player, 'id'>

type Props = {
  initialValues?: FormValues
  maxLevel: number
  submitLabel: string
  onSubmit: (values: FormValues) => void
  onCancel?: () => void
}

const EMPTY_FORM: FormValues = {
  name: '',
  level: 1,
  itemBonus: 0,
  classes: [],
  races: [],
}

export function PlayerForm({ initialValues, maxLevel, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<FormValues>(initialValues ?? EMPTY_FORM)
  const trimmedName = values.name.trim()
  const isValid =
    trimmedName.length > 0 &&
    values.level >= MIN_LEVEL &&
    values.level <= maxLevel

  function toggleClass(id: MunchkinClass) {
    setValues((prev) => {
      if (prev.classes.includes(id)) {
        return { ...prev, classes: prev.classes.filter((c) => c !== id) }
      }

      if (prev.classes.length >= MAX_CLASSES_PER_PLAYER) {
        return prev
      }

      return { ...prev, classes: [...prev.classes, id] }
    })
  }

  function toggleRace(id: MunchkinRace) {
    setValues((prev) => {
      if (prev.races.includes(id)) {
        return { ...prev, races: prev.races.filter((r) => r !== id) }
      }

      if (prev.races.length >= MAX_RACES_PER_PLAYER) {
        return prev
      }

      return { ...prev, races: [...prev.races, id] }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isValid) {
      return
    }

    onSubmit({ ...values, name: trimmedName })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="player-name">Nome</Label>
        <Input
          id="player-name"
          autoFocus
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="Nome do jogador"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="player-level">Nível</Label>
          <Input
            id="player-level"
            type="number"
            min={MIN_LEVEL}
            max={maxLevel}
            value={values.level}
            onChange={(e) => setValues({ ...values, level: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="player-items">Bônus de itens</Label>
          <Input
            id="player-items"
            type="number"
            value={values.itemBonus}
            onChange={(e) => setValues({ ...values, itemBonus: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Classes (até {MAX_CLASSES_PER_PLAYER})</Label>
        <div className="flex flex-wrap gap-2">
          {CLASSES.map((c) => {
            const Icon = c.icon
            const active = values.classes.includes(c.id)

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleClass(c.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm',
                  active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Raças (até {MAX_RACES_PER_PLAYER})</Label>
        <div className="flex flex-wrap gap-2">
          {RACES.map((r) => {
            const Icon = r.icon
            const active = values.races.includes(r.id)

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRace(r.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm',
                  active ? 'bg-accent text-accent-foreground border-accent-foreground' : 'bg-background text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {r.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={!isValid}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/games/munchkin/components/player_form.tsx
git commit -m "feat(munchkin): add PlayerForm"
```

---

## Task 14: `PlayerDetailDialog`

**Files:**
- Create: `src/games/munchkin/components/player_detail_dialog.tsx`

- [ ] **Step 1: Write component**

`src/games/munchkin/components/player_detail_dialog.tsx`:
```tsx
import { useState } from 'react'
import type { Player } from '../types'
import { classById, raceById } from '../constants'
import { calculateStrength } from '../lib/strength'
import { useMunchkinStore } from '../store'
import { PlayerForm } from './player_form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

type Props = {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerDetailDialog({ player, open, onOpenChange }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const updatePlayer = useMunchkinStore((s) => s.updatePlayer)
  const removePlayer = useMunchkinStore((s) => s.removePlayer)
  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel)

  if (!player) {
    return null
  }

  function handleRemove() {
    if (!player) {
      return
    }

    removePlayer(player.id)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setIsEditing(false)
        }

        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{player.name}</DialogTitle>
          <DialogDescription>
            Força atual: <span className="font-semibold text-foreground">{calculateStrength(player)}</span>
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <PlayerForm
            initialValues={{
              name: player.name,
              level: player.level,
              itemBonus: player.itemBonus,
              classes: player.classes,
              races: player.races,
            }}
            maxLevel={maxLevel}
            submitLabel="Salvar"
            onCancel={() => setIsEditing(false)}
            onSubmit={(values) => {
              updatePlayer(player.id, values)
              setIsEditing(false)
            }}
          />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <DetailRow label="Nível" value={String(player.level)} />
            <DetailRow label="Bônus de itens" value={player.itemBonus >= 0 ? `+${player.itemBonus}` : String(player.itemBonus)} />
            <DetailRow
              label="Classes"
              value={player.classes.length === 0 ? '—' : player.classes.map((id) => {
                const e = classById(id)

                return `${e.label}`
              }).join(', ')}
            />
            <DetailRow
              label="Raças"
              value={player.races.length === 0 ? '—' : player.races.map((id) => {
                const e = raceById(id)

                return `${e.label}`
              }).join(', ')}
            />
          </div>
        )}

        {!isEditing && (
          <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Remover</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover {player.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove}>Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/games/munchkin/components/player_detail_dialog.tsx
git commit -m "feat(munchkin): add PlayerDetailDialog"
```

---

## Task 15: `PlayersTab`

**Files:**
- Create: `src/games/munchkin/tabs/players_tab.tsx`
- Modify: `src/routes/munchkin_game.tsx` (replace placeholder with `<PlayersTab />`)

- [ ] **Step 1: Write `PlayersTab`**

`src/games/munchkin/tabs/players_tab.tsx`:
```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Player } from '../types'
import { useMunchkinStore } from '../store'
import { gridLayoutFor } from '../lib/grid_layout'
import { PlayerCard } from '../components/player_card'
import { PlayerForm } from '../components/player_form'
import { PlayerDetailDialog } from '../components/player_detail_dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function PlayersTab() {
  const players = useMunchkinStore((s) => s.players)
  const maxPlayers = useMunchkinStore((s) => s.settings.maxPlayers)
  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel)
  const addPlayer = useMunchkinStore((s) => s.addPlayer)

  const [addOpen, setAddOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const detailPlayer = players.find((p) => p.id === detailId) ?? null

  const layout = gridLayoutFor(players.length)
  const canAdd = players.length < maxPlayers

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Nenhum jogador ainda.</p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Adicionar jogador
        </Button>
        <AddPlayerDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          maxLevel={maxLevel}
          onSubmit={(values) => {
            addPlayer(values)
            setAddOpen(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div
        className="grid gap-3 h-full w-full p-3"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
        }}
      >
        {players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            density={layout.density}
            onClick={() => setDetailId(p.id)}
          />
        ))}
      </div>

      {canAdd && (
        <Button
          size="icon"
          className="absolute top-3 right-3 rounded-full shadow-md"
          onClick={() => setAddOpen(true)}
          aria-label="Adicionar jogador"
        >
          <Plus className="size-5" />
        </Button>
      )}

      <AddPlayerDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        maxLevel={maxLevel}
        onSubmit={(values) => {
          addPlayer(values)
          setAddOpen(false)
        }}
      />

      <PlayerDetailDialog
        player={detailPlayer}
        open={detailId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDetailId(null)
          }
        }}
      />
    </div>
  )
}

type NewPlayerInput = Omit<Player, 'id'>

type AddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  maxLevel: number
  onSubmit: (values: NewPlayerInput) => void
}

function AddPlayerDialog({ open, onOpenChange, maxLevel, onSubmit }: AddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Adicionar jogador</DialogTitle>
        </DialogHeader>
        <PlayerForm
          maxLevel={maxLevel}
          submitLabel="Adicionar"
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Wire into `munchkin_game.tsx`**

Replace the players `TabsContent` placeholder with `<PlayersTab />`:
```tsx
import { PlayersTab } from '@/games/munchkin/tabs/players_tab'
// ...
<TabsContent value="players" className="flex-1 overflow-hidden p-0 m-0">
  <PlayersTab />
</TabsContent>
```

- [ ] **Step 3: Visual verification**

Run `npm run dev`. At `/munchkin`:
- Empty state shows "Nenhum jogador ainda" with button
- Add 1 → card fills screen
- Add up to 4 → 2×2 grid
- Add up to 6 → 3×2 grid
- Add 7–8 → 4×2 grid, text smaller
- 8th add: FAB disappears
- Click a card → detail dialog opens
- No scroll at any count

Kill server.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(munchkin): implement players tab with add/detail flows"
```

---

## Task 16: `CombatTab`

**Files:**
- Create: `src/games/munchkin/tabs/combat_tab.tsx`
- Modify: `src/routes/munchkin_game.tsx`

- [ ] **Step 1: Write `CombatTab`**

`src/games/munchkin/tabs/combat_tab.tsx`:
```tsx
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useMunchkinStore } from '../store'
import { combatTotals } from '../lib/combat'
import { calculateStrength } from '../lib/strength'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function CombatTab() {
  const players = useMunchkinStore((s) => s.players)
  const combat = useMunchkinStore((s) => s.combat)
  const toggleParticipant = useMunchkinStore((s) => s.toggleParticipant)
  const setMunchkinBuff = useMunchkinStore((s) => s.setMunchkinBuff)
  const setMonsterLevel = useMunchkinStore((s) => s.setMonsterLevel)
  const setMonsterBuff = useMunchkinStore((s) => s.setMonsterBuff)
  const resetCombat = useMunchkinStore((s) => s.resetCombat)

  const result = combatTotals(players, combat)

  if (players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Adicione jogadores na aba Players antes de combater.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      <section className="flex-1 overflow-auto border-b md:border-b-0 md:border-r border-border p-4">
        <h2 className="font-semibold mb-3">Participantes</h2>
        <ul className="flex flex-col gap-2">
          {players.map((p) => {
            const checked = combat.participatingIds.includes(p.id)

            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <Checkbox
                  id={`part-${p.id}`}
                  checked={checked}
                  onCheckedChange={() => toggleParticipant(p.id)}
                />
                <Label htmlFor={`part-${p.id}`} className="flex-1 flex justify-between gap-2 cursor-pointer">
                  <span>{p.name}</span>
                  <span className="tabular-nums text-muted-foreground">Força {calculateStrength(p)}</span>
                </Label>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        <TeamPanel
          title="Munchkins"
          total={result.munchkinTotal}
          buff={combat.munchkinBuff}
          onBuffChange={setMunchkinBuff}
        />
        <MonsterPanel
          level={combat.monsterLevel}
          buff={combat.monsterBuff}
          total={result.monsterTotal}
          onLevelChange={setMonsterLevel}
          onBuffChange={setMonsterBuff}
        />

        <div
          className={cn(
            'rounded-lg p-4 text-center font-bold text-2xl',
            result.outcome === 'winning' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground',
          )}
        >
          {result.outcome === 'winning' ? `Vencendo por ${result.difference}` : `Perdendo por ${result.difference}`}
        </div>

        <Button variant="outline" onClick={resetCombat}>
          <RotateCcw className="size-4" /> Resetar combate
        </Button>
      </section>
    </div>
  )
}

function Stepper({ value, onChange, min, label }: { value: number; onChange: (n: number) => void; min?: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label={`Diminuir ${label}`}
        onClick={() => onChange(value - 1)}
        disabled={min !== undefined && value <= min}
      >
        <Minus className="size-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 text-center"
        aria-label={label}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label={`Aumentar ${label}`}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

function TeamPanel({ title, total, buff, onBuffChange }: { title: string; total: number; buff: number; onBuffChange: (n: number) => void }) {
  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-3xl font-bold tabular-nums">{total}</span>
      </div>
      <div className="flex items-center justify-between">
        <Label>Buff de equipe</Label>
        <Stepper value={buff} onChange={onBuffChange} label="Buff Munchkins" />
      </div>
    </div>
  )
}

function MonsterPanel({ level, buff, total, onLevelChange, onBuffChange }: { level: number; buff: number; total: number; onLevelChange: (n: number) => void; onBuffChange: (n: number) => void }) {
  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Monstro</h3>
        <span className="text-3xl font-bold tabular-nums">{total}</span>
      </div>
      <div className="flex items-center justify-between">
        <Label>Nível do monstro</Label>
        <Stepper value={level} onChange={onLevelChange} min={0} label="Nível do monstro" />
      </div>
      <div className="flex items-center justify-between">
        <Label>Buff do monstro</Label>
        <Stepper value={buff} onChange={onBuffChange} label="Buff monstro" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire into `munchkin_game.tsx`**

```tsx
import { CombatTab } from '@/games/munchkin/tabs/combat_tab'
// ...
<TabsContent value="combat" className="flex-1 overflow-hidden p-0 m-0">
  <CombatTab />
</TabsContent>
```

- [ ] **Step 3: Visual verification**

Run `npm run dev`:
- Combat tab with no players shows the hint
- Add some players, mark a few → Munchkins total reacts live
- Increase monster level → outcome flips when monster surpasses munchkins
- Ties show "Perdendo por 0"
- Reset zeroes everything (including checkboxes)

Kill server.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(munchkin): implement combat tab"
```

---

## Task 17: `SettingsTab` + theme toggle

**Files:**
- Create: `src/games/munchkin/tabs/settings_tab.tsx`, `src/lib/theme.ts`
- Modify: `src/routes/munchkin_game.tsx`, `src/app.tsx`

- [ ] **Step 1: Create theme helper**

`src/lib/theme.ts`:
```ts
export type Theme = 'light' | 'dark'

const THEME_KEY = 'game-tools-theme'

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)

  if (stored === 'dark' || stored === 'light') {
    return stored
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  return prefersDark ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
```

- [ ] **Step 2: Apply theme on boot**

In `src/app.tsx`, import and call once:
```tsx
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './routes/home'
import { MunchkinGame } from './routes/munchkin_game'
import { applyTheme, getStoredTheme } from './lib/theme'

export function App() {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/munchkin" element={<MunchkinGame />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Write `SettingsTab`**

`src/games/munchkin/tabs/settings_tab.tsx`:
```tsx
import { useState } from 'react'
import { Minus, Moon, Plus, Sun, Trash2 } from 'lucide-react'
import { useMunchkinStore } from '../store'
import {
  MIN_MAX_PLAYERS,
  PRODUCT_MAX_PLAYERS,
} from '../constants'
import { applyTheme, getStoredTheme, type Theme } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function SettingsTab() {
  const players = useMunchkinStore((s) => s.players)
  const settings = useMunchkinStore((s) => s.settings)
  const setMaxPlayers = useMunchkinStore((s) => s.setMaxPlayers)
  const setMaxLevel = useMunchkinStore((s) => s.setMaxLevel)
  const resetAllPlayers = useMunchkinStore((s) => s.resetAllPlayers)
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())

  const decreaseMaxPlayersDisabled = settings.maxPlayers <= Math.max(MIN_MAX_PLAYERS, players.length)
  const increaseMaxPlayersDisabled = settings.maxPlayers >= PRODUCT_MAX_PLAYERS

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  return (
    <div className="h-full overflow-auto p-4 flex flex-col gap-6 max-w-xl mx-auto w-full">
      <section className="flex flex-col gap-2">
        <Label>Jogadores máximo ({settings.maxPlayers})</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setMaxPlayers(settings.maxPlayers - 1)}
            disabled={decreaseMaxPlayersDisabled}
            aria-label="Diminuir jogadores máximo"
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-10 text-center tabular-nums">{settings.maxPlayers}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setMaxPlayers(settings.maxPlayers + 1)}
            disabled={increaseMaxPlayersDisabled}
            aria-label="Aumentar jogadores máximo"
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Não pode ser menor que o número atual de jogadores ({players.length}).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <Label htmlFor="max-level">Nível máximo</Label>
        <Input
          id="max-level"
          type="number"
          min={1}
          max={99}
          value={settings.maxLevel}
          onChange={(e) => setMaxLevel(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">Jogadores acima desse nível serão rebaixados.</p>
      </section>

      <section className="flex flex-col gap-2">
        <Label>Tema</Label>
        <Button variant="outline" onClick={toggleTheme} className="justify-start">
          {theme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          <span className="ml-2">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
        </Button>
      </section>

      <section className="flex flex-col gap-2 pt-4 border-t border-border">
        <Label className="text-destructive">Zona perigosa</Label>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="justify-start">
              <Trash2 className="size-4" />
              <span className="ml-2">Apagar todos os jogadores</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apagar todos os jogadores?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove todos os jogadores e reseta o combate. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={resetAllPlayers}>Apagar tudo</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Wire into `munchkin_game.tsx`**

```tsx
import { SettingsTab } from '@/games/munchkin/tabs/settings_tab'
// ...
<TabsContent value="settings" className="flex-1 overflow-hidden p-0 m-0">
  <SettingsTab />
</TabsContent>
```

- [ ] **Step 5: Visual verification**

Run `npm run dev`:
- Settings tab loads with current values
- `-` on maxPlayers disabled when equal to player count or 2; `+` disabled at 8
- Changing maxLevel caps existing players if their level exceeds it
- Theme toggle flips between `.dark` on `<html>` and persists across reloads
- "Apagar todos os jogadores" asks confirmation, then empties player list and combat

Kill server.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(munchkin): implement settings tab and theme toggle"
```

---

## Task 18: End-to-end sanity pass + README

**Files:**
- Modify: `src/routes/munchkin_game.tsx` (if any fine-tunes needed)
- Create: `README.md`

- [ ] **Step 1: Run full test suite**

Run:
```bash
npm run test
```
Expected: all suites green (strength × 3, combat × 6, grid_layout × 8, store × 12 → 29 tests).

- [ ] **Step 2: Run type checker**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Manual sanity flow**

Run `npm run dev`, then in the browser:
- Start from `/`, click Munchkin
- Add 8 players → FAB disappears
- Click through density transitions by removing players (8 → 6 → 4 → 2 → 1)
- Confirm **no scroll** at any count on the players tab
- Edit a player; force level above maxLevel (change maxLevel first); confirm clamping on rehydrate
- Refresh browser → players and settings persist; combat tab is zeroed
- Dark mode toggle persists on reload

Kill server.

- [ ] **Step 4: Write `README.md`**

```md
# Game Tools

Mobile-first web companion for tabletop game sessions. Current games:

- **Munchkin** — player cards with level, item bonus, classes, races; live strength totals; combat tab vs monster with team buffs.

## Development

\`\`\`
npm install
npm run dev       # Vite dev server
npm run test      # Vitest
npm run build     # production build
\`\`\`

## Adding a new game

1. Create `src/games/<id>/` with its own store, types, components.
2. Add a route in `src/app.tsx`.
3. Register the game in `src/games/registry.ts`.
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "docs: add readme and end-to-end verification"
```

---

## Self-Review Checklist

Run against the spec before declaring done:

- [ ] Multi-game architecture: `games/registry.ts` + per-game folder — ✅ Tasks 11 and 15–17 respect it.
- [ ] Data model (Player with `classes[]`/`races[]` max 2, derived strength): ✅ Tasks 5, 7, 10.
- [ ] Combat model (team buffs, participating checkboxes, tie→monster): ✅ Tasks 8, 16.
- [ ] Persistence (players + settings only; combat ephemeral): ✅ Task 10 partialize, Task 16 resets in-memory only.
- [ ] Grid without scroll for 1..8 (density-aware typography): ✅ Tasks 9, 12, 15.
- [ ] Bottom tab bar: ✅ Task 11.
- [ ] Player detail dialog (icons + text): ✅ Task 14.
- [ ] Settings with maxPlayers (respecting current count), maxLevel, theme, reset: ✅ Task 17.
- [ ] shadcn semantic tokens only: ✅ Task 2 + discipline rule.
- [ ] snake_case files / PascalCase components / camelCase fns / UPPER_CASE consts / formatting rules: ✅ each task follows these.
- [ ] TDD on pure logic; UI skipped: ✅ Tasks 7–10 TDD; UI components without tests.
