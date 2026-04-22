import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Crown,
  Minus,
  Plus,
  Skull,
  Swords,
  UserMinus,
  X,
} from 'lucide-react'
import type { Player } from '../types'
import { useMunchkinStore } from '../store'
import { combatTotals } from '../lib/combat'
import { calculateStrength } from '../lib/strength'
import { avatarColor, avatarInitial } from '../lib/avatar-color'
import { classById, raceById } from '../constants'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function CombatTab() {
  const mainCombatantId = useMunchkinStore((s) => s.combat.mainCombatantId)

  if (mainCombatantId === null) {
    return <WhoFightsView />
  }

  return <FightingView />
}

function combatBreed(player: Player): string {
  const races = player.races.map((id) => raceById(id).label.toUpperCase()).join(' / ')
  const classes = player.classes.map((id) => classById(id).label.toUpperCase()).join(' / ')

  if (races && classes) {
    return `${races} · ${classes}`
  }

  return races || classes || 'UNKNOWN'
}

function WhoFightsView() {
  const players = useMunchkinStore((s) => s.players)
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant)

  if (players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">Add heroes in the Heroes tab before combat.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4 max-w-md mx-auto w-full">
      <h2 className="text-4xl font-munchkin mb-4">Combat</h2>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
          Who Fights?
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <ul className="flex flex-col gap-3">
        {players.map((p) => {
          const strength = calculateStrength(p)

          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setMainCombatant(p.id)}
                className="w-full flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3 hover:bg-accent transition-colors text-left"
              >
                <div
                  className="size-12 shrink-0 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: avatarColor(p.id) }}
                  aria-hidden
                >
                  <span className="font-munchkin text-2xl text-background leading-none">
                    {avatarInitial(p.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-lg font-munchkin truncate">{p.name}</span>
                  <span className="text-sm tracking-wide text-muted-foreground truncate">
                    {combatBreed(p)}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-md border border-primary/60 bg-primary/10 px-2.5 py-1.5 min-w-12 shrink-0">
                  <span className="font-munchkin text-xl text-primary leading-none tabular-nums">
                    {strength}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-muted-foreground mt-0.5">
                    STR
                  </span>
                </div>
                <Swords className="size-5 text-muted-foreground shrink-0" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function FightingView() {
  const navigate = useNavigate()
  const players = useMunchkinStore((s) => s.players)
  const combat = useMunchkinStore((s) => s.combat)
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant)
  const removeHelper = useMunchkinStore((s) => s.removeHelper)
  const setPartyModifier = useMunchkinStore((s) => s.setPartyModifier)
  const setMonsterLevel = useMunchkinStore((s) => s.setMonsterLevel)
  const setMonsterModifier = useMunchkinStore((s) => s.setMonsterModifier)
  const resetCombat = useMunchkinStore((s) => s.resetCombat)

  const [pickerOpen, setPickerOpen] = useState(false)
  const [victoryOpen, setVictoryOpen] = useState(false)

  const main = players.find((p) => p.id === combat.mainCombatantId)
  const helpers = combat.helperIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined)

  if (!main) {
    setMainCombatant(null)

    return null
  }

  const result = combatTotals(players, combat)
  const hasHelper = helpers.length > 0
  const canAddHelper = helpers.length < 1

  function handleFled() {
    resetCombat()
    navigate('/?tab=players')
  }

  return (
    <div className="h-full overflow-auto p-4 max-w-md mx-auto w-full flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to hero selection"
          onClick={() => setMainCombatant(null)}
        >
          <ArrowLeft className="size-6" />
        </Button>
        <h1 className="text-2xl font-munchkin">Combat</h1>
        <div className="size-11" aria-hidden />
      </header>

      <section className="rounded-xl border border-border/60 bg-card/50 p-5">
        <div className="grid grid-cols-3 gap-2 items-start">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Party</span>
            <span className="font-munchkin text-6xl text-primary tabular-nums leading-none mt-2">
              {result.partyTotal}
            </span>
            <span className="text-sm text-muted-foreground mt-2">
              {main.name} · L{main.level} +G{main.gear}
            </span>
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              <div
                className="size-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: avatarColor(main.id) }}
                aria-hidden
              >
                <span className="font-munchkin text-lg text-background leading-none">
                  {avatarInitial(main.name)}
                </span>
              </div>
              {helpers.map((h) => (
                <div
                  key={h.id}
                  className="size-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: avatarColor(h.id) }}
                  aria-hidden
                >
                  <span className="font-munchkin text-lg text-background leading-none">
                    {avatarInitial(h.name)}
                  </span>
                </div>
              ))}
              {canAddHelper && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  aria-label="Add helper"
                  className="size-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  <Plus className="size-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-1 pt-6">
            <span className="text-xs tracking-widest text-muted-foreground">VS</span>
            <VersusBadge partyTotal={result.partyTotal} monsterTotal={result.monsterTotal} />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="text-xs tracking-widest uppercase text-muted-foreground">Monster</span>
            <span className="font-munchkin text-6xl text-foreground tabular-nums leading-none mt-2">
              {combat.monsterLevel + combat.monsterModifier}
            </span>
            <span className="text-sm text-muted-foreground mt-2">Level {combat.monsterLevel}</span>
            <div className="size-10 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center mt-3 mx-auto">
              <Skull className="size-5 text-destructive" />
            </div>
          </div>
        </div>
      </section>

      <StepperCard
        label="Monster Level"
        value={combat.monsterLevel}
        onChange={setMonsterLevel}
        min={0}
      />
      <StepperCard
        label="Party modifiers"
        value={combat.partyModifier}
        onChange={setPartyModifier}
      />
      <StepperCard
        label="Monster modifiers"
        value={combat.monsterModifier}
        onChange={setMonsterModifier}
      />

      {hasHelper && (
        <Button variant="outline" onClick={() => helpers.forEach((h) => removeHelper(h.id))}>
          <UserMinus className="size-4" /> Remove Helper
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleFled}
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-5" /> Fled
        </Button>
        <Button onClick={() => setVictoryOpen(true)}>
          <Crown className="size-5" /> Victory
        </Button>
      </div>

      <HelperPickerSheet open={pickerOpen} onOpenChange={setPickerOpen} />

      <VictoryStubDialog open={victoryOpen} onOpenChange={setVictoryOpen} />
    </div>
  )
}

type VersusBadgeProps = {
  partyTotal: number
  monsterTotal: number
}

function VersusBadge({ partyTotal, monsterTotal }: VersusBadgeProps) {
  const diff = partyTotal - monsterTotal
  const winning = diff > 0

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-3 py-1.5 font-munchkin text-2xl tabular-nums',
        winning
          ? 'border-primary/60 text-primary'
          : 'border-destructive/60 text-destructive',
      )}
    >
      {winning ? `+${diff}` : diff}
    </span>
  )
}

type StepperCardProps = {
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
}

function StepperCard({ label, value, onChange, min }: StepperCardProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex items-center justify-between gap-3">
      <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
        {label}
      </span>
      <div className="flex items-center rounded-md border border-border/60 overflow-hidden">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(value - 1)}
          disabled={min !== undefined && value <= min}
          className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="size-4" />
        </button>
        <span className="px-4 py-2 font-munchkin text-primary text-xl tabular-nums min-w-10 text-center">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </section>
  )
}

type HelperPickerSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function HelperPickerSheet({ open, onOpenChange }: HelperPickerSheetProps) {
  const players = useMunchkinStore((s) => s.players)
  const combat = useMunchkinStore((s) => s.combat)
  const addHelper = useMunchkinStore((s) => s.addHelper)

  const available = players.filter(
    (p) => p.id !== combat.mainCombatantId && !combat.helperIds.includes(p.id),
  )

  function pick(id: string) {
    addHelper(id)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80dvh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-2xl">Choose a helper</SheetTitle>
          <SheetDescription>Pick another hero to join the fight.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto mt-4 px-4 pb-4">
          {available.length === 0 && (
            <p className="text-center text-muted-foreground p-4">No other heroes available.</p>
          )}
          <ul className="flex flex-col gap-2">
            {available.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pick(p.id)}
                  className="w-full flex items-center gap-3 rounded-lg bg-card/50 border border-border/60 p-3 hover:bg-accent transition-colors text-left"
                >
                  <div
                    className="size-10 shrink-0 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: avatarColor(p.id) }}
                    aria-hidden
                  >
                    <span className="font-munchkin text-xl text-background leading-none">
                      {avatarInitial(p.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-lg font-munchkin truncate">{p.name}</span>
                    <span className="text-sm tracking-wide text-muted-foreground truncate">
                      {combatBreed(p)}
                    </span>
                  </div>
                  <span className="font-munchkin text-xl text-primary tabular-nums">
                    {calculateStrength(p)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}

type VictoryStubDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function VictoryStubDialog({ open, onOpenChange }: VictoryStubDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-munchkin text-2xl">Victory!</DialogTitle>
          <DialogDescription>
            Victory rewards (level ups) coming soon.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
