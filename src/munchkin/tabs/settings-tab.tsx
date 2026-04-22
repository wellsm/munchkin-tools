import { Moon, Sun, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { Header } from "../components/header";
import { SectionLabel } from "../components/section-label";
import { StepperCard } from "../components/stepper-card";
import { MIN_MAX_PLAYERS, PRODUCT_MAX_PLAYERS } from "../constants";
import { useMunchkinStore } from "../store";

export function SettingsTab() {
  const players = useMunchkinStore((s) => s.players);
  const settings = useMunchkinStore((s) => s.settings);
  const setMaxPlayers = useMunchkinStore((s) => s.setMaxPlayers);
  const setMaxLevel = useMunchkinStore((s) => s.setMaxLevel);
  const resetAllPlayers = useMunchkinStore((s) => s.resetAllPlayers);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  const decreaseMaxPlayersDisabled =
    settings.maxPlayers <= Math.max(MIN_MAX_PLAYERS, players.length);
  const increaseMaxPlayersDisabled = settings.maxPlayers >= PRODUCT_MAX_PLAYERS;

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <div>
      <Header title="Settings" />
      <div className="h-full overflow-auto p-4 pb-8 max-w-md mx-auto w-full flex flex-col gap-4">
        <div>
          <SectionLabel>Party</SectionLabel>
          <div className="flex flex-col gap-3 mb-6">
            <StepperCard
              label="Max Heroes"
              value={settings.maxPlayers}
              onChange={setMaxPlayers}
              decreaseDisabled={decreaseMaxPlayersDisabled}
              increaseDisabled={increaseMaxPlayersDisabled}
              hint={`Cannot be lower than current hero count (${players.length}).`}
            />
            <StepperCard
              label="Max Level"
              value={settings.maxLevel}
              onChange={setMaxLevel}
              decreaseDisabled={settings.maxLevel <= 1}
              increaseDisabled={settings.maxLevel >= 99}
              hint="Heroes above this level will be demoted."
            />
          </div>
        </div>

        <div>
          <SectionLabel>Appearance</SectionLabel>
          <div className="mb-6">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-accent transition-colors"
            >
              <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin">
                Theme
              </span>
              <span className="flex items-center gap-2 text-foreground">
                {theme === "dark" ? (
                  <Moon className="size-5" />
                ) : (
                  <Sun className="size-5" />
                )}
                <span className="font-munchkin text-xl">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </span>
            </button>
          </div>
        </div>

        <div>
          <SectionLabel variant="danger">Danger Zone</SectionLabel>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 hover:bg-destructive/10 transition-colors text-destructive"
              >
                <Trash2 className="size-5" />
                <span className="font-munchkin text-lg">Remove all heroes</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-munchkin text-2xl">
                  Remove all heroes?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This removes all heroes and resets combat. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllPlayers}>
                  Remove all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
