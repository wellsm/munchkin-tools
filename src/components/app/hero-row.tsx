import { Mars, Venus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatBox } from "@/components/app/stat-box";
import { Button } from "@/components/ui/button";
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { classById, raceById } from "@/lib/constants";
import { useT } from "@/lib/i18n/store";
import { calculateStrength } from "@/lib/strength";
import type { Player } from "@/lib/types";
import { Chip } from "./chip";

type Props = {
  player: Player;
  onClick?: () => void;
};

export function HeroRow({ player, onClick }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const strength = calculateStrength(player);
  const races = player.races
    .map((id) => t.heroEdit.races[id].toUpperCase())
    .join(" | ");
  const classes = player.classes
    .map((id) => t.heroEdit.classes[id].toUpperCase())
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
              aria-label={t.heroEdit.male}
            />
          )}
          {player.gender === "female" && (
            <Venus
              className="size-4 text-muted-foreground shrink-0"
              aria-label={t.heroEdit.female}
            />
          )}
        </div>
        <div className="flex flex-col items-start sm:gap-2">
          <span className="text-sm text-muted-foreground truncate hidden sm:flex gap-2">
            {
              player.races.map((r) => {
                const Icon = raceById(r).icon;

                return (
                  <Chip key={r} active size="sm">
                    <Icon className="size-4" aria-hidden />
                    {t.heroEdit.races[r]}
                  </Chip>
                );
              })
            }
          </span>
          <span className="text-sm text-muted-foreground truncate sm:hidden">{races}</span>
          <span className="text-sm text-muted-foreground truncate hidden sm:flex gap-2">
            {
              player.classes.map((r) => {
                const Icon = classById(r).icon;

                return (
                  <Chip key={r} active size="sm">
                    <Icon className="size-4" aria-hidden />
                    {t.heroEdit.classes[r]}
                  </Chip>
                );
              })
            }
          </span>
          <span className="text-sm text-muted-foreground truncate sm:hidden">{classes}</span>
        </div>
      </div>

      <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
        <StatBox value={player.level} label={t.heroes.lvlShort} />
        <StatBox value={player.gear} label={t.heroes.gearShort} />
        <StatBox value={strength} label={t.heroes.strShort} highlighted />
      </div>
    </Button>
  );
}
