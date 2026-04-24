import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Id } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { ArrowLeft, Crown, Flag, Palette, UserMinus, X } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { OnlineGame } from '@/components/online/online-game'
import { RoomShareCard } from '@/components/online/room-share-card'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { AVATAR_COLORS, avatarInitial, playerAvatarColor } from '@/lib/avatar-color'
import { cn } from '@/lib/utils'

const MIN_PLAYERS_TO_START = 3

export function WaitingRoom() {
  const t = useT()
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: string }>()
  const room = useQuery(api.rooms.getRoom, roomId ? { roomId: roomId as Id<'rooms'> } : 'skip')
  const startMatch = useMutation(api.rooms.startMatch)
  const removePlayer = useMutation(api.rooms.removePlayer)
  const updatePlayer = useMutation(api.rooms.updatePlayer)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const denyJoinRequest = useMutation(api.rooms.denyJoinRequest)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

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
  const hasPendingRequest = room.joinRequests.some((r) => r.playerId === playerId)

  if (!isMember) {
    if (hasPendingRequest) {
      async function handleCancelRequest() {
        await denyJoinRequest({
          roomId: roomId as Id<'rooms'>,
          requesterId: playerId,
          targetPlayerId: playerId,
        })
        navigate('/')
      }

      return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-xs tracking-widest uppercase text-muted-foreground">
            {t.waitingRoom.roomCode}
          </p>
          <p className="font-munchkin text-5xl text-primary tabular-nums tracking-widest">
            {room.code}
          </p>
          <p className="text-muted-foreground">
            {t.waitingRoom.joinDescription(room.hostName)}
          </p>
          <p className="text-muted-foreground mt-4">
            {t.waitingRoom.requestPending}
          </p>
          <Button variant="outline" onClick={handleCancelRequest}>
            {t.waitingRoom.cancelRequest}
          </Button>
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
    return <OnlineGame room={room} />
  }

  const inviteUrl = window.location.href
  const playerCount = room.players.length
  const missingPlayers = Math.max(0, MIN_PLAYERS_TO_START - playerCount)
  const notReadyCount = room.players.filter((p) => !p.ready).length
  const hasEnoughPlayers = playerCount >= MIN_PLAYERS_TO_START
  const everyoneReady = notReadyCount === 0
  const canStart = hasEnoughPlayers && everyoneReady
  const isHost = myPlayer.isHost

  async function handleStart() {
    await startMatch({ roomId: roomId as Id<'rooms'> })
  }

  function handleToggleReady(checked: boolean) {
    updatePlayer({
      roomId: roomId as Id<'rooms'>,
      requesterId: playerId,
      targetId: playerId,
      patch: { ready: checked },
    })
  }

  function handlePickColor(color: string | null) {
    updatePlayer({
      roomId: roomId as Id<'rooms'>,
      requesterId: playerId,
      targetId: playerId,
      patch: { color },
    })
    setColorPickerOpen(false)
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
        <RoomShareCard roomCode={room.code} inviteUrl={inviteUrl} />

        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
              {t.waitingRoom.players} ({playerCount})
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <ul className="flex flex-col gap-2">
            {room.players.map((p) => {
              const isMe = p.playerId === playerId
              const bg = playerAvatarColor({ id: p.playerId, color: p.color ?? undefined })

              return (
                <li key={p.playerId} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 rounded-md border border-border/60 bg-card/50 p-3">
                    {isMe ? (
                      <button
                        type="button"
                        onClick={() => setColorPickerOpen((v) => !v)}
                        aria-label={t.waitingRoom.changeColor}
                        className="size-10 shrink-0 rounded-full flex items-center justify-center relative hover:ring-2 hover:ring-primary transition"
                        style={{ backgroundColor: bg }}
                      >
                        <span className="font-munchkin text-lg text-background leading-none">
                          {avatarInitial(p.name)}
                        </span>
                        <span
                          className="absolute -bottom-1 -right-1 size-5 rounded-full bg-card border border-border flex items-center justify-center text-foreground"
                          aria-hidden
                        >
                          <Palette className="size-3" />
                        </span>
                      </button>
                    ) : (
                      <div
                        className="size-10 shrink-0 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: bg }}
                        aria-hidden
                      >
                        <span className="font-munchkin text-lg text-background leading-none">
                          {avatarInitial(p.name)}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-munchkin text-lg truncate">{p.name}</span>
                        {isMe && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {t.waitingRoom.youLabel}
                          </span>
                        )}
                      </div>
                      {p.isHost && (
                        <span className="flex items-center gap-1 text-xs tracking-wider uppercase text-primary">
                          <Crown className="size-3" /> {t.waitingRoom.hostBadge}
                        </span>
                      )}
                    </div>

                    {isHost && !p.isHost && !isMe && (
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

                    <div className="flex items-center gap-2 shrink-0 border p-3 px-4 rounded-full">
                      <span
                        className={cn(
                          'text-xs tracking-wider uppercase',
                          p.ready ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {p.ready ? t.waitingRoom.ready : t.waitingRoom.notReady}
                      </span>
                      <Switch
                        checked={p.ready}
                        onCheckedChange={isMe ? handleToggleReady : undefined}
                        disabled={!isMe}
                        aria-label={p.ready ? t.waitingRoom.ready : t.waitingRoom.notReady}
                      />
                    </div>
                  </div>

                  {isMe && colorPickerOpen && (
                    <div className="p-3 rounded-md border border-border/60 bg-card/30 flex flex-wrap gap-2 justify-center">
                      {AVATAR_COLORS.map((c) => {
                        const selected = p.color === c

                        return (
                          <button
                            key={c}
                            type="button"
                            aria-label={t.heroEdit.pickColor}
                            aria-pressed={selected}
                            onClick={() => handlePickColor(c)}
                            className={cn(
                              'size-9 rounded-full transition-all',
                              selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                            )}
                            style={{ backgroundColor: c }}
                          />
                        )
                      })}
                      <button
                        type="button"
                        aria-label={t.heroEdit.resetColor}
                        aria-pressed={p.color === null}
                        onClick={() => handlePickColor(null)}
                        className={cn(
                          'size-9 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors',
                          p.color === null && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        )}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <p className="text-sm text-muted-foreground text-center">
          {t.waitingRoom.waitingHint}
        </p>
      </main>

      {isHost && (
        <footer className="p-4 border-t border-border flex flex-col gap-2">
          {!hasEnoughPlayers && (
            <p className="text-xs text-muted-foreground text-center">
              {t.waitingRoom.startNeedsMore(missingPlayers)}
            </p>
          )}
          {hasEnoughPlayers && !everyoneReady && (
            <p className="text-xs text-muted-foreground text-center">
              {t.waitingRoom.waitingReady(notReadyCount)}
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
