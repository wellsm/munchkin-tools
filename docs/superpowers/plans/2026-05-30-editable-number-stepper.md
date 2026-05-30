# Editable Number in Steppers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users set a stepper's value by clicking the displayed number and typing it, in every stepper in the app, and restore the debounce default to 500ms.

**Architecture:** Extract one shared controlled `EditableNumber` component that swaps a clickable display button for a numeric `<input>` (commit on Enter/blur, cancel on Esc, clamp to optional min/max). Both stepper UIs (`StepperCard`, `StatCard`) render it in place of their value `<span>`. Call sites pass numeric bounds and an edit-disabled flag.

**Tech Stack:** React 19 + TypeScript (Vite), Tailwind, lucide-react icons. Monorepo uses **npm workspaces** (`@munchkin-tools/web`).

**Verification model:** This repo has automated tests ONLY for pure functions (`apps/web/src/lib/*.test.ts`, vitest). There is no component-render test harness and no `typecheck` script. Do NOT add one. Per-task verification:
- Build (also typechecks): `npm run build --workspace=@munchkin-tools/web` (runs `tsc -b && vite build`).
- Lint: `npm run lint --workspace=@munchkin-tools/web`. NOTE: the baseline already has 11 pre-existing lint problems in unrelated files (finish-sheet, name-editor, whoami-sheet, badge, button, tabs, online-finish-sheet). The change must not ADD new ones; pre-existing failures are expected and not caused by this work.
- Unit tests: `npm test --workspace=@munchkin-tools/web` (must stay green).
- Final manual smoke test in Task 8.

---

### Task 1: Create the `EditableNumber` component

**Files:**
- Create: `apps/web/src/components/app/editable-number.tsx`

- [ ] **Step 1: Write the component**

Create `apps/web/src/components/app/editable-number.tsx` with this exact content:

```tsx
import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function EditableNumber({
  value,
  onChange,
  min,
  max,
  disabled,
  className,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.select()
    }
  }, [editing])

  if (disabled) {
    return <span className={className}>{value}</span>
  }

  function startEditing() {
    setDraft(String(value))
    setEditing(true)
  }

  function commit() {
    setEditing(false)
    const parsed = Number.parseInt(draft, 10)

    if (Number.isNaN(parsed)) {
      return
    }

    let next = parsed

    if (min !== undefined) {
      next = Math.max(min, next)
    }

    if (max !== undefined) {
      next = Math.min(max, next)
    }

    if (next !== value) {
      onChange(next)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9-]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
          } else if (e.key === 'Escape') {
            setEditing(false)
          }
        }}
        className={`${className ?? ''} w-full bg-transparent text-center outline-none`}
        aria-label={ariaLabel}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={className}
      aria-label={ariaLabel}
    >
      {value}
    </button>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build --workspace=@munchkin-tools/web`
Expected: PASS (the component is not imported yet, but it must compile).

- [ ] **Step 3: Verify lint adds nothing new**

Run: `npm run lint --workspace=@munchkin-tools/web`
Expected: same 11 pre-existing problems, none in `editable-number.tsx`.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/app/editable-number.tsx
git commit -m "feat(ui): add EditableNumber click-to-edit component"
```

---

### Task 2: Use `EditableNumber` in `StepperCard`

**Files:**
- Modify: `apps/web/src/components/app/stepper-card.tsx`

- [ ] **Step 1: Replace the whole file**

The current value is a static `<span>`. Replace the entire file content with:

```tsx
import { Minus, Plus } from 'lucide-react'
import { EditableNumber } from '@/components/app/editable-number'

type Props = {
  label: string
  value: number
  onChange: (n: number) => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  editDisabled?: boolean
  min?: number
  max?: number
  hint?: string
}

