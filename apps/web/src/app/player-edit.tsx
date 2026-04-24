import {
  Check,
  Mars,
  Palette,
  Swords,
  Trash2,
  Venus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chip } from "@/components/app/chip";
import { GenderButton } from "@/components/app/gender-button";
import { Header } from "@/components/app/header";
import { NameEditor } from "@/components/app/name-editor";
import { RaceClassPickerSheet } from "@/components/app/race-class-picker-sheet";
import { SelectionDisplay } from "@/components/app/selection-display";
import { StatCard } from "@/components/app/stat-card";
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
import { AVATAR_COLORS, avatarInitial } from "@/lib/avatar-color";
import {
  CLASSES,
  DEFAULT_RACE,
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  MIN_LEVEL,
  SELECTABLE_RACES,
  classById,
  raceById,
} from "@/lib/constants";
import { useT } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";
import type { Gender, MunchkinClass, MunchkinRace, Player } from "@/lib/types";
import { cn } from "@/lib/utils";

type Draft = Omit<Player, "id">;

const EMPTY_DRAFT: Draft = {
  name: "",
  level: 1,
  gear: 0,
  gender: "male",
  color: AVATAR_COLORS[0],
  classes: [],
  races: [],
};

export function PlayerEdit() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { settings, updatePlayer, removePlayer, addPlayer, setMainCombatant } =
    useMunchkinStore();

  const existingPlayer = useMunchkinStore((s) => {
    if (isNew) {
      return null;
    }

    return s.players.find((p) => p.id === id) ?? null;
  });

  const [draft, setDraft] = useState<Draft>(() => ({
    ...EMPTY_DRAFT,
    name: t.heroEdit.newHero,
  }));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [racePickerOpen, setRacePickerOpen] = useState(false);
  const [classPickerOpen, setClassPickerOpen] = useState(false);

  const source: Draft | null = isNew ? draft : existingPlayer;

  if (!source) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground">{t.heroEdit.heroNotFound}</p>
          <Button onClick={() => navigate("/offline")}>
            {t.heroEdit.backToParty}
          </Button>
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
    navigate("/offline");
  }

  function handleSave() {
    const trimmedName = draft.name.trim();

    if (trimmedName.length === 0) {
      return;
    }

    addPlayer({ ...draft, name: trimmedName });
    navigate("/offline");
  }

  function handleEnterCombat() {
    if (!existingPlayer) {
      return;
    }

    setMainCombatant(existingPlayer.id);
    navigate("/offline?tab=combat");
  }

  function handleGender(next: Gender) {
    const nextGender = source!.gender === next ? null : next;
    commitField("gender", nextGender);
  }

  function handleLevelChange(delta: number) {
    const next = Math.max(
      MIN_LEVEL,
      Math.min(settings.maxLevel, source!.level + delta),
    );
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
      <Header title={isNew ? t.heroEdit.newHero : t.heroEdit.editHero} onBack={() => navigate("/offline")} right={isNew ? (
        <div className="size-11" aria-hidden />
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.heroEdit.removeHeroAria}
            >
              <Trash2 className="size-6" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t.heroEdit.confirmRemoveTitle(existingPlayer?.name ?? "")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.heroEdit.confirmRemoveDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove}>
                {t.common.remove}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )} />
      <div className="max-w-md mx-auto w-full px-4 pb-8 flex flex-col">
        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <div
              className="size-28 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: source.color,
              }}
              aria-hidden
            >
              <span className="font-munchkin text-6xl text-background leading-none">
                {avatarInitial(source.name)}
              </span>
            </div>
            <button
              type="button"
              aria-label={t.heroEdit.chooseAvatarColor}
              aria-expanded={pickerOpen}
              onClick={() => setPickerOpen((v) => !v)}
              className="absolute -bottom-1 -right-1 size-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground hover:bg-accent transition-colors"
            >
              <Palette className="size-4" />
            </button>
          </div>

          {pickerOpen && (
            <div className="mt-4 px-2 py-4 rounded-xl border border-border bg-card/70 flex items-center gap-2 flex-wrap justify-center">
              {AVATAR_COLORS.map((c) => {
                const selected = source.color === c;

                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={t.heroEdit.pickColor}
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
              label={t.heroEdit.male}
              onClick={() => handleGender("male")}
            >
              <Mars
                className={cn(
                  "size-8",
                  source.gender === "male"
                    ? "text-background"
                    : "text-foreground",
                )}
              />
            </GenderButton>
            <GenderButton
              active={source.gender === "female"}
              gender={source.gender}
              label={t.heroEdit.female}
              onClick={() => handleGender("female")}
            >
              <Venus
                className={cn(
                  "size-8",
                  source.gender === "female"
                    ? "text-background"
                    : "text-foreground",
                )}
              />
            </GenderButton>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-3 mt-8">
          <StatCard
            label={t.heroEdit.level}
            value={source.level}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={source.level <= MIN_LEVEL}
            upDisabled={source.level >= settings.maxLevel}
          />
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-muted-foreground mt-4">
              {t.heroEdit.strength}
            </span>
            <span className="font-munchkin text-8xl text-primary tabular-nums leading-none mt-3">
              {strength}
            </span>
          </div>
          <StatCard
            label={t.heroEdit.gear}
            value={source.gear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
          />
        </div>

        <SelectionDisplay
          label={t.heroEdit.raceSlots(source.races.length, MAX_RACES_PER_PLAYER)}
          onEdit={() => setRacePickerOpen(true)}
          empty={source.races.length === 0}
          emptyChip={
            <Chip active color={DEFAULT_RACE.color}>
              <DEFAULT_RACE.icon className="size-4" aria-hidden />
              {t.heroEdit.races.human}
            </Chip>
          }
          chips={source.races.map((id) => {
            const entry = raceById(id);

            return (
              <Chip key={id} active color={entry.color}>
                <entry.icon className="size-4" aria-hidden />
                {t.heroEdit.races[id]}
              </Chip>
            );
          })}
          className="mt-6"
        />

        <SelectionDisplay
          label={t.heroEdit.classSlots(source.classes.length, MAX_CLASSES_PER_PLAYER)}
          onEdit={() => setClassPickerOpen(true)}
          empty={source.classes.length === 0}
          chips={source.classes.map((id) => {
            const entry = classById(id);

            return (
              <Chip key={id} active color={entry.color}>
                <entry.icon className="size-4" aria-hidden />
                {t.heroEdit.classes[id]}
              </Chip>
            );
          })}
          className="mt-4"
        />

        <RaceClassPickerSheet
          open={racePickerOpen}
          onOpenChange={setRacePickerOpen}
          title={t.heroEdit.raceSlots(source.races.length, MAX_RACES_PER_PLAYER)}
          items={SELECTABLE_RACES.map((r) => ({
            id: r.id,
            label: t.heroEdit.races[r.id],
            icon: r.icon,
            color: r.color,
          }))}
          selected={source.races}
          max={MAX_RACES_PER_PLAYER}
          onToggle={toggleRace}
        />

        <RaceClassPickerSheet
          open={classPickerOpen}
          onOpenChange={setClassPickerOpen}
          title={t.heroEdit.classSlots(source.classes.length, MAX_CLASSES_PER_PLAYER)}
          items={CLASSES.map((c) => ({
            id: c.id,
            label: t.heroEdit.classes[c.id],
            icon: c.icon,
            color: c.color,
          }))}
          selected={source.classes}
          max={MAX_CLASSES_PER_PLAYER}
          onToggle={toggleClass}
        />

        {isNew ? (
          <Button
            size="lg"
            className="w-full mt-8"
            onClick={handleSave}
            disabled={!canSave}
          >
            <Check className="size-5" /> {t.heroEdit.save}
          </Button>
        ) : (
          <Button size="lg" className="w-full mt-8" onClick={handleEnterCombat}>
            <Swords className="size-5" /> {t.heroEdit.enterCombat}
          </Button>
        )}
      </div>
    </div>
  );
}
