import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, QrCode, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/store'
import { OnlineSheet } from '@/components/app/online-sheet'
import { QrScanSheet } from '@/components/app/qr-scan-sheet'
import { WhoAmISheet } from '@/components/app/whoami-sheet'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { avatarColor, avatarInitial } from '@/lib/avatar-color'

export function Landing() {
  const t = useT()
  const navigate = useNavigate()
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const [onlineOpen, setOnlineOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [whoamiOpen, setWhoamiOpen] = useState(false)

  const displayName = lastUsedName ?? t.whoami.guest
  const color = avatarColor(playerId)

  return (
    <div className="min-h-dvh bg-background text-foreground relative flex flex-col items-center justify-center px-6 gap-12">
      <button
        type="button"
        onClick={() => setWhoamiOpen(true)}
        aria-label={t.whoami.trigger}
        className="absolute top-4 right-4 flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-2 py-1 pr-3 hover:bg-accent transition-colors max-w-[60%]"
      >
        <span
          className="size-7 shrink-0 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color }}
          aria-hidden
        >
          <span className="font-munchkin text-sm text-background leading-none">
            {avatarInitial(displayName)}
          </span>
        </span>
        <span className="text-sm font-munchkin truncate">{displayName}</span>
      </button>

      <h1 className="text-6xl font-munchkin text-primary text-center">
        {t.landing.title}
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => navigate('/offline')}>
          <User className="size-6" />
          {t.landing.offline}
        </Button>
        <Button size="lg" className="h-16 text-lg" onClick={() => setOnlineOpen(true)}>
          <Globe className="size-6" />
          {t.landing.online}
        </Button>
        <Button size="lg" variant="outline" className="h-16 text-lg" onClick={() => setScanOpen(true)}>
          <QrCode className="size-6" />
          {t.landing.scanQr}
        </Button>
      </div>

      <OnlineSheet open={onlineOpen} onOpenChange={setOnlineOpen} />
      <QrScanSheet open={scanOpen} onOpenChange={setScanOpen} />
      <WhoAmISheet open={whoamiOpen} onOpenChange={setWhoamiOpen} />
    </div>
  )
}
