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
            <Minus className="size-5" />
          </Button>
          <span className="w-10 text-center tabular-nums text-lg">{settings.maxPlayers}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setMaxPlayers(settings.maxPlayers + 1)}
            disabled={increaseMaxPlayersDisabled}
            aria-label="Aumentar jogadores máximo"
          >
            <Plus className="size-5" />
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
          {theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />}
          <span className="ml-2">{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
        </Button>
      </section>

      <section className="flex flex-col gap-2 pt-4 border-t border-border">
        <Label className="text-destructive">Zona perigosa</Label>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="justify-start">
              <Trash2 className="size-5" />
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
