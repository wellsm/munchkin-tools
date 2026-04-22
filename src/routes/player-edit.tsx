import {
  ArrowLeft,
  Check,
  Mars,
  Palette,
  Swords,
  Trash2,
  Venus,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chip } from "@/munchkin/components/chip";
import { GenderButton } from "@/munchkin/components/gender-button";
import { NameEditor } from "@/munchkin/components/name-editor";
import { StatCard } from "@/munchkin/components/stat-card";
import {
  CLASSES,
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  MIN_LEVEL,
  RACES,
} from "@/munchkin/constants";
import {
  AVATAR_COLORS,
  avatarColor,
  avatarInitial,
} from "@/munchkin/lib/avatar-color";
import { useMunchkinStore } from "@/munchkin/store";
import type {
  Gender,
  MunchkinClass,
  MunchkinRace,
  Player,
} from "@/munchkin/types";

type Draft = Omit<Player, "id">;

const EMPTY_DRAFT: Draft = {
  name: "New Hero",
  level: 1,
  gear: 0,
  gender: null,
  color: undefined,
  classes: [],
  races: [],
};

export function PlayerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const maxLevel = useMunchkinStore((s) => s.settings.maxLevel);
  const existingPlayer = useMunchkinStore((s) => {
    if (isNew) {
      return null;
    }

    return s.players.find((p) => p.id === id) ?? null;
  });
  const updatePlayer = useMunchkinStore((s) => s.updatePlayer);
  const removePlayer = useMunchkinStore((s) => s.removePlayer);
  const addPlayer = useMunchkinStore((s) => s.addPlayer);
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant);

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [pickerOpen, setPickerOpen] = useState(false);

  const source: Draft | null = isNew ? draft : existingPlayer;
  const avatarSeed = isNew
    ? draft.name.trim() || "new-hero"
    : (existingPlayer?.id ?? "new-hero");

  if (!source) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground">Hero not found.</p>
          <Button onClick={() => navigate("/")}>Back to party</Button>
        </div>
      </div>
    );
  }

  function commitField<K extends keyof Draft>(key: K, value: Draft[K]) {
    if (isNew) {
      setDraft((prev) => ({ ...prev, [key]: value }));

      return;
    }

    if (!existingPlayer) {
      return;
    }

    updatePlayer(existingPlayer.id, { [key]: value });
  }

  function handleRemove() {
    if (!existingPlayer) {
      return;
    }

    removePlayer(existingPlayer.id);
    navigate("/");
  }

  function handleSave() {
    const trimmedName = draft.name.trim();

    if (trimmedName.length === 0) {
      return;
    }

    addPlayer({ ...draft, name: trimmedName });
    navigate("/");
  }

  function handleEnterCombat() {
    if (!existingPlayer) {
      return;
    }

    setMainCombatant(existingPlayer.id);
    navigate("/?tab=combat");
  }

  function handleGender(next: Gender) {
    const nextGender = source!.gender === next ? null : next;
    commitField("gender", nextGender);
  }

  function handleLevelChange(delta: number) {
    const next = Math.max(MIN_LEVEL, Math.min(maxLevel, source!.level + delta));
    commitField("level", next);
  }

  function handleGearChange(delta: number) {
    commitField("gear", source!.gear + delta);
  }

  function toggleRace(race: MunchkinRace) {
    const current = source!.races;

    if (current.includes(race)) {
      commitField(
        "races",
        current.filter((r) => r !== race),
      );

      return;
    }

    if (current.length >= MAX_RACES_PER_PLAYER) {
      return;
    }

    commitField("races", [...current, race]);
  }

  function toggleClass(klass: MunchkinClass) {
    const current = source!.classes;

    if (current.includes(klass)) {
      commitField(
        "classes",
        current.filter((c) => c !== klass),
      );

      return;
    }

    if (current.length >= MAX_CLASSES_PER_PLAYER) {
      return;
    }

    commitField("classes", [...current, klass]);
  }

  const strength = source.level + source.gear;
  const canSave = draft.name.trim().length > 0;

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-md mx-auto w-full p-4 pb-8 flex flex-col">
        <header className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="size-6" />
          </Button>
          {isNew ? (
            <div className="size-11" aria-hidden />
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Remove hero">
                  <Trash2 className="size-6" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Remove {existingPlayer?.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove}>
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </header>

        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <div
              className="size-28 rounded-full flex items-center justify-center"
              style={{ backgroundColor: source.color ?? avatarColor(avatarSeed) }}
              aria-hidden
            >
              <span className="font-munchkin text-6xl text-background leading-none">
                {avatarInitial(source.name)}
              </span>
            </div>
            <button
              type="button"
              aria-label="Choose avatar color"
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((v) => !v)}
              className="absolute -bottom-1 -right-1 size-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground hover:bg-accent transition-colors"
            >
              <Palette className="size-4" />
            </button>
          </div>

          {pickerOpen && (
            <div className="mt-4 p-3 rounded-xl border border-border bg-card/70 flex items-center gap-2 flex-wrap justify-center">
              {AVATAR_COLORS.map((c) => {
                const selected = source.color === c;

                return (
                  <button
                    key={c}
                    type="button"
                    aria-label="Pick color"
                    aria-pressed={selected}
                    onClick={() => {
                      commitField("color", c);
                      setPickerOpen(false);
                    }}
                    className={cn(
                      "size-10 rounded-full transition-all",
                      selected &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
              <button
                type="button"
                aria-label="Reset to default color"
                aria-pressed={source.color === undefined}
                onClick={() => {
                  commitField("color", undefined);
                  setPickerOpen(false);
                }}
                className={cn(
                  "size-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors",
                  source.color === undefined &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <NameEditor
            name={source.name}
            onRename={(name) => commitField("name", name)}
          />

          <div className="flex items-center gap-3 mt-6">
            <GenderButton
              active={source.gender === "male"}
              gender={source.gender}
              label="Male"
              onClick={() => handleGender("male")}
            >
              <Mars className={cn("size-8", source.gender === "male" ? "text-background" : "text-foreground")} />
            </GenderButton>
            <GenderButton
              active={source.gender === "female"}
              gender={source.gender}
              label="Female"
              onClick={() => handleGender("female")}
            >
              <Venus className={cn("size-8", source.gender === "female" ? "text-background" : "text-foreground")} />
            </GenderButton>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-3 mt-8">
          <StatCard
            label="LEVEL"
            value={source.level}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={source.level <= MIN_LEVEL}
            upDisabled={source.level >= maxLevel}
          />
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-muted-foreground mt-4">
              Strength
            </span>
            <span className="font-munchkin text-8xl text-primary tabular-nums leading-none mt-3">
              {strength}
            </span>
          </div>
          <StatCard
            label="GEAR"
            value={source.gear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Race {source.races.length}/{MAX_RACES_PER_PLAYER}
          </span>
          <div className="flex flex-wrap gap-2">
            {RACES.map((r) => {
              const Icon = r.icon;
              const active = source.races.includes(r.id);

              return (
                <Chip
                  key={r.id}
                  active={active}
                  onClick={() => toggleRace(r.id)}
                >
                  <Icon className="size-4" aria-hidden />
                  {r.label}
                </Chip>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            Class {source.classes.length}/{MAX_CLASSES_PER_PLAYER}
          </span>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => {
              const Icon = c.icon;
              const active = source.classes.includes(c.id);

              return (
                <Chip
                  key={c.id}
                  active={active}
                  onClick={() => toggleClass(c.id)}
                >
                  <Icon className="size-4" aria-hidden />
                  {c.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {isNew ? (
          <Button
            size="lg"
            className="w-full mt-8"
            onClick={handleSave}
            disabled={!canSave}
          >
            <Check className="size-5" /> Save
          </Button>
        ) : (
          <Button size="lg" className="w-full mt-8" onClick={handleEnterCombat}>
            <Swords className="size-5" /> Enter combat
          </Button>
        )}
      </div>
    </div>
  );
}
