import { Mars, Venus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { classById, raceById } from "@/lib/constants";
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { calculateStrength } from "@/lib/strength";
import type { Player } from "@/lib/types";
import { StatBox } from "./stat-box";

type Props = {
  player: Player;
  onClick?: () => void;
};

export function HeroRow({ player, onClick }: Props) {
  const navigate = useNavigate();
  const strength = calculateStrength(player);
  const races = player.races
    .map((id) => raceById(id).label.toUpperCase())
    .join(" | ");
  const classes = player.classes
    .map((id) => classById(id).label.toUpperCase())
    .join(" | ");

  return (
    <Button
      variant="ghost"
      onClick={onClick ?? (() => navigate(`/player/${player.id}`))}
      size="lg"
      className="w-full flex items-center gap-3 h-auto py-3 rounded-lg bg-card/50 border border-border/60 hover:bg-accent transition-colors"
    >
      <div
        className="size-12 shrink-0 rounded-full flex items-center justify-center"
        style={{ backgroundColor: playerAvatarColor(player) }}
        aria-hidden
      >
        <span className="font-munchkin text-2xl text-background leading-none">
          {avatarInitial(player.name)}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-munchkin truncate">{player.name}</span>
          {player.gender === "male" && (
            <Mars
              className="size-4 text-muted-foreground shrink-0"
              aria-label="Male"
            />
          )}
          {player.gender === "female" && (
            <Venus
              className="size-4 text-muted-foreground shrink-0"
              aria-label="Female"
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground truncate">
            {races}
          </span>
          <span className="text-sm text-muted-foreground truncate">
            {classes}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <StatBox value={player.level} label="LVL" />
        <StatBox value={player.gear} label="GEAR" />
        <StatBox value={strength} label="STR" highlighted />
      </div>
    </Button>
  );
}
