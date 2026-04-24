import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/app/header";
import { HeroRow } from "@/components/app/hero-row";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/store";
import { useMunchkinStore } from "@/lib/store";

export function PlayersTab() {
  const t = useT();
  const navigate = useNavigate();
  const players = useMunchkinStore((s) => s.players);
  const maxPlayers = useMunchkinStore((s) => s.settings.maxPlayers);

  const canAdd = players.length < maxPlayers;

  function goToAdd() {
    navigate("/player/new");
  }

  if (players.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">{t.heroes.noHeroes}</p>
        <Button onClick={goToAdd}>
          <Plus className="size-5" /> {t.heroes.addHero}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <Header title={t.heroes.title} />
      <div className="flex-1 min-h-0 overflow-auto p-4 pb-24">
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {players.map((p) => (
            <li key={p.id}>
              <HeroRow player={p} />
            </li>
          ))}
        </ul>
      </div>

      {canAdd && (
        <Button
          size="icon"
          className="absolute bottom-4 right-4 size-14 rounded-full shadow-lg"
          onClick={goToAdd}
          aria-label={t.heroes.addHero}
        >
          <Plus className="size-7" />
        </Button>
      )}
    </div>
  );
}
