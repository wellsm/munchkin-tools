import { Minus, Plus } from 'lucide-react'
import { EditableNumber } from '@/components/app/editable-number'

type Props = {
  label: string
  value: number
  onChange: (n: number) => void
  decreaseDisabled?: boolean
  increaseDisabled?: boolean
  editDisabled?: boolean
  min?: number
  max?: number
  hint?: string
}

export function StepperCard({
  label,
  value,
  onChange,
  decreaseDisabled,
  increaseDisabled,
  editDisabled,
  min,
  max,
  hint,
}: Props) {
  return (
    <section className="rounded-xl border border-border/60 bg-card/50 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-base tracking-widest uppercase text-muted-foreground font-munchkin min-w-0 truncate">
          {label}
        </span>
        <div className="flex items-center rounded-md border border-border/60 overflow-hidden shrink-0">
          <button
            type="button"
            aria-label={`Decrease ${label}`}
            onClick={() => onChange(value - 1)}
            disabled={decreaseDisabled}
            className="px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="size-4" />
          </button>
          <EditableNumber
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            disabled={editDisabled}
            ariaLabel={label}
            className="px-2 py-2 font-munchkin text-primary text-xl tabular-nums min-w-8 text-center hover:text-primary/80 transition-colors"
          />
          <button
            type="button"
            aria-label={`Increase ${label}`}
            onClick={() => onChange(value + 1)}
            disabled={increaseDisabled}
            className="px-2 py-2 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </section>
  )
}
