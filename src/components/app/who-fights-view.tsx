import { useNavigate } from "react-router-dom";
import { Header } from "@/components/app/header";
import { HeroRow } from "@/components/app/hero-row";
import { useT } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";

export function WhoFightsView() {
  const t = useT();
  const { players, setMainCombatant } = useMunchkinStore();
  const navigate = useNavigate();

  const setHero = (id: string) => {
    setMainCombatant(id);
    navigate(`?tab=combat`);
  };

  if (players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">
          {t.combat.addHeroesFirst}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header title={t.combat.title} />
      <div className="h-full overflow-auto p-4 max-w-md mx-auto w-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-base tracking-wider uppercase text-muted-foreground shrink-0">
            {t.combat.whoFights}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <ul className="flex flex-col gap-3">
          {players.map((p) => (
            <HeroRow key={p.id} player={p} onClick={() => setHero(p.id)} />
          ))}
        </ul>
      </div>
    </div>
  );
}
