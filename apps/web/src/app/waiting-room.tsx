import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Id } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { ArrowLeft, Check, Crown, Flag, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/store'

const MIN_PLAYERS_TO_START = 3

export function WaitingRoom() {
  const t = useT()
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: string }>()
  const room = useQuery(api.rooms.getRoom, roomId ? { roomId: roomId as Id<'rooms'> } : 'skip')
  const startMatch = useMutation(api.rooms.startMatch)
  const [copied, setCopied] = useState(false)

  if (!roomId) {
    return null
  }

  if (room === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        {t.waitingRoom.loading}
      </div>
    )
  }

  if (room === null) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">{t.waitingRoom.roomNotFound}</p>
        <Button onClick={() => navigate('/')}>{t.waitingRoom.backHome}</Button>
      </div>
    )
  }

  async function handleStart() {
    await startMatch({ roomId: roomId as Id<'rooms'> })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail in insecure contexts; user can still scan the QR
    }
  }

  if (room.started) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-4xl font-munchkin">{t.waitingRoom.started}</h1>
        <p className="text-muted-foreground">{t.waitingRoom.startedPlaceholder}</p>
      </div>
    )
  }

  const inviteUrl = window.location.href
  const playerCount = room.players.length
  const missing = Math.max(0, MIN_PLAYERS_TO_START - playerCount)
  const canStart = playerCount >= MIN_PLAYERS_TO_START

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" aria-label={t.common.back} onClick={() => navigate('/')}>
          <ArrowLeft className="size-6" />
        </Button>
        <h1 className="text-2xl font-munchkin">{t.waitingRoom.title}</h1>
        <div className="size-11" aria-hidden />
      </header>

      <main className="flex-1 overflow-auto max-w-md w-full mx-auto p-4 flex flex-col gap-4">
        <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col items-center gap-3">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            {t.waitingRoom.roomCode}
          </p>
          <p className="font-munchkin text-6xl text-primary tabular-nums tracking-widest">
            {room.code}
          </p>
          <div className="bg-white rounded-md p-2">
            <QRCodeSVG value={inviteUrl} size={160} aria-label={inviteUrl} />
          </div>
          <Button variant="outline" className="w-full" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
            {copied ? t.waitingRoom.copied : t.waitingRoom.invite}
          </Button>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
              {t.waitingRoom.players} ({playerCount})
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <ul className="flex flex-col gap-2">
            {room.players.map((p) => (
              <li
                key={`${p.name}-${p.joinedAt}`}
                className="flex items-center gap-2 rounded-md border border-border/60 bg-card/50 p-3"
              >
                <span className="font-munchkin text-lg flex-1 truncate">{p.name}</span>
                {p.isHost && (
                  <span className="flex items-center gap-1 text-xs tracking-wider uppercase text-primary">
                    <Crown className="size-4" /> {t.waitingRoom.hostBadge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted-foreground text-center">
          {t.waitingRoom.waitingHint}
        </p>
      </main>

      <footer className="p-4 border-t border-border flex flex-col gap-2">
        {!canStart && (
          <p className="text-xs text-muted-foreground text-center">
            {t.waitingRoom.startNeedsMore(missing)}
          </p>
        )}
        <Button size="lg" className="w-full" onClick={handleStart} disabled={!canStart}>
          <Flag className="size-5" /> {t.waitingRoom.startMatch}
        </Button>
      </footer>
    </div>
  )
}
