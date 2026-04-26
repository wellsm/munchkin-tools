import { Flag, Plus, Skull, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "@munchkin-tools/convex/convex/_generated/api";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Header } from "@/components/app/header";
import { StepperCard } from "@/components/app/stepper-card";
import { VersusBadge } from "@/components/app/versus-badge";
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
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { combatTotals } from "@/lib/combat";
import { useT } from "@/lib/i18n/store";
import { usePlayerIdentityStore } from "@/lib/player-identity";
import { useDebouncedServerValue } from "@/lib/use-debounced-server-value";
import { cn } from "@/lib/utils";
import { NotificationButton } from "./notification-button";
import { OnlineFinishSheet } from "./online-finish-sheet";
import { OnlineHelperPickerSheet } from "./online-helper-picker-sheet";

type Room = Doc<"rooms">;
type RoomPlayer = Room["players"][number];

type Props = {
  room: Room;
};

function toCombatPlayer(p: RoomPlayer) {
  return {
    id: p.playerId,
    name: p.name,
    level: p.level,
    gear: p.gear,
    gender: p.gender,
    color: p.color ?? undefined,
    classes: p.classes,
    races: p.races,
  };
}

export function OnlineFightingView({ room }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const requesterId = usePlayerIdentityStore((s) => s.playerId);

  const setMainCombatant = useMutation(api.rooms.setMainCombatant);
  const clearHelpers = useMutation(api.rooms.clearHelpers);
  const setPartyModifier = useMutation(api.rooms.setPartyModifier);
  const setMonsterLevel = useMutation(api.rooms.setMonsterLevel);
  const setMonsterModifier = useMutation(api.rooms.setMonsterModifier);
  const resetCombat = useMutation(api.rooms.resetCombat);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { combat, players } = room;

  const [localMonsterLevel, setLocalMonsterLevel] = useDebouncedServerValue(
    combat.monsterLevel,
    async (next) => {
      try {
        await setMonsterLevel({ roomId: room._id, requesterId, value: next });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
  );
  const [localPartyMod, setLocalPartyMod] = useDebouncedServerValue(
    combat.partyModifier,
    async (next) => {
      try {
        await setPartyModifier({ roomId: room._id, requesterId, value: next });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
  );
  const [localMonsterMod, setLocalMonsterMod] = useDebouncedServerValue(
    combat.monsterModifier,
    async (next) => {
      try {
        await setMonsterModifier({ roomId: room._id, requesterId, value: next });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
  );

  const main = players.find((p) => p.playerId === combat.mainCombatantId);
  const helpers = combat.helperIds
    .map((id) => players.find((p) => p.playerId === id))
    .filter((p): p is RoomPlayer => p !== undefined);

  if (!main) {
    void setMainCombatant({ roomId: room._id, requesterId, targetId: null });

    return null;
  }

  const localCombat = {
    ...combat,
    monsterLevel: localMonsterLevel,
    partyModifier: localPartyMod,
    monsterModifier: localMonsterMod,
  };
  const result = combatTotals(players.map(toCombatPlayer), localCombat);
  const hasHelper = helpers.length > 0;
  const me = players.find((p) => p.playerId === requesterId);
  const isHost = me?.isHost ?? false;
  const isMain = main.playerId === requesterId;
  const isHelper = combat.helperIds.includes(requesterId);
  const canControl = isMain || isHelper || isHost;
  const canAddHelper = isHost && helpers.length < 1;

  function runMutation<T>(fn: () => Promise<T>) {
    setError(null);
    fn().catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    });
  }

  async function handleFled() {
    try {
      await resetCombat({ roomId: room._id, requesterId });
      navigate(`/online/${room._id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }

  function handleBack() {
    runMutation(() =>
      setMainCombatant({ roomId: room._id, requesterId, targetId: null }),
    );
  }

  function handleRemoveHelper() {
    runMutation(() => clearHelpers({ roomId: room._id, requesterId }));
  }

  const mainAvatarBg = playerAvatarColor({
    id: main.playerId,
    color: main.color ?? undefined,
  });

  return (
    <div className="h-full flex flex-col">
      <Header title={t.combat.title} onBack={handleBack} right={<NotificationButton room={room} />} />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-8 max-w-md mx-auto w-full flex flex-col gap-4">
        <section className="rounded-xl border border-border/60 bg-card/50 p-5 relative">
          <div className="flex w-full justify-between gap-2 items-start">
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {t.combat.party}
              </span>
              <span className="font-munchkin text-6xl text-primary tabular-nums leading-none mt-2">
                {result.partyTotal}
              </span>
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                <AvatarSlot
                  roomId={room._id}
                  player={main}
                  bg={mainAvatarBg}
                  isMe={main.playerId === requesterId}
                  canEdit={isHost || main.playerId === requesterId}
                />
                {helpers.map((h) => {
                  const bg = playerAvatarColor({
                    id: h.playerId,
                    color: h.color ?? undefined,
                  });
                  const isMeHelper = h.playerId === requesterId;

                  return (
                    <AvatarSlot
                      key={h.playerId}
                      roomId={room._id}
                      player={h}
                      bg={bg}
                      isMe={isMeHelper}
                      canEdit={isHost || isMeHelper}
                    />
                  );
                })}
                {canAddHelper && (
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    aria-label={t.combat.addHelper}
                    className="size-10 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  >
                    <Plus className="size-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center text-center gap-1 pt-6">
              <span className="text-xs tracking-widest text-muted-foreground">
                {t.combat.vs}
              </span>
              <VersusBadge
                partyTotal={result.partyTotal}
                monsterTotal={result.monsterTotal}
              />
            </div>

            <div className="flex flex-1 flex-col items-center text-center">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {t.combat.monster}
              </span>
              <span className="font-munchkin text-6xl text-foreground tabular-nums leading-none mt-2">
                {localMonsterLevel + localMonsterMod}
              </span>
              <div className="size-10 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center mt-3 mx-auto">
                <Skull className="size-5 text-destructive" />
              </div>
            </div>
          </div>
        </section>

        <StepperCard
          label={t.combat.monsterLevel}
          value={localMonsterLevel}
          onChange={setLocalMonsterLevel}
          decreaseDisabled={!canControl || localMonsterLevel <= 0}
          increaseDisabled={!canControl}
        />
        <StepperCard
          label={t.combat.partyModifiers}
          value={localPartyMod}
          onChange={setLocalPartyMod}
          decreaseDisabled={!canControl}
          increaseDisabled={!canControl}
        />
        <StepperCard
          label={t.combat.monsterModifiers}
          value={localMonsterMod}
          onChange={setLocalMonsterMod}
          decreaseDisabled={!canControl}
          increaseDisabled={!canControl}
        />

        {hasHelper && (
          <Button variant="outline" onClick={handleRemoveHelper} disabled={!canControl}>
            <UserMinus className="size-4" /> {t.combat.removeHelper}
          </Button>
        )}

        {error && (
          <p className="text-sm text-muted-foreground">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!canControl}
                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-5" /> {t.combat.fled}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-munchkin text-2xl">
                  {t.combat.fledTitle}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t.combat.fledDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleFled}>
                  {t.combat.fledConfirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => setFinishOpen(true)} disabled={!canControl}>
            <Flag className="size-5" /> {t.combat.finish}
          </Button>
        </div>

        <OnlineHelperPickerSheet
          room={room}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
        />

        <OnlineFinishSheet
          room={room}
          open={finishOpen}
          onOpenChange={setFinishOpen}
        />
      </div>
    </div>
  );
}

type AvatarSlotProps = {
  roomId: string;
  player: RoomPlayer;
  bg: string;
  isMe: boolean;
  canEdit: boolean;
};

function AvatarSlot({ roomId, player, bg, isMe, canEdit }: AvatarSlotProps) {
  const baseClasses = cn(
    "size-10 rounded-full flex items-center justify-center",
    isMe && "ring-2 ring-primary ring-offset-2 ring-offset-card",
  );
  const initial = (
    <span className="font-munchkin text-lg text-background leading-none">
      {avatarInitial(player.name)}
    </span>
  );

  if (!canEdit) {
    return (
      <div className={baseClasses} style={{ backgroundColor: bg }} aria-hidden>
        {initial}
      </div>
    );
  }

  return (
    <Link
      to={`/online/${roomId}/player/${player.playerId}?from=combat`}
      aria-label={player.name}
      className={cn(
        baseClasses,
        "hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-card transition",
      )}
      style={{ backgroundColor: bg }}
    >
      {initial}
    </Link>
  );
}
