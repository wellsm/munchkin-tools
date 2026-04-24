import {
  Mars,
  Palette,
  Swords,
  Trash2,
  Venus,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "@munchkin-tools/convex/convex/_generated/api";
import type { Id } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Chip } from "@/components/app/chip";
import { GenderButton } from "@/components/app/gender-button";
import { Header } from "@/components/app/header";
import { NameEditor } from "@/components/app/name-editor";
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
  MAX_CLASSES_PER_PLAYER,
  MAX_RACES_PER_PLAYER,
  MIN_LEVEL,
  RACES,
} from "@/lib/constants";
import { useT } from "@/lib/i18n/store";
import { usePlayerIdentityStore } from "@/lib/player-identity";
import type { Gender, MunchkinClass, MunchkinRace } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OnlinePlayerEdit() {
  const t = useT();
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cameFromCombat = searchParams.get("from") === "combat";
  const backPath = cameFromCombat
    ? `/online/${roomId}?tab=combat`
    : `/online/${roomId}`;
  const requesterId = usePlayerIdentityStore((s) => s.playerId);

  const room = useQuery(
    api.rooms.getRoom,
    roomId ? { roomId: roomId as Id<"rooms"> } : "skip",
  );
  const updatePlayer = useMutation(api.rooms.updatePlayer);
  const removePlayer = useMutation(api.rooms.removePlayer);
  const setMainCombatant = useMutation(api.rooms.setMainCombatant);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!roomId || !playerId) {
    return null;
  }

  if (room === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-muted-foreground">
        {t.waitingRoom.loading}
      </div>
    );
  }

  if (room === null) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">{t.waitingRoom.roomNotFound}</p>
        <Button onClick={() => navigate("/")}>{t.waitingRoom.backHome}</Button>
      </div>
    );
  }

  const target = room.players.find((p) => p.playerId === playerId);
  const viewer = room.players.find((p) => p.playerId === requesterId);

  if (!target) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 text-center bg-background text-foreground">
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground">{t.heroEdit.heroNotFound}</p>
          <Button onClick={() => navigate(backPath)}>
            {t.heroEdit.backToParty}
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = Boolean(
    viewer && (viewer.playerId === target.playerId || viewer.isHost),
  );
  const canRemove = Boolean(
    viewer && viewer.isHost && target.playerId !== viewer.playerId,
  );

  async function commitPatch(
    patch: Parameters<typeof updatePlayer>[0]["patch"],
  ) {
    if (!canEdit) {
      return;
    }

    setError(null);

    try {
      await updatePlayer({
        roomId: roomId as Id<"rooms">,
        requesterId,
        targetId: target!.playerId,
        patch,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  async function handleRemove() {
    if (!canRemove) {
      return;
    }

    setError(null);

    try {
      await removePlayer({
        roomId: roomId as Id<"rooms">,
        requesterId,
        targetId: target!.playerId,
      });
      navigate(`/online/${roomId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  async function handleEnterCombat() {
    setError(null);

    try {
      await setMainCombatant({
        roomId: roomId as Id<"rooms">,
        requesterId,
        targetId: target!.playerId,
      });
      navigate(`/online/${roomId}?tab=combat`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  function handleGender(next: Gender) {
    const nextGender = target!.gender === next ? null : next;
    commitPatch({ gender: nextGender });
  }

  function handleLevelChange(delta: number) {
    const next = Math.max(
      MIN_LEVEL,
      Math.min(room!.maxLevel, target!.level + delta),
    );
    commitPatch({ level: next });
  }

  function handleGearChange(delta: number) {
    commitPatch({ gear: target!.gear + delta });
  }

  function toggleRace(race: MunchkinRace) {
    const current = target!.races;

    if (current.includes(race)) {
      commitPatch({ races: current.filter((r) => r !== race) });

      return;
    }

    if (current.length >= MAX_RACES_PER_PLAYER) {
      return;
    }

    commitPatch({ races: [...current, race] });
  }

  function toggleClass(klass: MunchkinClass) {
    const current = target!.classes;

    if (current.includes(klass)) {
      commitPatch({ classes: current.filter((c) => c !== klass) });

      return;
    }

    if (current.length >= MAX_CLASSES_PER_PLAYER) {
      return;
    }

    commitPatch({ classes: [...current, klass] });
  }

  const strength = target.level + target.gear;
  const avatarColor = target.color ?? AVATAR_COLORS[0];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header
        title={t.heroEdit.editHero}
        onBack={() => navigate(backPath)}
        right={
          canRemove ? (
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
                    {t.heroEdit.confirmRemoveTitle(target.name)}
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
          ) : (
            <div className="size-11" aria-hidden />
          )
        }
      />
      <div className="max-w-md mx-auto w-full px-4 pb-8 flex flex-col">
        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <div
              className="size-28 rounded-full flex items-center justify-center"
              style={{ backgroundColor: avatarColor }}
              aria-hidden
            >
              <span className="font-munchkin text-6xl text-background leading-none">
                {avatarInitial(target.name)}
              </span>
            </div>
            {canEdit && (
              <button
                type="button"
                aria-label={t.heroEdit.chooseAvatarColor}
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((v) => !v)}
                className="absolute -bottom-1 -right-1 size-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-foreground hover:bg-accent transition-colors"
              >
                <Palette className="size-4" />
              </button>
            )}
          </div>

          {canEdit && pickerOpen && (
            <div className="mt-4 px-2 py-4 rounded-xl border border-border bg-card/70 flex items-center gap-2 flex-wrap justify-center">
              {AVATAR_COLORS.map((c) => {
                const selected = target.color === c;

                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={t.heroEdit.pickColor}
                    aria-pressed={selected}
                    onClick={() => {
                      commitPatch({ color: c });
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

          {canEdit ? (
            <NameEditor
              name={target.name}
              onRename={(name) => commitPatch({ name })}
            />
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-3xl font-munchkin">{target.name}</span>
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <GenderButton
              active={target.gender === "male"}
              gender={target.gender}
              label={t.heroEdit.male}
              onClick={() => handleGender("male")}
              disabled={!canEdit}
            >
              <Mars
                className={cn(
                  "size-8",
                  target.gender === "male"
                    ? "text-background"
                    : "text-foreground",
                )}
              />
            </GenderButton>
            <GenderButton
              active={target.gender === "female"}
              gender={target.gender}
              label={t.heroEdit.female}
              onClick={() => handleGender("female")}
              disabled={!canEdit}
            >
              <Venus
                className={cn(
                  "size-8",
                  target.gender === "female"
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
            value={target.level}
            onDown={() => handleLevelChange(-1)}
            onUp={() => handleLevelChange(1)}
            downDisabled={!canEdit || target.level <= MIN_LEVEL}
            upDisabled={!canEdit || target.level >= room.maxLevel}
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
            value={target.gear}
            onDown={() => handleGearChange(-1)}
            onUp={() => handleGearChange(1)}
            downDisabled={!canEdit}
            upDisabled={!canEdit}
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {t.heroEdit.raceSlots(target.races.length, MAX_RACES_PER_PLAYER)}
          </span>
          <div className="flex flex-wrap gap-2">
            {RACES.map((r) => {
              const Icon = r.icon;
              const active = target.races.includes(r.id);

              return (
                <Chip
                  key={r.id}
                  active={active}
                  onClick={() => toggleRace(r.id)}
                  disabled={!canEdit}
                >
                  <Icon className="size-4" aria-hidden />
                  {t.heroEdit.races[r.id]}
                </Chip>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            {t.heroEdit.classSlots(
              target.classes.length,
              MAX_CLASSES_PER_PLAYER,
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => {
              const Icon = c.icon;
              const active = target.classes.includes(c.id);

              return (
                <Chip
                  key={c.id}
                  active={active}
                  onClick={() => toggleClass(c.id)}
                  disabled={!canEdit}
                >
                  <Icon className="size-4" aria-hidden />
                  {t.heroEdit.classes[c.id]}
                </Chip>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-sm text-muted-foreground mt-4">{error}</p>
        )}

        <Button size="lg" className="w-full mt-8" onClick={handleEnterCombat}>
          <Swords className="size-5" /> {t.heroEdit.enterCombat}
        </Button>
      </div>
    </div>
  );
}
