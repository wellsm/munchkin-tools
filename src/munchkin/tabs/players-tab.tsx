import { Link } from 'react-router-dom'
import { useMunchkinStore } from '../store'
import { calculateStrength } from '../lib/strength'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Player } from '../types'
import { PlayerForm } from '../components/player-form'
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

  return (
    <div className="relative h-full w-full overflow-auto p-4">
      <h2 className="text-3xl font-munchkin mb-4">Munchkins</h2>
      <ul className="flex flex-col gap-2">
        {players.map((p) => (
          <li key={p.id}>
            <Link
              to={`/player/${p.id}`}
              className="block rounded-md border border-border p-3 hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{p.name}</span>
                <span className="font-munchkin text-primary text-xl">{calculateStrength(p)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

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

      <AddPlayerDialog
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

function AddPlayerDialog({ open, onOpenChange, maxLevel, onSubmit }: AddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add hero</DialogTitle>
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
