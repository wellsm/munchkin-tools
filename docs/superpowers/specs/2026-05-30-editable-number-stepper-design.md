# Editable Number in Steppers — Design

**Date:** 2026-05-30
**Status:** Approved

## Goal

Let users set a stepper's value by clicking the displayed number and typing,
instead of only tapping the +/- (or chevron) buttons. Applies to every number
stepper in the app.

## Background

There are two stepper implementations, both rendering the value as a
non-interactive `<span>`:

- **`StepperCard`** (`apps/web/src/components/app/stepper-card.tsx`) — Minus /
  value / Plus row. Used for: max players (3–8) and max level (1–99) in
  `online-settings-tab.tsx` and `settings-tab.tsx`; monster level (min 0),
  party modifiers (unbounded, can be negative) and monster modifiers (unbounded)
  in `online-fighting-view.tsx`. In the fighting view the buttons are disabled
  when the user lacks combat control (`!canControl`).
- **`StatCard`** (`apps/web/src/components/app/stat-card.tsx`) — value with
  chevron-down / chevron-up below it. Used in `player-edit.tsx` for hero level
  (1–maxLevel) and gear (unbounded).

Both currently take only `decreaseDisabled`/`increaseDisabled` (or
`downDisabled`/`upDisabled`) booleans — no numeric min/max.

## Approach

Extract a shared `EditableNumber` component that owns all click-to-edit logic.
Both `StepperCard` and `StatCard` render it in place of their value `<span>`.
This keeps the edit logic in one place (DRY) and testable in isolation.

## Component: `EditableNumber`

**File:** `apps/web/src/components/app/editable-number.tsx`

**Props:**

```ts
type Props = {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string   // applied to both the display button and the input
  ariaLabel?: string
}
```

**Behavior:**

- **Display mode (default):** renders a `<button type="button">{value}</button>`.
  Clicking it enters edit mode (unless `disabled`, in which case it renders a
  plain `<span>` — not clickable).
- **Edit mode:** renders `<input inputMode="numeric">` seeded with the current
  value as text and auto-selected (so typing replaces it). Allowed characters:
  digits and a leading `-` (strip everything else on input).
- **Commit** (on `blur` OR `Enter`):
  - Parse with `Number.parseInt(draft, 10)`.
  - If empty or `NaN` → discard, revert to current `value` (no `onChange`).
  - Clamp to `min`/`max` when those props are defined (unbounded otherwise).
  - Call `onChange(next)` only if `next !== value`.
  - Leave edit mode.
- **Cancel** (`Escape`): leave edit mode, no `onChange`.

The component is presentational and controlled — it never holds the committed
value, only the in-progress draft string and an `editing` boolean.

## `StepperCard` changes

- Add optional props: `min?: number`, `max?: number`, `editDisabled?: boolean`.
- Replace the value `<span>{value}</span>` with
  `<EditableNumber value={value} onChange={onChange} min={min} max={max}
  disabled={editDisabled} ariaLabel={label} className="..." />` keeping the
  existing value typography classes.
- The +/- buttons are unchanged (still gated by
  `decreaseDisabled`/`increaseDisabled`).

## `StatCard` changes

- Currently uses `onUp`/`onDown` callbacks (not a single `onChange`). Add
  optional props: `onChange?: (next: number) => void`, `min?`, `max?`,
  `editDisabled?`.
- Replace the value `<span>` with `<EditableNumber>` when `onChange` is
  provided; if `onChange` is absent, keep the plain `<span>` (backward safe).
  Pass `disabled={editDisabled}`.
- The chevron buttons keep using `onUp`/`onDown`.

## Call-site changes (pass bounds + edit-gating)

- `online-settings-tab.tsx`: max players `min={3} max={8}`; max level
  `min={1} max={99}`.
- `settings-tab.tsx`: same bounds (3–8, 1–99).
- `online-fighting-view.tsx`: monster level `min={0}` + `editDisabled={!canControl}`;
  party/monster modifiers no min/max + `editDisabled={!canControl}`.
- `player-edit.tsx`: hero level `min={1} max={settings.maxLevel}` with an
  `onChange`; gear `onChange` with no bounds. (Wire `onChange` to the same
  setter the chevrons use.)

Numbers without bounds (modifiers, gear) get no `min`/`max`, so any integer
(including negative) is accepted.

## Error / edge handling

- Empty, whitespace, `-`, or non-numeric input on commit → revert silently.
- Online settings already clamp server-side (`clampInt`); client clamp is UX
  only, not a security boundary.
- `disabled`/`editDisabled` number is plain text — no edit affordance.

## Testing

This repo only has vitest tests for pure functions (`apps/web/src/lib/*.test.ts`)
— no component-render test setup. Do NOT add one. Verification:
- `npm run build --workspace=@munchkin-tools/web` (tsc + vite)
- `npm run lint --workspace=@munchkin-tools/web` (note: pre-existing lint errors
  exist in unrelated files; the change must not ADD new ones)
- Manual smoke test: click each number type, type a value, confirm with Enter
  and with blur, cancel with Esc, try out-of-range (clamps) and empty (reverts),
  try a negative modifier, and confirm a disabled combat stepper is not editable.

## Out of scope

- Changing the +/- / chevron button behavior.
- Adding numeric bounds enforcement to the increment buttons (they already use
  the disabled props).
- Long-press / hold-to-repeat on buttons.
