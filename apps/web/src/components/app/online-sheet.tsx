import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
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
import { useT } from '@/lib/i18n/store'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnlineSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const createRoom = useMutation(api.rooms.createRoom)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = name.trim().length > 0 && code.trim().length > 0 && !submitting

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const roomId = await createRoom({ hostName: name, accessCode: code })
      onOpenChange(false)
      navigate(`/online/${roomId}`)
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

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="online-name">{t.online.yourName}</Label>
            <Input
              id="online-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.online.yourNamePlaceholder}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="online-code">{t.online.accessCode}</Label>
            <Input
              id="online-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.online.accessCodePlaceholder}
              autoCapitalize="characters"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? t.online.creating : t.online.createRoom}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
