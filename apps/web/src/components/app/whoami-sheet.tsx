import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { avatarColor, avatarInitial } from '@/lib/avatar-color'
import { useT } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhoAmISheet({ open, onOpenChange }: Props) {
  const t = useT()
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const setLastUsedName = usePlayerIdentityStore((s) => s.setLastUsedName)
  const resetIdentity = usePlayerIdentityStore((s) => s.resetIdentity)

  const [name, setName] = useState(lastUsedName ?? '')
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setName(lastUsedName ?? '')
      setJustSaved(false)
    }
  }, [open, lastUsedName])

  const trimmed = name.trim()
  const dirty = trimmed !== (lastUsedName ?? '')
  const canSave = dirty && trimmed.length > 0

  function handleSave() {
    if (!canSave) {
      return
    }

    setLastUsedName(trimmed)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  function handleReset() {
    resetIdentity()
    onOpenChange(false)
  }

  const displayName = lastUsedName ?? t.whoami.guest
  const color = avatarColor(playerId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-3xl">{t.whoami.title}</SheetTitle>
          <SheetDescription>{t.whoami.description}</SheetDescription>
        </SheetHeader>

        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-3">
            <div
              className="size-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color }}
              aria-hidden
            >
              <span className="font-munchkin text-4xl text-background leading-none">
                {avatarInitial(displayName)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="whoami-name">{t.whoami.name}</Label>
            <Input
              id="whoami-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.whoami.namePlaceholder}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">{t.whoami.playerId}</Label>
            <p className="text-xs font-mono text-muted-foreground break-all">{playerId}</p>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <RotateCcw className="size-4" /> {t.whoami.resetIdentity}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-munchkin text-2xl">
                    {t.whoami.resetIdentityTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.whoami.resetIdentityDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    {t.whoami.resetConfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={handleSave} disabled={!canSave && !justSaved}>
              {justSaved ? t.whoami.saved : t.whoami.save}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
