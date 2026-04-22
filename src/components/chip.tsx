import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  active: boolean
  children: ReactNode
  onClick: () => void
}

export function Chip({ active, children, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-base transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-transparent text-foreground border-border hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}
