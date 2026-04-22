import { ArrowLeft, Crown, Plus, Skull, UserMinus, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { avatarInitial, playerAvatarColor } from '../lib/avatar-color'
import { combatTotals } from '../lib/combat'
import { useMunchkinStore } from '../store'
import type { Player } from '../types'
import { HelperPickerSheet } from './helper-picker-sheet'
import { StepperCard } from './stepper-card'
import { VersusBadge } from './versus-badge'
import { VictorySheet } from './victory-sheet'

export function FightingView() {
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
                style={{ backgroundColor: playerAvatarColor(main) }}
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
                  style={{ backgroundColor: playerAvatarColor(h) }}
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
        decreaseDisabled={combat.monsterLevel <= 0}
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

      <VictorySheet open={victoryOpen} onOpenChange={setVictoryOpen} />
    </div>
  )
}
