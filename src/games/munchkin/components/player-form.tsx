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
