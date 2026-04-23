import { cn } from '@/lib/utils'

type Props = {
  value: number
  label: string
  highlighted?: boolean
}

export function StatBox({ value, label, highlighted }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:gap-2 sm:w-24 items-center justify-between rounded-md border px-2.5 py-1.5 min-w-12',
        highlighted ? 'border-primary/60 bg-primary/10' : 'border-border/60',
      )}
    >
      <span
        className={cn(
          'font-mono text-xl leading-none tabular-nums',
          highlighted ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
      <span className="text-[10px] sm:text-xs tracking-wider uppercase text-muted-foreground leading-none mt-0.5">
        {label}
      </span>
    </div>
  )
}
