import { cn } from "@/lib/utils";
import { classById, raceById } from "../constants";
import type { GridDensity } from "../lib/grid-layout";
import { calculateStrength } from "../lib/strength";
import type { Player } from "../types";

type Props = {
  player: Player;
  density: GridDensity;
  onClick?: () => void;
};

const NAME_SIZE: Record<GridDensity, string> = {
  loose: "text-3xl",
  normal: "text-2xl",
  dense: "text-xl",
};

const STRENGTH_SIZE: Record<GridDensity, string> = {
  loose: "text-7xl",
  normal: "text-6xl",
  dense: "text-5xl",
};

const CORNER_TEXT_SIZE: Record<GridDensity, string> = {
  loose: "text-lg",
  normal: "text-base",
  dense: "text-sm",
};

const PADDING: Record<GridDensity, string> = {
  loose: "p-6",
  normal: "p-4",
  dense: "p-3",
};

const ICON_WRAP_SIZE: Record<GridDensity, string> = {
  loose: "size-10",
  normal: "size-9",
  dense: "size-8",
};

const ICON_SIZE: Record<GridDensity, string> = {
  loose: "size-6",
  normal: "size-5",
  dense: "size-4",
};

function formatItemBonus(n: number): string {
  if (n > 0) {
    return `+${n}`;
  }

  if (n < 0) {
    return String(n);
  }

  return "0";
}

export function PlayerCard({ player, density, onClick }: Props) {
  const strength = calculateStrength(player);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-2xl border border-border bg-card text-card-foreground text-left shadow-sm hover:bg-accent transition-colors w-full h-full min-w-0 overflow-hidden",
        PADDING[density],
      )}
    >
      <div className="flex items-start justify-between w-full gap-2 absolute top-0 left-0 p-3">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <span
            className={cn(
              "font-semibold tabular-nums text-muted-foreground",
              CORNER_TEXT_SIZE[density],
            )}
          >
            {formatItemBonus(player.itemBonus)}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 min-w-0">
          <span
            className={cn(
              "font-semibold tabular-nums text-muted-foreground",
              CORNER_TEXT_SIZE[density],
            )}
          >
            Nv {player.level}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-1 w-full min-w-0">
        <span
          className={cn(
            "font-semibold text-center truncate max-w-full",
            NAME_SIZE[density],
          )}
        >
          {player.name}
        </span>
        <span
          className={cn(
            "font-bold tabular-nums leading-none",
            STRENGTH_SIZE[density],
          )}
        >
          {strength}
        </span>
      </div>

      <div className="flex justify-between absolute bottom-0 left-0 w-full p-3">
        <div className="flex flex-wrap gap-1">
          {player.classes.map((id) => {
            const entry = classById(id);
            const Icon = entry.icon;

            return (
              <span
                key={id}
                title={entry.label}
                className={cn(
                  "inline-flex items-center justify-center rounded-full bg-primary/10 text-primary",
                  ICON_WRAP_SIZE[density],
                )}
              >
                <Icon className={ICON_SIZE[density]} aria-hidden />
              </span>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-end gap-1 ">
          {player.races.map((id) => {
            const entry = raceById(id);
            const Icon = entry.icon;

            return (
              <span
                key={id}
                title={entry.label}
                className={cn(
                  "inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground",
                  ICON_WRAP_SIZE[density],
                )}
              >
                <Icon className={ICON_SIZE[density]} aria-hidden />
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
