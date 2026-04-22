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
        <p className="text-muted-foreground">Add heroes in the Heroes tab before combat.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      <section className="flex-1 overflow-auto border-b md:border-b-0 md:border-r border-border p-4">
        <h2 className="font-semibold mb-3">Participants</h2>
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
                  <span className="tabular-nums text-muted-foreground">STR {calculateStrength(p)}</span>
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
          {result.outcome === 'winning' ? `Winning by ${result.difference}` : `Losing by ${result.difference}`}
        </div>

        <Button variant="outline" onClick={resetCombat}>
          <RotateCcw className="size-4" /> Reset combat
        </Button>
      </section>
    </div>
  )
}

type StepperProps = {
  value: number
  onChange: (n: number) => void
  min?: number
  label: string
}

function Stepper({ value, onChange, min, label }: StepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label={`Decrease ${label}`}
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
        aria-label={`Increase ${label}`}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}

type TeamPanelProps = {
  title: string
  total: number
  buff: number
  onBuffChange: (n: number) => void
}

function TeamPanel({ title, total, buff, onBuffChange }: TeamPanelProps) {
  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-3xl font-bold tabular-nums">{total}</span>
      </div>
      <div className="flex items-center justify-between">
        <Label>Team buff</Label>
        <Stepper value={buff} onChange={onBuffChange} label="Munchkins buff" />
      </div>
    </div>
  )
}

type MonsterPanelProps = {
  level: number
  buff: number
  total: number
  onLevelChange: (n: number) => void
  onBuffChange: (n: number) => void
}

function MonsterPanel({ level, buff, total, onLevelChange, onBuffChange }: MonsterPanelProps) {
  return (
    <div className="rounded-lg border border-border p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Monster</h3>
        <span className="text-3xl font-bold tabular-nums">{total}</span>
      </div>
      <div className="flex items-center justify-between">
        <Label>Monster level</Label>
        <Stepper value={level} onChange={onLevelChange} min={0} label="Monster level" />
      </div>
      <div className="flex items-center justify-between">
        <Label>Monster buff</Label>
        <Stepper value={buff} onChange={onBuffChange} label="Monster buff" />
      </div>
    </div>
  )
}
