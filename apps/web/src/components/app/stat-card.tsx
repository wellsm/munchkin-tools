import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditableNumber } from '@/components/app/editable-number'

type Props = {
  label: string
  value: number
  onDown: () => void
  onUp: () => void
  downDisabled?: boolean
  upDisabled?: boolean
  onChange?: (next: number) => void
  min?: number
  max?: number
  editDisabled?: boolean
}

export function StatCard({
  label,
  value,
  onDown,
  onUp,
  downDisabled,
  upDisabled,
  onChange,
  min,
  max,
  editDisabled,
}: Props) {
  const valueClass = 'font-munchkin text-4xl tabular-nums leading-none my-3'

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col items-center">
      <span className="text-xs tracking-widest uppercase text-muted-foreground font-munchkin">
        {label}
      </span>
      {onChange ? (
        <EditableNumber
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={editDisabled}
          ariaLabel={label}
          className={valueClass}
        />
      ) : (
        <span className={valueClass}>{value}</span>
      )}
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
