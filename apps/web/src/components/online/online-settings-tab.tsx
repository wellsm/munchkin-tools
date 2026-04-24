import { useState } from 'react'
import { DoorOpen, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'convex/react'
import { api } from '@munchkin-tools/convex/convex/_generated/api'
import type { Doc, Id } from '@munchkin-tools/convex/convex/_generated/dataModel'
import { Header } from '@/components/app/header'
import { SectionLabel } from '@/components/app/section-label'
import { StepperCard } from '@/components/app/stepper-card'
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
  const setMaxPlayers = useMutation(api.rooms.setMaxPlayers)
  const setMaxLevel = useMutation(api.rooms.setMaxLevel)
  const leaveRoom = useMutation(api.rooms.leaveRoom)
  const locale = useI18nStore((s) => s.locale)
  const setLocale = useI18nStore((s) => s.setLocale)
  const wakeLockEnabled = useWakeLockStore((s) => s.enabled)
  const setWakeLockEnabled = useWakeLockStore((s) => s.setEnabled)
  const wakeLockSupported = isWakeLockSupported()
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme())

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
    navigate('/')
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={t.settings.title} right={<NotificationButton room={room} />} />
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
    </div>
  )
}
