import { cn } from '@/lib/utils'

type Props = {
  partyTotal: number
  monsterTotal: number
}

export function VersusBadge({ partyTotal, monsterTotal }: Props) {
  const diff = partyTotal - monsterTotal
  const winning = diff > 0

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border px-3 py-1.5 font-munchkin text-2xl tabular-nums',
        winning
          ? 'border-primary/60 text-primary'
          : 'border-destructive/60 text-destructive',
      )}
    >
      {winning ? `+${diff}` : diff}
    </span>
  )
}