export function StepperCard({
  label,
  value,
  onChange,
  decreaseDisabled,
  increaseDisabled,
  editDisabled,
  min,
  max,
  hint,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin min-w-0 truncate">
          {label}
        </span>
        <div className="flex items-center rounded-md border border-border/60 overflow-hidden shrink-0">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(value - 1)}
            disabled={decreaseDisabled}
            className="px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="size-4" />
          </button>
          <EditableNumber
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            disabled={editDisabled}
            ariaLabel={label}
            className="px-2 py-2 font-munchkin text-primary text-xl tabular-nums min-w-8 text-center hover:text-primary/80 transition-colors"
          />
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => onChange(value + 1)}
            disabled={increaseDisabled}
            className="px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </section>
  )
}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: build PASS; lint adds no new problems. All existing `StepperCard` call sites still compile (new props are optional).

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/app/stepper-card.tsx
git commit -m "feat(ui): editable value in StepperCard"
```

---

### Task 3: Use `EditableNumber` in `StatCard`

**Files:**
- Modify: `apps/web/src/components/app/stat-card.tsx`

- [ ] **Step 1: Replace the whole file**

`StatCard` uses delta callbacks (`onUp`/`onDown`). Add an optional absolute
`onChange` plus bounds; render `EditableNumber` only when `onChange` is given,
otherwise keep the static `<span>`. Replace the entire file with:

```tsx
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditableNumber } from '@/components/app/editable-number'

type Props = {
  label: string
  value: number
  onDown: () => void
  onUp: () => void
  downDisabled?: boolean
  upDisabled?: boolean
  onChange?: (next: number) => void
  min?: number
  max?: number
  editDisabled?: boolean
}

