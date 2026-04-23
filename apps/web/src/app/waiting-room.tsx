import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Id } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { ArrowLeft, Check, Crown, Flag, Share2, UserMinus } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

const MIN_PLAYERS_TO_START = 3

export function WaitingRoom() {
  const t = useT()
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: string }>()
  const room = useQuery(api.rooms.getRoom, roomId ? { roomId: roomId as Id<'rooms'> } : 'skip')
  const startMatch = useMutation(api.rooms.startMatch)
  const removePlayer = useMutation(api.rooms.removePlayer)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
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

  const myPlayer = room.players.find((p) => p.playerId === playerId)
  const isMember = myPlayer !== undefined

  if (!isMember) {
    if (room.started) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">{t.waitingRoom.alreadyStarted}</p>
          <Button onClick={() => navigate('/')}>{t.waitingRoom.backHome}</Button>
        </div>
      )
    }

    return (
      <JoinRoomView
        roomId={roomId as Id<'rooms'>}
        hostName={room.hostName}
        roomCode={room.code}
      />
    )
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
  const isHost = myPlayer.isHost

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
          <div className="bg-white rounded-md p-3 mb-2">
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
                key={p.playerId}
                className="flex items-center gap-2 rounded-md border border-border/60 bg-card/50 p-3"
              >
                <span className="font-munchkin text-lg flex-1 truncate">{p.name}</span>
                {p.isHost && (
                  <span className="flex items-center gap-1 text-xs tracking-wider uppercase text-primary">
                    <Crown className="size-4" /> {t.waitingRoom.hostBadge}
                  </span>
                )}
                {isHost && !p.isHost && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t.waitingRoom.removePlayerAria(p.name)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-munchkin text-2xl">
                          {t.waitingRoom.removePlayerTitle(p.name)}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.waitingRoom.removePlayerDescription}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            removePlayer({
                              roomId: roomId as Id<'rooms'>,
                              requesterId: playerId,
                              targetId: p.playerId,
                            })
                          }
                        >
                          {t.common.remove}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted-foreground text-center">
          {t.waitingRoom.waitingHint}
        </p>
      </main>

      {isHost && (
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
      )}
    </div>
  )
}

type JoinRoomViewProps = {
  roomId: Id<'rooms'>
  hostName: string
  roomCode: string
}

function JoinRoomView({ roomId, hostName, roomCode }: JoinRoomViewProps) {
  const t = useT()
  const navigate = useNavigate()
  const joinRoom = useMutation(api.rooms.joinRoom)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const setLastUsedName = usePlayerIdentityStore((s) => s.setLastUsedName)
  const [name, setName] = useState(lastUsedName ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = !submitting && name.trim().length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await joinRoom({ roomId, playerId, name })
      setLastUsedName(name)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.waitingRoom.joinError
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" aria-label={t.common.back} onClick={() => navigate('/')}>
          <ArrowLeft className="size-6" />
        </Button>
        <h1 className="text-2xl font-munchkin">{t.waitingRoom.joinTitle}</h1>
        <div className="size-11" aria-hidden />
      </header>

      <main className="flex-1 overflow-auto max-w-sm w-full mx-auto p-6 flex flex-col justify-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            {t.waitingRoom.roomCode}
          </p>
          <p className="font-munchkin text-5xl text-primary tabular-nums tracking-widest">
            {roomCode}
          </p>
          <p className="text-muted-foreground mt-2">
            {t.waitingRoom.joinDescription(hostName)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="join-name">{t.waitingRoom.yourName}</Label>
            <Input
              id="join-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.waitingRoom.yourNamePlaceholder}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button size="lg" type="submit" disabled={!canSubmit}>
            {submitting ? t.waitingRoom.joining : t.waitingRoom.join}
          </Button>
        </form>
      </main>
    </div>
  )
}
