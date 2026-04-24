import type { ReactNode } from 'react'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  onEdit?: () => void
  empty: boolean
  emptyChip?: ReactNode
  chips: ReactNode
  className?: string
}

export function SelectionDisplay({ label, onEdit, empty, emptyChip, chips, className }: Props) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {onEdit && <Pencil className="size-4 text-muted-foreground" aria-hidden />}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {empty ? emptyChip : chips}
      </div>
    </>
  )

  if (onEdit) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          'w-full text-left rounded-xl border border-border/60 bg-card/50 p-4 hover:bg-accent transition-colors',
          className,
        )}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border/60 bg-card/50 p-4',
        className,
      )}
    >
      {body}
    </div>
  )
}