export function StatCard({
  label,
  value,
  onDown,
  onUp,
  downDisabled,
  upDisabled,
  onChange,
  min,
  max,
  editDisabled,
}: Props) {
  const valueClass = 'font-munchkin text-4xl tabular-nums leading-none my-3'

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col items-center">
      <span className="text-xs tracking-widest uppercase text-muted-foreground font-munchkin">
        {label}
      </span>
      {onChange ? (
        <EditableNumber
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={editDisabled}
          ariaLabel={label}
          className={valueClass}
        />
      ) : (
        <span className={valueClass}>{value}</span>
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onDown}
          disabled={downDisabled}
          aria-label={`Decrease ${label}`}
        >
          <ChevronDown className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onUp}
          disabled={upDisabled}
          aria-label={`Increase ${label}`}
        >
          <ChevronUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: build PASS (existing call sites unaffected — new props optional); lint adds no new problems.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/app/stat-card.tsx
git commit -m "feat(ui): optional editable value in StatCard"
```

---

### Task 4: Wire bounds in online + offline settings StepperCards

**Files:**
- Modify: `apps/web/src/components/online/online-settings-tab.tsx` (~lines 106-125)
- Modify: `apps/web/src/components/tabs/settings-tab.tsx` (~lines 71-86)

- [ ] **Step 1: online-settings-tab — max players bounds**

In `apps/web/src/components/online/online-settings-tab.tsx`, the max-players
`StepperCard` currently ends with `hint={t.settings.maxHeroesHint(playerCount)}`.
Add `min` and `max` props to it. The file already has `MIN_MAX_PLAYERS = 3` and
`PRODUCT_MAX_PLAYERS = 8` as module constants. Change:

```tsx
                decreaseDisabled={decreaseMaxPlayersDisabled}
                increaseDisabled={increaseMaxPlayersDisabled}
                hint={t.settings.maxHeroesHint(playerCount)}
```

to:

```tsx
                decreaseDisabled={decreaseMaxPlayersDisabled}
                increaseDisabled={increaseMaxPlayersDisabled}
                min={Math.max(MIN_MAX_PLAYERS, playerCount)}
                max={PRODUCT_MAX_PLAYERS}
                hint={t.settings.maxHeroesHint(playerCount)}
```

- [ ] **Step 2: online-settings-tab — max level bounds**

In the same file, the max-level `StepperCard` uses `MIN_LEVEL` and
`MAX_LEVEL_CEILING` (already defined in the file). Change:

```tsx
                decreaseDisabled={room.maxLevel <= MIN_LEVEL}
                increaseDisabled={room.maxLevel >= MAX_LEVEL_CEILING}
                hint={t.settings.maxLevelHint}
```

to:

```tsx
                decreaseDisabled={room.maxLevel <= MIN_LEVEL}
                increaseDisabled={room.maxLevel >= MAX_LEVEL_CEILING}
                min={MIN_LEVEL}
                max={MAX_LEVEL_CEILING}
                hint={t.settings.maxLevelHint}
```

- [ ] **Step 3: settings-tab (offline) — both bounds**

In `apps/web/src/components/tabs/settings-tab.tsx`, the file imports
`MIN_MAX_PLAYERS` and `PRODUCT_MAX_PLAYERS` from `@/lib/constants` and uses
literal `1`/`99` for level bounds. Change the max-players card:

```tsx
              decreaseDisabled={decreaseMaxPlayersDisabled}
              increaseDisabled={increaseMaxPlayersDisabled}
              hint={t.settings.maxHeroesHint(players.length)}
```

to:

```tsx
              decreaseDisabled={decreaseMaxPlayersDisabled}
              increaseDisabled={increaseMaxPlayersDisabled}
              min={Math.max(MIN_MAX_PLAYERS, players.length)}
              max={PRODUCT_MAX_PLAYERS}
              hint={t.settings.maxHeroesHint(players.length)}
```

and the max-level card:

```tsx
              decreaseDisabled={settings.maxLevel <= 1}
              increaseDisabled={settings.maxLevel >= 99}
              hint={t.settings.maxLevelHint}
```

to:

```tsx
              decreaseDisabled={settings.maxLevel <= 1}
              increaseDisabled={settings.maxLevel >= 99}
              min={1}
              max={99}
              hint={t.settings.maxLevelHint}
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: build PASS; lint adds no new problems.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/online/online-settings-tab.tsx apps/web/src/components/tabs/settings-tab.tsx
git commit -m "feat(settings): bounds for editable max players / max level"
```

---

### Task 5: Wire combat StepperCards (monster level + modifiers) with edit-gating

**Files:**
- Modify: `apps/web/src/components/online/online-fighting-view.tsx` (~lines 237-257)

- [ ] **Step 1: Add min + editDisabled to the three combat StepperCards**

In `apps/web/src/components/online/online-fighting-view.tsx`, the three
`StepperCard`s for monster level, party modifiers, and monster modifiers use
`canControl` to gate their buttons. Add `editDisabled={!canControl}` to all
three, and `min={0}` to the monster-level one. Replace this block:

```tsx
        <StepperCard
          label={t.combat.monsterLevel}
          value={localMonsterLevel}
          onChange={setLocalMonsterLevel}
          decreaseDisabled={!canControl || localMonsterLevel <= 0}
          increaseDisabled={!canControl}
        />
        <StepperCard
          label={t.combat.partyModifiers}
          value={localPartyMod}
          onChange={setLocalPartyMod}
          decreaseDisabled={!canControl}
          increaseDisabled={!canControl}
        />
        <StepperCard
          label={t.combat.monsterModifiers}
          value={localMonsterMod}
          onChange={setLocalMonsterMod}
          decreaseDisabled={!canControl}
          increaseDisabled={!canControl}
        />
```

with:

```tsx
        <StepperCard
          label={t.combat.monsterLevel}
          value={localMonsterLevel}
          onChange={setLocalMonsterLevel}
          decreaseDisabled={!canControl || localMonsterLevel <= 0}
          increaseDisabled={!canControl}
          editDisabled={!canControl}
          min={0}
        />
        <StepperCard
          label={t.combat.partyModifiers}
          value={localPartyMod}
          onChange={setLocalPartyMod}
          decreaseDisabled={!canControl}
          increaseDisabled={!canControl}
          editDisabled={!canControl}
        />
        <StepperCard
          label={t.combat.monsterModifiers}
          value={localMonsterMod}
          onChange={setLocalMonsterMod}
          decreaseDisabled={!canControl}
          increaseDisabled={!canControl}
          editDisabled={!canControl}
        />
```

Party and monster modifiers stay unbounded (no `min`/`max`), so negative values
are allowed.

- [ ] **Step 2: Verify build + lint**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: build PASS; lint adds no new problems.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/online/online-fighting-view.tsx
git commit -m "feat(combat): editable monster level and modifiers"
```

---

### Task 6: Wire StatCards (hero level + gear) in both player-edit screens

**Files:**
- Modify: `apps/web/src/app/player-edit.tsx` (~lines 324-345)
- Modify: `apps/web/src/app/online-player-edit.tsx` (~lines 391-414)

- [ ] **Step 1: Offline player-edit — level + gear onChange**

In `apps/web/src/app/player-edit.tsx`, the file already has `commitField` and
`MIN_LEVEL` in scope, and `settings.maxLevel`. Change the level StatCard:

```tsx
          <StatCard
            label={t.heroEdit.level}
            value={source.level}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={source.level <= MIN_LEVEL}
            upDisabled={source.level >= settings.maxLevel}
          />
```

to:

```tsx
          <StatCard
            label={t.heroEdit.level}
            value={source.level}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={source.level <= MIN_LEVEL}
            upDisabled={source.level >= settings.maxLevel}
            onChange={(n) => commitField('level', n)}
            min={MIN_LEVEL}
            max={settings.maxLevel}
          />
```

and the gear StatCard:

```tsx
          <StatCard
            label={t.heroEdit.gear}
            value={source.gear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
          />
```

to:

```tsx
          <StatCard
            label={t.heroEdit.gear}
            value={source.gear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
            onChange={(n) => commitField('gear', n)}
          />
```

- [ ] **Step 2: Online player-edit — level + gear onChange with edit-gating**

In `apps/web/src/app/online-player-edit.tsx`, `setLocalLevel`/`setLocalGear`
take an absolute value and feed the debounced mutation; `canEdit`, `MIN_LEVEL`
and `room.maxLevel` are in scope. Change the level StatCard:

```tsx
          <StatCard
            label={t.heroEdit.level}
            value={localLevel}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={!canEdit || localLevel <= MIN_LEVEL}
            upDisabled={!canEdit || localLevel >= room.maxLevel}
          />
```

to:

```tsx
          <StatCard
            label={t.heroEdit.level}
            value={localLevel}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={!canEdit || localLevel <= MIN_LEVEL}
            upDisabled={!canEdit || localLevel >= room.maxLevel}
            onChange={setLocalLevel}
            min={MIN_LEVEL}
            max={room.maxLevel}
            editDisabled={!canEdit}
          />
```

and the gear StatCard:

```tsx
          <StatCard
            label={t.heroEdit.gear}
            value={localGear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
            downDisabled={!canEdit}
            upDisabled={!canEdit}
          />
```

to:

```tsx
          <StatCard
            label={t.heroEdit.gear}
            value={localGear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
            downDisabled={!canEdit}
            upDisabled={!canEdit}
            onChange={setLocalGear}
            editDisabled={!canEdit}
          />
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web`
Expected: build PASS; lint adds no new problems.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/player-edit.tsx apps/web/src/app/online-player-edit.tsx
git commit -m "feat(hero): editable level and gear in player edit"
```

---

### Task 7: Restore debounce default to 500ms

**Files:**
- Modify: `apps/web/src/lib/use-debounced-server-value.ts:13`

- [ ] **Step 1: Change the default**

In `apps/web/src/lib/use-debounced-server-value.ts`, change the default delay
from `1000` back to `500`:

```ts
export function useDebouncedServerValue<T>(
  value: T,
  onCommit: (next: T) => void,
  delay = 500,
) {
```

- [ ] **Step 2: Verify build + lint + tests**

Run: `npm run build --workspace=@munchkin-tools/web && npm run lint --workspace=@munchkin-tools/web && npm test --workspace=@munchkin-tools/web`
Expected: build PASS; lint adds no new problems; tests green.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/use-debounced-server-value.ts
git commit -m "fix(combat): restore debounced commit to 500ms"
```

---

### Task 8: Full verification + manual smoke test

**Files:** none (verification only)

- [ ] **Step 1: Build, lint, tests**

Run:
```bash
npm run build --workspace=@munchkin-tools/web
npm run lint --workspace=@munchkin-tools/web
npm test --workspace=@munchkin-tools/web
```
Expected: build PASS; lint shows only the 11 pre-existing problems (no new ones); tests green.

- [ ] **Step 2: Run the app**

Run from repo root: `npm run dev` (starts web + convex).

- [ ] **Step 3: Manual smoke test**

For each editable number — settings max players, settings max level (online and
offline), combat monster level, party modifier, monster modifier, hero level,
hero gear (online and offline):
1. Click the number → it becomes an input with the text selected.
2. Type a value, press **Enter** → it commits.
3. Click a number, type a value, click elsewhere (**blur**) → it commits.
4. Click a number, type, press **Esc** → it reverts, no change.
5. Type an out-of-range value where bounds exist (e.g. max level 200) → clamps
   to the bound (99). Type empty / just `-` → reverts.
6. Type a negative number into a modifier → accepted (no clamp).
7. In online combat as a player without control, and in online hero-edit as a
   non-editor, confirm the number is plain text and not clickable.
8. Tap +/- a few times quickly → a single mutation lands after ~500ms.

- [ ] **Step 4: Final commit (only if cleanup was needed)**

```bash
git add -A
git commit -m "chore: editable-number verification cleanup"
```
(Skip if nothing changed.)
