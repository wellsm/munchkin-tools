import { useState } from 'react'
import type { Player } from '../types'
import { classById, raceById } from '../constants'
import { calculateStrength } from '../lib/strength'
import { useMunchkinStore } from '../store'
import { PlayerForm } from './player_form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'

type Props = {
  player: Player | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerDetailDialog({ player, open, onOpenChange }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const updatePlayer = useMunchkinStore((s) => s.updatePlayer)
  const removePlayer = useMunchkinStore((s) => s.removePlayer)
  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel)

  if (!player) {
    return null
  }

  function handleRemove() {
    if (!player) {
      return
    }

    removePlayer(player.id)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setIsEditing(false)
        }

        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{player.name}</DialogTitle>
          <DialogDescription>
            Força atual: <span className="font-semibold text-foreground">{calculateStrength(player)}</span>
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <PlayerForm
            initialValues={{
              name: player.name,
              level: player.level,
              itemBonus: player.itemBonus,
              classes: player.classes,
              races: player.races,
            }}
            maxLevel={maxLevel}
            submitLabel="Salvar"
            onCancel={() => setIsEditing(false)}
            onSubmit={(values) => {
              updatePlayer(player.id, values)
              setIsEditing(false)
            }}
          />
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <DetailRow label="Nível" value={String(player.level)} />
            <DetailRow label="Bônus de itens" value={player.itemBonus >= 0 ? `+${player.itemBonus}` : String(player.itemBonus)} />
            <DetailRow
              label="Classes"
              value={player.classes.length === 0 ? '—' : player.classes.map((id) => {
                const e = classById(id)

                return `${e.label}`
              }).join(', ')}
            />
            <DetailRow
              label="Raças"
              value={player.races.length === 0 ? '—' : player.races.map((id) => {
                const e = raceById(id)

                return `${e.label}`
              }).join(', ')}
            />
          </div>
        )}

        {!isEditing && (
          <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Remover</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover {player.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove}>Remover</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setIsEditing(true)}>Editar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
