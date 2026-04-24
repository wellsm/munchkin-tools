import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Globe, Loader2, LogIn, MessageSquare, Plus, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateRoomSheet } from '@/components/app/create-room-sheet'
import { JoinRoomSheet } from '@/components/app/join-room-sheet'
import { OnlineSheet } from '@/components/app/online-sheet'
import { QrScanSheet } from '@/components/app/qr-scan-sheet'
import { SuggestionSheet } from '@/components/app/suggestion-sheet'
import { WhoAmISheet } from '@/components/app/whoami-sheet'
import { avatarColor, avatarInitial } from '@/lib/avatar-color'
import { useI18nStore, useT, type Locale } from '@/lib/i18n/store'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { useOnlineAccess } from '@/lib/use-online-access'
import { useSuggestionsVisible } from '@/lib/use-suggestions-visible'
import { useSupportVisible } from '@/lib/use-support-visible'
import { SUPPORT_URL } from '@/lib/support'
import { cn } from '@/lib/utils'

const LOCALE_OPTIONS: { locale: Locale; flag: string; label: string }[] = [
  { locale: 'en', flag: '🇺🇸', label: 'English' },
  { locale: 'pt', flag: '🇧🇷', label: 'Português' },
]

export function Landing() {
  const t = useT()
  const navigate = useNavigate()
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const lastUsedName = usePlayerIdentityStore((s) => s.lastUsedName)
  const { loading, unlocked } = useOnlineAccess()
  const supportVisible = useSupportVisible()
  const suggestionsVisible = useSuggestionsVisible()
  const locale = useI18nStore((s) => s.locale)
  const setLocale = useI18nStore((s) => s.setLocale)

  const [gateOpen, setGateOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [whoamiOpen, setWhoamiOpen] = useState(false)
  const [suggestionOpen, setSuggestionOpen] = useState(false)

  const displayName = lastUsedName ?? t.whoami.guest
  const color = avatarColor(playerId)

  return (
    <div className="min-h-dvh bg-background text-foreground relative flex flex-col items-center justify-center px-6 gap-10">
      <div
        className="absolute top-4 left-4 flex rounded-full border border-border/60 bg-card/50 overflow-hidden"
        role="group"
        aria-label="Language"
      >
        {LOCALE_OPTIONS.map((opt) => (
          <button
            key={opt.locale}
            type="button"
            onClick={() => setLocale(opt.locale)}
            aria-label={opt.label}
            aria-pressed={locale === opt.locale}
            className={cn(
              'px-3 py-1 text-lg leading-none transition-colors',
              locale === opt.locale ? 'bg-accent' : 'hover:bg-accent/50',
            )}
          >
            {opt.flag}
          </button>
        ))}
      </div>

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

      <div className="flex flex-col gap-6 w-full max-w-xs">
        <fieldset className="rounded-xl border border-border/60 bg-card/30 px-4 py-3 flex flex-col gap-3">
          <legend className="font-munchkin text-sm tracking-wider uppercase text-muted-foreground px-2">
            {t.landing.localSection}
          </legend>
          <Button
            size="lg"
            variant="outline"
            className="h-14 text-base"
            onClick={() => navigate('/offline')}
          >
            <Plus className="size-5" />
            {t.landing.createMatch}
          </Button>
        </fieldset>

        <fieldset className="rounded-xl border border-border/60 bg-card/30 px-4 py-3 flex flex-col gap-3">
          <legend className="font-munchkin text-sm tracking-wider uppercase text-muted-foreground px-2">
            {t.landing.onlineSection}
          </legend>

          {unlocked ? (
            <>
              <Button
                size="lg"
                className="h-14 text-base"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="size-5" />
                {t.online.createRoom}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base"
                onClick={() => setJoinOpen(true)}
              >
                <LogIn className="size-5" />
                {t.online.joinRoom}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base"
                onClick={() => setScanOpen(true)}
              >
                <QrCode className="size-5" />
                {t.landing.scanQr}
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="h-14 text-base"
              onClick={() => setGateOpen(true)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Globe className="size-5" />
              )}
              {t.landing.online}
            </Button>
          )}
        </fieldset>
      </div>

      {(supportVisible || suggestionsVisible) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {supportVisible && (
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              <Coffee className="size-4" />
              {t.support.cta}
            </a>
          )}
          {suggestionsVisible && (
            <button
              type="button"
              onClick={() => setSuggestionOpen(true)}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              <MessageSquare className="size-4" />
              {t.suggestions.trigger}
            </button>
          )}
        </div>
      )}

      <OnlineSheet open={gateOpen} onOpenChange={setGateOpen} />
      <CreateRoomSheet open={createOpen} onOpenChange={setCreateOpen} />
      <JoinRoomSheet open={joinOpen} onOpenChange={setJoinOpen} />
      <QrScanSheet open={scanOpen} onOpenChange={setScanOpen} />
      <SuggestionSheet open={suggestionOpen} onOpenChange={setSuggestionOpen} />
      <WhoAmISheet open={whoamiOpen} onOpenChange={setWhoamiOpen} />
    </div>
  )
}
