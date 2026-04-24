import { useState } from 'react'
import type { FormEvent } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuggestionSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const submit = useMutation(api.suggestions.submit)
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)

  const [name, setName] = useState(lastUsedName ?? '')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const canSubmit = !submitting && !sent && message.trim().length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!canSubmit) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await submit({
        name: name.trim() || undefined,
        contact: contact.trim() || undefined,
        message,
        playerId,
      })

      setSent(true)

      window.setTimeout(() => {
        setName(lastUsedName ?? '')
        setContact('')
        setMessage('')
        setSent(false)
        onOpenChange(false)
      }, 1500)
    } catch (err) {
      const messageText =
        err instanceof Error ? err.message : t.suggestions.errorGeneric

      setError(messageText)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-auto">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-3xl">
            {t.suggestions.title}
          </SheetTitle>
          <SheetDescription>{t.suggestions.description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="suggestion-message">{t.suggestions.message}</Label>
            <Textarea
              id="suggestion-message"
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.suggestions.messagePlaceholder}
              maxLength={2000}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="suggestion-name">{t.suggestions.name}</Label>
            <Input
              id="suggestion-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.suggestions.namePlaceholder}
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="suggestion-contact">{t.suggestions.contact}</Label>
            <Input
              id="suggestion-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t.suggestions.contactPlaceholder}
              maxLength={200}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {sent && (
            <p className="text-sm text-primary">{t.suggestions.sent}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? t.suggestions.submitting : t.suggestions.submit}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
