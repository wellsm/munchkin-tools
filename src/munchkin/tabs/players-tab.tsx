import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Player } from '../types'
import { useMunchkinStore } from '../store'
import { HeroRow } from '../components/hero-row'
import { PlayerForm } from '../components/player-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type NewPlayerInput = Omit<Player, 'id'>

export function PlayersTab() {
  const players = useMunchkinStore((s) => s.players)
  const maxPlayers = useMunchkinStore((s) => s.settings.maxPlayers)
  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel)
  const addPlayer = useMunchkinStore((s) => s.addPlayer)
  const [addOpen, setAddOpen] = useState(false)

  const canAdd = players.length < maxPlayers
  const heroCount = players.length

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">No heroes yet.</p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-5" /> Add hero
        </Button>
        <AddHeroDialog
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
      <div className="h-full overflow-auto p-4 pb-24">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-4xl font-munchkin leading-none">Munchkins</h2>
          <span className="text-sm tracking-wider uppercase text-muted-foreground">
            {heroCount} {heroCount === 1 ? 'Hero' : 'Heroes'}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
            The Party
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <ul className="flex flex-col gap-3">
          {players.map((p) => (
            <li key={p.id}>
              <HeroRow player={p} />
            </li>
          ))}
        </ul>
      </div>

      {canAdd && (
        <Button
          size="icon"
          className="absolute bottom-4 right-4 size-14 rounded-full shadow-lg"
          onClick={() => setAddOpen(true)}
          aria-label="Add hero"
        >
          <Plus className="size-7" />
        </Button>
      )}

      <AddHeroDialog
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

type AddDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  maxLevel: number
  onSubmit: (values: NewPlayerInput) => void
}

function AddHeroDialog({ open, onOpenChange, maxLevel, onSubmit }: AddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-munchkin text-2xl">Add hero</DialogTitle>
        </DialogHeader>
        <PlayerForm
          maxLevel={maxLevel}
          submitLabel="Add"
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
