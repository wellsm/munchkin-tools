import { Coffee, MessageSquare, Moon, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/app/header";
import { SectionLabel } from "@/components/app/section-label";
import { StepperCard } from "@/components/app/stepper-card";
import { SuggestionSheet } from "@/components/app/suggestion-sheet";
import { SUPPORT_URL } from "@/lib/support";
import { useSuggestionsVisible } from "@/lib/use-suggestions-visible";
import { useSupportVisible } from "@/lib/use-support-visible";
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
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MIN_MAX_PLAYERS, PRODUCT_MAX_PLAYERS } from "@/lib/constants";
import { useI18nStore, useT, type Locale } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { isWakeLockSupported, useWakeLockStore } from "@/lib/wake-lock";

export function SettingsTab() {
  const t = useT();
  const navigate = useNavigate();
  const players = useMunchkinStore((s) => s.players);
  const settings = useMunchkinStore((s) => s.settings);
  const setMaxPlayers = useMunchkinStore((s) => s.setMaxPlayers);
  const setMaxLevel = useMunchkinStore((s) => s.setMaxLevel);
  const resetAllPlayers = useMunchkinStore((s) => s.resetAllPlayers);
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const wakeLockEnabled = useWakeLockStore((s) => s.enabled);
  const setWakeLockEnabled = useWakeLockStore((s) => s.setEnabled);
  const wakeLockSupported = isWakeLockSupported();
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const supportVisible = useSupportVisible();
  const suggestionsVisible = useSuggestionsVisible();
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  const decreaseMaxPlayersDisabled =
    settings.maxPlayers <= Math.max(MIN_MAX_PLAYERS, players.length);
  const increaseMaxPlayersDisabled = settings.maxPlayers >= PRODUCT_MAX_PLAYERS;

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={t.settings.title} onHome={() => navigate("/")} />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-8 max-w-md mx-auto w-full flex flex-col gap-4">
        <div>
          <SectionLabel>{t.settings.party}</SectionLabel>
          <div className="flex flex-col gap-3 mb-6">
            <StepperCard
              label={t.settings.maxHeroes}
              value={settings.maxPlayers}
              onChange={setMaxPlayers}
              decreaseDisabled={decreaseMaxPlayersDisabled}
              increaseDisabled={increaseMaxPlayersDisabled}
              hint={t.settings.maxHeroesHint(players.length)}
            />
            <StepperCard
              label={t.settings.maxLevel}
              value={settings.maxLevel}
              onChange={setMaxLevel}
              decreaseDisabled={settings.maxLevel <= 1}
              increaseDisabled={settings.maxLevel >= 99}
              hint={t.settings.maxLevelHint}
            />
          </div>
        </div>

        <div>
          <SectionLabel>{t.settings.preferences}</SectionLabel>
          <div className="mb-6 flex flex-col gap-3">
            <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
                  {t.settings.language}
                </span>
                <Select
                  value={locale}
                  onValueChange={(v) => setLocale(v as Locale)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      {t.settings.languageEnglish}
                    </SelectItem>
                    <SelectItem value="pt">
                      {t.settings.languagePortuguese}
                    </SelectItem>
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
                {theme === "dark" ? (
                  <Moon className="size-5" />
                ) : (
                  <Sun className="size-5" />
                )}
                <span className="font-munchkin text-xl">
                  {theme === "dark"
                    ? t.settings.themeDark
                    : t.settings.themeLight}
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
                <Trash2 className="size-5" />
                <span className="font-munchkin text-lg">
                  {t.settings.removeAllHeroes}
                </span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-munchkin text-2xl">
                  {t.settings.confirmRemoveAllTitle}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t.settings.confirmRemoveAllDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllPlayers}>
                  {t.settings.removeAll}
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
  );
}
