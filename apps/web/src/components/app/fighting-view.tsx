import { Flag, Plus, Skull, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { combatTotals } from "@/lib/combat";
import { useT } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";
import type { Player } from "@/lib/types";
import { FinishSheet } from "@/components/app/finish-sheet";
import { Header } from "@/components/app/header";
import { HelperPickerSheet } from "./helper-picker-sheet";
import { StepperCard } from "./stepper-card";
import { VersusBadge } from "./versus-badge";

export function FightingView() {
  const t = useT();
  const navigate = useNavigate();
  const players = useMunchkinStore((s) => s.players);
  const combat = useMunchkinStore((s) => s.combat);
  const setMainCombatant = useMunchkinStore((s) => s.setMainCombatant);
  const removeHelper = useMunchkinStore((s) => s.removeHelper);
  const setPartyModifier = useMunchkinStore((s) => s.setPartyModifier);
  const setMonsterLevel = useMunchkinStore((s) => s.setMonsterLevel);
  const setMonsterModifier = useMunchkinStore((s) => s.setMonsterModifier);
  const resetCombat = useMunchkinStore((s) => s.resetCombat);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);

  const main = players.find((p) => p.id === combat.mainCombatantId);
  const helpers = combat.helperIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => p !== undefined);

  if (!main) {
    setMainCombatant(null);

    return null;
  }

  const result = combatTotals(players, combat);
  const hasHelper = helpers.length > 0;
  const canAddHelper = helpers.length < 1;

  function handleFled() {
    resetCombat();
    navigate("/offline?tab=players");
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={t.combat.title} onBack={() => setMainCombatant(null)} />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-8 max-w-md mx-auto w-full flex flex-col gap-4">
        <section className="rounded-xl border border-border/60 bg-card/50 p-5">
          <div className="grid grid-cols-3 gap-2 items-start">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {t.combat.party}
              </span>
              <span className="font-munchkin text-6xl text-primary tabular-nums leading-none mt-2">
                {result.partyTotal}
              </span>
              <span className="text-sm text-muted-foreground mt-2">
                {main.name} · L{main.level} +G{main.gear}
              </span>
              <div className="flex gap-2 mt-3 justify-center flex-wrap">
                <div
                  className="size-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: playerAvatarColor(main) }}
                  aria-hidden
                >
                  <span className="font-munchkin text-lg text-background leading-none">
                    {avatarInitial(main.name)}
                  </span>
                </div>
                {helpers.map((h) => (
                  <div
                    key={h.id}
                    className="size-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: playerAvatarColor(h) }}
                    aria-hidden
                  >
                    <span className="font-munchkin text-lg text-background leading-none">
                      {avatarInitial(h.name)}
                    </span>
                  </div>
                ))}
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

            <div className="flex flex-col items-center text-center gap-1 pt-6">
              <span className="text-xs tracking-widest text-muted-foreground">
                {t.combat.vs}
              </span>
              <VersusBadge
                partyTotal={result.partyTotal}
                monsterTotal={result.monsterTotal}
              />
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                {t.combat.monster}
              </span>
              <span className="font-munchkin text-6xl text-foreground tabular-nums leading-none mt-2">
                {combat.monsterLevel + combat.monsterModifier}
              </span>
              <span className="text-sm text-muted-foreground mt-2">
                {t.combat.levelFormat(combat.monsterLevel)}
              </span>
              <div className="size-10 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center mt-3 mx-auto">
                <Skull className="size-5 text-destructive" />
              </div>
            </div>
          </div>
        </section>

        <StepperCard
          label={t.combat.monsterLevel}
          value={combat.monsterLevel}
          onChange={setMonsterLevel}
          decreaseDisabled={combat.monsterLevel <= 0}
        />
        <StepperCard
          label={t.combat.partyModifiers}
          value={combat.partyModifier}
          onChange={setPartyModifier}
        />
        <StepperCard
          label={t.combat.monsterModifiers}
          value={combat.monsterModifier}
          onChange={setMonsterModifier}
        />

        {hasHelper && (
          <Button
            variant="outline"
            onClick={() => helpers.forEach((h) => removeHelper(h.id))}
          >
            <UserMinus className="size-4" /> {t.combat.removeHelper}
          </Button>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleFled}
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-5" /> {t.combat.fled}
          </Button>
          <Button onClick={() => setFinishOpen(true)}>
            <Flag className="size-5" /> {t.combat.finish}
          </Button>
        </div>

        <HelperPickerSheet open={pickerOpen} onOpenChange={setPickerOpen} />

        <FinishSheet open={finishOpen} onOpenChange={setFinishOpen} />
      </div>
    </div>
  );
}
