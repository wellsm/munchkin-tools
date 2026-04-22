import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "../components/header";
import { HeroRow } from "../components/hero-row";
import { useMunchkinStore } from "../store";

export function PlayersTab() {
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
        <p className="text-muted-foreground">No heroes yet.</p>
        <Button onClick={goToAdd}>
          <Plus className="size-5" /> Add hero
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Header title="Munchkins" />
      <div className="overflow-auto p-4 pb-24">

        <ul className="flex flex-col gap-3">
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
          aria-label="Add hero"
        >
          <Plus className="size-7" />
        </Button>
      )}
    </div>
  );
}
