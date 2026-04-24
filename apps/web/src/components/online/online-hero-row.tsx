import { Crown, Mars, Venus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Doc } from "@munchkin-tools/convex/convex/_generated/dataModel";
import { Chip } from "@/components/app/chip";
import { StatBox } from "@/components/app/stat-box";
import { Button } from "@/components/ui/button";
import { avatarInitial, playerAvatarColor } from "@/lib/avatar-color";
import { DEFAULT_RACE, classById, raceById } from "@/lib/constants";
import { useT } from "@/lib/i18n/store";
import { cn } from "@/lib/utils";

type RoomPlayer = Doc<"rooms">["players"][number];

type Props = {
  player: RoomPlayer;
  roomId: string;
  isMe?: boolean;
  onClick?: () => void;
};

export function OnlineHeroRow({ player, roomId, isMe = false, onClick }: Props) {
  const t = useT();
  const navigate = useNavigate();
  const strength = player.level + player.gear;
  const races =
    player.races.length === 0
      ? t.heroEdit.races.human.toUpperCase()
      : player.races
          .map((id) => t.heroEdit.races[id].toUpperCase())
          .join(" | ");
  const classes = player.classes
    .map((id) => t.heroEdit.classes[id].toUpperCase())
    .join(" | ");

  const avatarBg = playerAvatarColor({
    id: player.playerId,
    color: player.color ?? undefined,
  });

  return (
    <Button
      variant="ghost"
      onClick={
        onClick ??
        (() => navigate(`/online/${roomId}/player/${player.playerId}`))
      }
      size="lg"
      className={cn(
        "w-full flex items-center gap-3 h-auto py-3 rounded-lg bg-card/50 hover:bg-accent transition-colors border",
        isMe
          ? "ring-1 ring-primary/30"
          : "border-border/60",
      )}
    >
      <div
        className="size-12 shrink-0 rounded-full flex items-center justify-center"
        style={{ backgroundColor: avatarBg }}
        aria-hidden
      >
        <span className="font-munchkin text-2xl text-background leading-none">
          {avatarInitial(player.name)}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-munchkin truncate">{player.name}</span>
          {player.isHost && (
            <Crown
              className="size-4 text-primary shrink-0"
              aria-label={t.waitingRoom.hostBadge}
            />
          )}
          {isMe && (
            <span className="text-xs text-muted-foreground shrink-0">
              {t.waitingRoom.youLabel}
            </span>
          )}
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
          <span className="text-sm text-muted-foreground truncate hidden xl:flex gap-2">
            {player.races.length === 0 ? (
              <Chip active size="sm" color={DEFAULT_RACE.color}>
                <DEFAULT_RACE.icon className="size-4" aria-hidden />
                {t.heroEdit.races.human}
              </Chip>
            ) : (
              player.races.map((r) => {
                const Icon = raceById(r).icon;
                const { color } = raceById(r);

                return (
                  <Chip key={r} active size="sm" color={color}>
                    <Icon className="size-4" aria-hidden />
                    {t.heroEdit.races[r]}
                  </Chip>
                );
              })
            )}
          </span>
          <span className="text-sm text-muted-foreground truncate xl:hidden">
            {races}
          </span>
          <span className="text-sm text-muted-foreground truncate hidden xl:flex gap-2">
            {player.classes.map((c) => {
              const Icon = classById(c).icon;

              return (
                <Chip key={c} active size="sm">
                  <Icon className="size-4" aria-hidden />
                  {t.heroEdit.classes[c]}
                </Chip>
              );
            })}
          </span>
          <span className="text-sm text-muted-foreground truncate xl:hidden">
            {classes}
          </span>
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
