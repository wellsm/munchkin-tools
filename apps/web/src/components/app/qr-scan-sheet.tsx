import { lazy, Suspense, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useT } from '@/lib/i18n/store'

// Lazy-load the scanner module: it bundles zxing (~200kb) and only runs while
// the sheet is open. Landing page stays fast.
const Scanner = lazy(() =>
  import('@yudiel/react-qr-scanner').then((m) => ({ default: m.Scanner })),
)

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QrScanSheet({ open, onOpenChange }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [handled, setHandled] = useState(false)

  function handleScan(value: string) {
    if (handled) {
      return
    }

    try {
      const url = new URL(value, window.location.origin)

      if (!url.pathname.startsWith('/online/')) {
        setError(t.scanQr.invalidCode)

        return
      }

      setHandled(true)
      onOpenChange(false)
      navigate(url.pathname + url.search)
    } catch {
      setError(t.scanQr.invalidCode)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null)
      setHandled(false)
    }

    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh]">
        <SheetHeader>
          <SheetTitle className="font-munchkin text-3xl">{t.scanQr.title}</SheetTitle>
          <SheetDescription>{t.scanQr.description}</SheetDescription>
        </SheetHeader>

        <div className="p-4 flex flex-col gap-4">
          <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-border/60 bg-card/50">
            {open && (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {t.waitingRoom.loading}
                  </div>
                }
              >
                <Scanner
                  onScan={(results) => {
                    const value = results[0]?.rawValue

                    if (value) {
                      handleScan(value)
                    }
                  }}
                  onError={() => setError(t.scanQr.cameraError)}
                  components={{ finder: true }}
                  allowMultiple={false}
                />
              </Suspense>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t.common.cancel}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
