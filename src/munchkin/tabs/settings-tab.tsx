import { useState } from 'react'
import { Minus, Moon, Plus, Sun, Trash2 } from 'lucide-react'
import { useMunchkinStore } from '../store'
import {
  MIN_MAX_PLAYERS,
  PRODUCT_MAX_PLAYERS,
} from '../constants'
import { applyTheme, getStoredTheme, type Theme } from '@/lib/theme'
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
    <div className="h-full overflow-auto p-4 pb-8 max-w-md mx-auto w-full">
      <h2 className="text-4xl font-munchkin mb-4">Settings</h2>

      <SectionLabel>Party</SectionLabel>
      <div className="flex flex-col gap-3 mb-6">
        <StepperPanel
          label="Max Heroes"
          value={settings.maxPlayers}
          onChange={setMaxPlayers}
          decreaseDisabled={decreaseMaxPlayersDisabled}
          increaseDisabled={increaseMaxPlayersDisabled}
          hint={`Cannot be lower than current hero count (${players.length}).`}
        />
        <StepperPanel
          label="Max Level"
          value={settings.maxLevel}
          onChange={setMaxLevel}
          decreaseDisabled={settings.maxLevel <= 1}
          increaseDisabled={settings.maxLevel >= 99}
          hint="Heroes above this level will be demoted."
        />
      </div>

      <SectionLabel>Appearance</SectionLabel>
      <div className="mb-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-accent transition-colors"
        >
          <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
            Theme
          </span>
          <span className="flex items-center gap-2 text-foreground">
            {theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />}
            <span className="font-munchkin text-xl">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </span>
        </button>
      </div>

      <SectionLabel variant="danger">Danger Zone</SectionLabel>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 hover:bg-destructive/10 transition-colors text-destructive"
          >
            <Trash2 className="size-5" />
            <span className="font-munchkin text-lg">Remove all heroes</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-munchkin text-2xl">Remove all heroes?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes all heroes and resets combat. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetAllPlayers}>Remove all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

type SectionLabelProps = {
  children: React.ReactNode
  variant?: 'default' | 'danger'
}

function SectionLabel({ children, variant = 'default' }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className={cn(
          'text-base tracking-wider uppercase shrink-0',
          variant === 'danger' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {children}
      </span>
      <div className={cn('flex-1 h-px', variant === 'danger' ? 'bg-destructive/40' : 'bg-border')} />
    </div>
  )
}

type StepperPanelProps = {
  label: string
  value: number
  onChange: (n: number) => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  hint?: string
}

function StepperPanel({ label, value, onChange, decreaseDisabled, increaseDisabled, hint }: StepperPanelProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
          {label}
        </span>
        <div className="flex items-center rounded-md border border-border/60 overflow-hidden">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(value - 1)}
            disabled={decreaseDisabled}
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
            disabled={increaseDisabled}
            className="px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      {hint && (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </section>
  )
}
