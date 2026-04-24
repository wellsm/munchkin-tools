import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useConvex, useMutation, useQuery } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnlineSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const convex = useConvex()
  const createRoom = useMutation(api.rooms.createRoom)
  const joinRoom = useMutation(api.rooms.joinRoom)
  const needsCode = useQuery(api.access.isAccessCodeNeeded)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const setLastUsedName = usePlayerIdentityStore((s) => s.setLastUsedName)

  const [name, setName] = useState(lastUsedName ?? '')
  const [accessCode, setAccessCode] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isAccessLoading = needsCode === undefined
  const canCreate =
    !submitting &&
    !isAccessLoading &&
    name.trim().length > 0 &&
    (!needsCode || accessCode.trim().length > 0)
  const canJoin = !submitting && name.trim().length > 0 && roomCode.trim().length > 0

  async function handleCreate(e: FormEvent) {
    e.preventDefault()

    if (!canCreate) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const args: { playerId: string; hostName: string; accessCode?: string } = {
        playerId,
        hostName: name,
      }

      if (needsCode) {
        args.accessCode = accessCode
      }

      const roomId = await createRoom(args)
      setLastUsedName(name)
      onOpenChange(false)
      navigate(`/online/${roomId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.online.errorGeneric
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()

    if (!canJoin) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const normalized = roomCode.trim().toUpperCase()
      const foundId = await convex.query(api.rooms.findRoomIdByCode, { code: normalized })

      if (!foundId) {
        setError(t.online.errorRoomNotFound)

        return
      }

      await joinRoom({ roomId: foundId, playerId, name })
      setLastUsedName(name)
      onOpenChange(false)
      navigate(`/online/${foundId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.online.errorGeneric
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-3xl">{t.online.title}</SheetTitle>
          <SheetDescription>{t.online.description}</SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="create" className="p-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="create">{t.online.createTab}</TabsTrigger>
            <TabsTrigger value="join">{t.online.joinTab}</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-name">{t.online.yourName}</Label>
                <Input
                  id="create-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.online.yourNamePlaceholder}
                />
              </div>

              {needsCode && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="create-access">{t.online.accessCode}</Label>
                  <Input
                    id="create-access"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder={t.online.accessCodePlaceholder}
                    autoCapitalize="characters"
                  />
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={!canCreate}>
                  {submitting ? t.online.creating : t.online.createRoom}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="join" className="mt-4">
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="join-code">{t.online.roomCode}</Label>
                <Input
                  id="join-code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder={t.online.roomCodePlaceholder}
                  autoCapitalize="characters"
                  className="font-munchkin text-2xl tabular-nums tracking-widest"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="join-name">{t.online.yourName}</Label>
                <Input
                  id="join-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.online.yourNamePlaceholder}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t.common.cancel}
                </Button>
                <Button type="submit" disabled={!canJoin}>
                  {submitting ? t.online.joining : t.online.joinRoom}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
