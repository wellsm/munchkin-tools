import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  active: boolean;
  size?: 'sm' | 'default';
  children: ReactNode
  onClick?: () => void
}

export function Chip({ active, size = 'default', children, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-transparent text-foreground border-border hover:bg-accent',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'default' && 'px-4 py-2 text-base',
      )}
    >
      {children}
    </button>
  )
}
