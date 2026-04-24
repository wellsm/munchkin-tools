import { useState } from 'react'
import type { FormEvent } from 'react'
import { useConvex } from 'convex/react'
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
import { useAccessStore } from '@/lib/access-store'
import { useT } from '@/lib/i18n/store'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnlineSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const convex = useConvex()
  const setCode = useAccessStore((s) => s.setCode)
  const [code, setLocalCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (submitting || code.trim().length === 0) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await convex.query(api.access.verifyAccessCode, {
        code,
      })

      if (!result.ok) {
        setError(t.online.errorInvalidAccessCode)

        return
      }

      setCode(code)
      onOpenChange(false)
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
          <SheetTitle className="font-munchkin text-3xl">
            {t.online.gateTitle}
          </SheetTitle>
          <SheetDescription>{t.online.gateDescription}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="access-code">{t.online.accessCode}</Label>
            <Input
              id="access-code"
              autoFocus
              value={code}
              onChange={(e) => setLocalCode(e.target.value)}
              placeholder={t.online.accessCodePlaceholder}
              autoCapitalize="characters"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || code.trim().length === 0}
            >
              {submitting ? t.online.verifying : t.online.verify}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
