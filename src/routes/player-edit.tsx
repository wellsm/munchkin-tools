import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Mars,
  Pencil,
  Swords,
  Trash2,
  Venus,
} from 'lucide-react'
import { useMunchkinStore } from '@/munchkin/store'
import { calculateStrength } from '@/munchkin/lib/strength'
import { avatarColor, avatarInitial } from '@/munchkin/lib/avatar-color'
import {
  CLASSES,
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  MIN_LEVEL,
  RACES,
} from '@/munchkin/constants'
import type { Gender, MunchkinClass, MunchkinRace, Player } from '@/munchkin/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'

export function PlayerEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const player = useMunchkinStore((s) => s.players.find((p) => p.id === id))
  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel)
  const updatePlayer = useMunchkinStore((s) => s.updatePlayer)
  const removePlayer = useMunchkinStore((s) => s.removePlayer)
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant)

  if (!player) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground">Hero not found.</p>
          <Button onClick={() => navigate('/')}>Back to party</Button>
        </div>
      </div>
    )
  }

  function handleRemove() {
    if (!player) {
      return
    }

    removePlayer(player.id)
    navigate('/')
  }

  function handleEnterCombat() {
    if (!player) {
      return
    }

    setMainCombatant(player.id)
    navigate('/?tab=combat')
  }

  function handleGender(next: Gender) {
    if (!player) {
      return
    }

    const nextGender = player.gender === next ? null : next
    updatePlayer(player.id, { gender: nextGender })
  }

  function handleLevelChange(delta: number) {
    if (!player) {
      return
    }

    const next = Math.max(MIN_LEVEL, Math.min(maxLevel, player.level + delta))
    updatePlayer(player.id, { level: next })
  }

  function handleGearChange(delta: number) {
    if (!player) {
      return
    }

    updatePlayer(player.id, { gear: player.gear + delta })
  }

  function toggleRace(race: MunchkinRace) {
    if (!player) {
      return
    }

    if (player.races.includes(race)) {
      updatePlayer(player.id, { races: player.races.filter((r) => r !== race) })

      return
    }

    if (player.races.length >= MAX_RACES_PER_PLAYER) {
      return
    }

    updatePlayer(player.id, { races: [...player.races, race] })
  }

  function toggleClass(klass: MunchkinClass) {
    if (!player) {
      return
    }

    if (player.classes.includes(klass)) {
      updatePlayer(player.id, { classes: player.classes.filter((c) => c !== klass) })

      return
    }

    if (player.classes.length >= MAX_CLASSES_PER_PLAYER) {
      return
    }

    updatePlayer(player.id, { classes: [...player.classes, klass] })
  }

  const strength = calculateStrength(player)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-md mx-auto w-full p-4 pb-8 flex flex-col">
        <header className="flex justify-between items-center">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate('/')}>
            <ArrowLeft className="size-6" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Remove hero">
                <Trash2 className="size-6" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove {player.name}?</AlertDialogTitle>
                <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </header>

        <div className="flex flex-col items-center mt-6">
          <div
            className="size-28 rounded-full flex items-center justify-center"
            style={{ backgroundColor: avatarColor(player.id) }}
            aria-hidden
          >
            <span className="font-munchkin text-6xl text-background leading-none">
              {avatarInitial(player.name)}
            </span>
          </div>

          <NameEditor player={player} onRename={(name) => updatePlayer(player.id, { name })} />

          <div className="flex items-center gap-3 mt-2">
            <GenderButton
              active={player.gender === 'male'}
              label="Male"
              onClick={() => handleGender('male')}
            >
              <Mars className="size-5" />
            </GenderButton>
            <GenderButton
              active={player.gender === 'female'}
              label="Female"
              onClick={() => handleGender('female')}
            >
              <Venus className="size-5" />
            </GenderButton>
          </div>
        </div>

        <div className="flex flex-col items-center mt-8">
          <span className="text-xs tracking-widest uppercase text-muted-foreground">Strength</span>
          <span className="font-munchkin text-9xl text-primary tabular-nums leading-none mt-3">
            {strength}
          </span>
          <span className="text-sm text-muted-foreground mt-3">
            Level {player.level} + Gear {player.gear}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <StatCard
            label="LEVEL"
            value={player.level}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={player.level <= MIN_LEVEL}
            upDisabled={player.level >= maxLevel}
          />
          <StatCard
            label="GEAR"
            value={player.gear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Race {player.races.length}/{MAX_RACES_PER_PLAYER}
          </span>
          <div className="flex flex-wrap gap-2">
            {RACES.map((r) => {
              const Icon = r.icon
              const active = player.races.includes(r.id)

              return (
                <Chip key={r.id} active={active} onClick={() => toggleRace(r.id)}>
                  <Icon className="size-4" aria-hidden />
                  {r.label}
                </Chip>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Class {player.classes.length}/{MAX_CLASSES_PER_PLAYER}
          </span>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => {
              const Icon = c.icon
              const active = player.classes.includes(c.id)

              return (
                <Chip key={c.id} active={active} onClick={() => toggleClass(c.id)}>
                  <Icon className="size-4" aria-hidden />
                  {c.label}
                </Chip>
              )
            })}
          </div>
        </div>

        <Button size="lg" className="w-full mt-8" onClick={handleEnterCombat}>
          <Swords className="size-5" /> Enter combat
        </Button>
      </div>
    </div>
  )
}

type NameEditorProps = {
  player: Player
  onRename: (name: string) => void
}

function NameEditor({ player, onRename }: NameEditorProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(player.name)

  useEffect(() => {
    if (!editing) {
      setDraft(player.name)
    }
  }, [player.name, editing])

  function commit() {
    const trimmed = draft.trim()

    if (trimmed.length > 0 && trimmed !== player.name) {
      onRename(trimmed)
    }

    setEditing(false)
  }

  function cancel() {
    setDraft(player.name)
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
          } else if (e.key === 'Escape') {
            cancel()
          }
        }}
        className="mt-4 w-auto min-w-40 max-w-full text-center text-3xl font-munchkin h-auto py-1"
        aria-label="Hero name"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="mt-4 flex items-center gap-2 cursor-pointer"
      aria-label="Edit hero name"
    >
      <span className="text-3xl font-munchkin">{player.name}</span>
      <Pencil className="size-4 text-muted-foreground" aria-hidden />
    </button>
  )
}

type GenderButtonProps = {
  active: boolean
  label: string
  children: React.ReactNode
  onClick: () => void
}

function GenderButton({ active, label, children, onClick }: GenderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center size-9 rounded-full transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

type StatCardProps = {
  label: string
  value: number
  onDown: () => void
  onUp: () => void
  downDisabled?: boolean
  upDisabled?: boolean
}

function StatCard({ label, value, onDown, onUp, downDisabled, upDisabled }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col items-center">
      <span className="text-xs tracking-widest uppercase text-muted-foreground font-munchkin">
        {label}
      </span>
      <span className="font-munchkin text-4xl tabular-nums leading-none my-3">{value}</span>
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

type ChipProps = {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}

function Chip({ active, children, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-base transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-transparent text-foreground border-border hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}
