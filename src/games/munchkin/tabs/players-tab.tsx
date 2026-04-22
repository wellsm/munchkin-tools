import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Player } from '../types'
import { useMunchkinStore } from '../store'
import { gridLayoutFor } from '../lib/grid-layout'
import { PlayerCard } from '../components/player-card'
import { PlayerForm } from '../components/player-form'
import { PlayerEditDialog } from '../components/player-edit-dialog'
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
  const [editId, setEditId] = useState<string | null>(null)
  const editPlayer = players.find((p) => p.id === editId) ?? null

  const layout = gridLayoutFor(players.length)
  const canAdd = players.length < maxPlayers

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">Nenhum jogador ainda.</p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Adicionar jogador
        </Button>
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

  return (
    <div className="relative h-full w-full">
      <div
        className="grid gap-3 h-full w-full p-3"
        style={{
          gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
        }}
      >
        {players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            density={layout.density}
            onClick={() => setEditId(p.id)}
          />
        ))}
      </div>

      {canAdd && (
        <Button
          size="icon"
          className="absolute top-3 right-3 rounded-full shadow-md"
          onClick={() => setAddOpen(true)}
          aria-label="Adicionar jogador"
        >
          <Plus className="size-5" />
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

      <PlayerEditDialog
        player={editPlayer}
        open={editId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditId(null)
          }
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
          <DialogTitle>Adicionar jogador</DialogTitle>
        </DialogHeader>
        <PlayerForm
          maxLevel={maxLevel}
          submitLabel="Adicionar"
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
