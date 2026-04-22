import type { Player } from '../types'
import { useMunchkinStore } from '../store'
import { PlayerForm } from './player-form'
import {
  Dialog,
  DialogContent,
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

export function PlayerEditDialog({ player, open, onOpenChange }: Props) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editar {player.name}</DialogTitle>
        </DialogHeader>

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
          onCancel={() => onOpenChange(false)}
          onSubmit={(values) => {
            updatePlayer(player.id, values)
            onOpenChange(false)
          }}
        />

        <div className="pt-4 mt-2 border-t border-border flex justify-start">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Remover jogador</Button>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
