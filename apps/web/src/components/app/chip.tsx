import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  active: boolean;
  size?: 'sm' | 'default';
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Chip({ active, size = 'default', children, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
