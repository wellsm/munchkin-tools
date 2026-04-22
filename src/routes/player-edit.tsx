import { useParams, useNavigate } from 'react-router-dom'
import { useMunchkinStore } from '@/munchkin/store'
import { Button } from '@/components/ui/button'

export function PlayerEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const player = useMunchkinStore((s) => s.players.find((p) => p.id === id))

  if (!player) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">Player not found.</p>
          <Button onClick={() => navigate('/')}>Back to party</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh p-6 bg-background text-foreground">
      <p>Edit screen for {player.name} — coming in D3.</p>
      <Button onClick={() => navigate('/')} className="mt-4">Back</Button>
    </div>
  )
}
