import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/app/header";
import { useT } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";
import { MainCombatantPickerSheet } from "./main-combatant-picker-sheet";

export function WhoFightsView() {
  const t = useT();
  const players = useMunchkinStore((s) => s.players);
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  if (players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">{t.combat.addHeroesFirst}</p>
      </div>
    );
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);

    if (!next) {
      navigate("/offline?tab=players");
    }
  }

  return (
    <div className="h-full flex flex-col">
      <Header title={t.combat.title} />
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 text-center">
        <p className="font-munchkin text-2xl text-muted-foreground">
          {t.combat.whoFights}
        </p>
      </div>

      <MainCombatantPickerSheet open={open} onOpenChange={handleOpenChange} />
    </div>
  );
}
