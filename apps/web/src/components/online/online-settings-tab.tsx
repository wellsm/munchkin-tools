import { useState } from 'react'
import { Coffee, DoorOpen, MessageSquare, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Doc, Id } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { Header } from '@/components/app/header'
import { SectionLabel } from '@/components/app/section-label'
import { StepperCard } from '@/components/app/stepper-card'
import { SuggestionSheet } from '@/components/app/suggestion-sheet'
import { SUPPORT_URL } from '@/lib/support'
import { useSuggestionsVisible } from '@/lib/use-suggestions-visible'
import { useSupportVisible } from '@/lib/use-support-visible'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { NotificationButton } from '@/components/online/notification-button'
import { useI18nStore, useT, type Locale } from '@/lib/i18n/store'
import { applyTheme, getStoredTheme, type Theme } from '@/lib/theme'
import { isWakeLockSupported, useWakeLockStore } from '@/lib/wake-lock'
import { usePlayerIdentityStore } from '@/lib/player-identity'
import { useRecentRoomsStore } from '@/lib/recent-rooms-store'

type Room = Doc<'rooms'>

const MIN_MAX_PLAYERS = 3
const PRODUCT_MAX_PLAYERS = 8
const MIN_LEVEL = 1
const MAX_LEVEL_CEILING = 99

type Props = {
  room: Room
}

