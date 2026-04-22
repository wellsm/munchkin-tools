import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  label: string
  value: number
  onDown: () => void
  onUp: () => void
  downDisabled?: boolean
  upDisabled?: boolean
}

export function StatCard({ label, value, onDown, onUp, downDisabled, upDisabled }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col items-center">
      <span className="text-xs tracking-widest uppercase text-muted-foreground font-munchkin">
        {label}
      </span>
      <span className="font-munchkin text-4xl tabular-nums leading-none my-3">{value}</span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onDown}
          disabled={downDisabled}
          aria-label={`Decrease ${label}`}
        >
          <ChevronDown className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onUp}
          disabled={upDisabled}
          aria-label={`Increase ${label}`}
        >
          <ChevronUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}