export function OnlineSettingsTab({ room }: Props) {
  const t = useT()
  const navigate = useNavigate()
  const playerId = usePlayerIdentityStore((s) => s.playerId)
  const forgetRoom = useRecentRoomsStore((s) => s.forget)
  const setMaxPlayers = useMutation(api.rooms.setMaxPlayers)
  const setMaxLevel = useMutation(api.rooms.setMaxLevel)
  const setSpectator = useMutation(api.rooms.setSpectator)
  const leaveRoom = useMutation(api.rooms.leaveRoom)
  const locale = useI18nStore((s) => s.locale)
  const setLocale = useI18nStore((s) => s.setLocale)
  const wakeLockEnabled = useWakeLockStore((s) => s.enabled)
  const setWakeLockEnabled = useWakeLockStore((s) => s.setEnabled)
  const wakeLockSupported = isWakeLockSupported()
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())
  const supportVisible = useSupportVisible()
  const suggestionsVisible = useSuggestionsVisible()
  const [suggestionOpen, setSuggestionOpen] = useState(false)

  const myPlayer = room.players.find((p) => p.playerId === playerId)
  const isHost = myPlayer?.isHost ?? false
  const playerCount = room.players.length
  const roomId = room._id as Id<'rooms'>

  const decreaseMaxPlayersDisabled =
    room.maxPlayers <= Math.max(MIN_MAX_PLAYERS, playerCount)
  const increaseMaxPlayersDisabled = room.maxPlayers >= PRODUCT_MAX_PLAYERS

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  async function handleLeave() {
    await leaveRoom({ roomId, playerId })
    forgetRoom(roomId)
    navigate('/')
  }

  return (
    <div className="h-full flex flex-col">
      <Header
        title={t.settings.title}
        onHome={() => navigate('/')}
        right={<NotificationButton room={room} />}
      />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-8 max-w-md mx-auto w-full flex flex-col gap-4">
        {isHost && (
          <div>
            <SectionLabel>{t.settings.party}</SectionLabel>
            <div className="flex flex-col gap-3 mb-2">
              <StepperCard
                label={t.settings.maxHeroes}
                value={room.maxPlayers}
                onChange={(v) =>
                  setMaxPlayers({ roomId, requesterId: playerId, value: v })
                }
                decreaseDisabled={decreaseMaxPlayersDisabled}
                increaseDisabled={increaseMaxPlayersDisabled}
                hint={t.settings.maxHeroesHint(playerCount)}
              />
              <StepperCard
                label={t.settings.maxLevel}
                value={room.maxLevel}
                onChange={(v) =>
                  setMaxLevel({ roomId, requesterId: playerId, value: v })
                }
                decreaseDisabled={room.maxLevel <= MIN_LEVEL}
                increaseDisabled={room.maxLevel >= MAX_LEVEL_CEILING}
                hint={t.settings.maxLevelHint}
              />
            </div>
          </div>
        )}

        {isHost && (
          <div>
            <SectionLabel>{t.spectators.section}</SectionLabel>
            <div className="flex flex-col gap-2 mb-2">
              <p className="text-xs text-muted-foreground px-1">
                {t.spectators.description}
              </p>
              <ul className="flex flex-col gap-2">
                {room.players.map((p) => {
                  const isSpec = p.isSpectator ?? false

                  return (
                    <li
                      key={p.playerId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/50 px-4 py-3"
                    >
                      <span className="font-munchkin text-lg truncate">
                        {p.name}
                      </span>
                      <Switch
                        checked={isSpec}
                        onCheckedChange={(value) =>
                          setSpectator({
                            roomId,
                            requesterId: playerId,
                            targetId: p.playerId,
                            value,
                          })
                        }
                        aria-label={t.spectators.toggleAria(p.name)}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}

        <div>
          <SectionLabel>{t.settings.preferences}</SectionLabel>
          <div className="flex flex-col gap-3 mb-2">
            <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
                  {t.settings.language}
                </span>
                <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t.settings.languageEnglish}</SelectItem>
                    <SelectItem value="pt">{t.settings.languagePortuguese}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-accent transition-colors"
            >
              <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
                {t.settings.theme}
              </span>
              <span className="flex items-center gap-2 text-foreground">
                {theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />}
                <span className="font-munchkin text-xl">
                  {theme === 'dark' ? t.settings.themeDark : t.settings.themeLight}
                </span>
              </span>
            </button>

            <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
                  {t.settings.keepAwake}
                </span>
                <Switch
                  checked={wakeLockEnabled && wakeLockSupported}
                  onCheckedChange={setWakeLockEnabled}
                  disabled={!wakeLockSupported}
                  aria-label={t.settings.keepAwake}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {wakeLockSupported
                  ? t.settings.keepAwakeHint
                  : t.settings.keepAwakeUnsupported}
              </span>
            </section>
          </div>
        </div>

        {(supportVisible || suggestionsVisible) && (
          <div>
            <SectionLabel>{t.support.section}</SectionLabel>
            <div className="flex flex-col gap-3">
              {supportVisible && (
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-accent transition-colors"
                >
                  <Coffee className="size-5" />
                  <div className="flex-1 flex flex-col items-start">
                    <span className="font-munchkin text-lg">
                      {t.support.cta}
                    </span>
                    <span className="text-xs text-muted-foreground text-left">
                      {suggestionsVisible
                        ? t.support.description
                        : t.support.descriptionNoSuggestions}
                    </span>
                  </div>
                </a>
              )}
              {suggestionsVisible && (
                <button
                  type="button"
                  onClick={() => setSuggestionOpen(true)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-accent transition-colors text-left"
                >
                  <MessageSquare className="size-5" />
                  <div className="flex-1 flex flex-col items-start">
                    <span className="font-munchkin text-lg">
                      {t.suggestions.trigger}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.suggestions.triggerDescription}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <SectionLabel variant="danger">{t.settings.dangerZone}</SectionLabel>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 hover:bg-destructive/10 transition-colors text-destructive"
              >
                <DoorOpen className="size-5" />
                <span className="font-munchkin text-lg">
                  {t.waitingRoom.leaveRoom}
                </span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-munchkin text-2xl">
                  {t.waitingRoom.leaveRoomTitle}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isHost
                    ? t.waitingRoom.leaveRoomHostDescription
                    : t.waitingRoom.leaveRoomDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeave}>
                  {t.waitingRoom.leaveRoom}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <SuggestionSheet
        open={suggestionOpen}
        onOpenChange={setSuggestionOpen}
      />
    </div>
  )
}
